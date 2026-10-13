import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
type Path = keyof Wire;
export type Collection = Wire["/tags/list"]["output"]["tags"][number];
export type CollectionId = Collection["tag"];
export type CollectionItem = Wire["/tags/items"]["output"]["items"][number];
type ErrorResult = { error: string; detail?: string };

const { sessionEnded } = useSession();
const collections = ref<Collection[]>([]);
const error = ref<string | null>(null);
const loading = ref(false);
const working = ref(false);

async function call<T extends object>(
  path: Path,
  request: Promise<T | ErrorResult>,
): Promise<T | ErrorResult> {
  const result = await request;
  if ("error" in result && result.error === "UNAUTHORIZED") sessionEnded();
  return "error" in result ? { error: messageFor(path, result.error) } : result;
}

async function loadTags(): Promise<Collection[] | null> {
  const result = await call("/tags/list", api["/tags/list"]());
  if ("error" in result) {
    error.value = result.error;
    return null;
  }
  collections.value = result.tags;
  return result.tags;
}

async function refresh(): Promise<boolean> {
  loading.value = true;
  error.value = null;
  try {
    return (await loadTags()) !== null;
  } finally {
    loading.value = false;
  }
}

async function change<T extends object>(
  path: Path,
  request: Promise<T | ErrorResult>,
): Promise<boolean> {
  if (working.value) return false;
  working.value = true;
  error.value = null;
  try {
    const result = await call(path, request);
    if ("error" in result) {
      error.value = result.error;
      return false;
    }
    return await refresh();
  } finally {
    working.value = false;
  }
}

function createCollection(name: string) {
  return change("/tags/create-tag", api["/tags/create-tag"]({ name }));
}

function renameCollection(collection: Collection, name: string) {
  return change(
    "/tags/edit-tag",
    api["/tags/edit-tag"]({ tag: collection.tag, name }),
  );
}

function deleteCollection(collection: Collection) {
  return change(
    "/tags/delete-tag",
    api["/tags/delete-tag"]({ tag: collection.tag }),
  );
}

async function getCharacterCollections(
  character: string,
): Promise<CollectionId[] | null> {
  const result = await call(
    "/tags/item-membership",
    api["/tags/item-membership"]({ item: character }),
  );
  if ("error" in result) {
    error.value = result.error;
    return null;
  }
  return result.tags.map(({ tag }) => tag);
}

async function getCollectionItems(
  collection: Collection,
): Promise<CollectionItem[] | null> {
  error.value = null;
  const result = await call(
    "/tags/items",
    api["/tags/items"]({ tag: collection.tag }),
  );
  if ("error" in result) {
    error.value = result.error;
    return null;
  }
  return result.items;
}

async function saveCharacterCollections(
  character: string,
  originalTags: CollectionId[],
  selectedTags: CollectionId[],
): Promise<boolean> {
  if (working.value) return false;
  working.value = true;
  error.value = null;
  const original = new Set(originalTags);
  const selected = new Set(selectedTags);
  const additions = selectedTags.filter((tag) => !original.has(tag));
  const removals = originalTags.filter((tag) => !selected.has(tag));
  let failure: string | null = null;

  try {
    for (const tag of additions) {
      const result = await call(
        "/tags/add-item",
        api["/tags/add-item"]({ tag, item: character }),
      );
      if ("error" in result) failure ??= result.error;
    }
    for (const tag of removals) {
      const result = await call(
        "/tags/remove-item",
        api["/tags/remove-item"]({ tag, item: character }),
      );
      if ("error" in result) failure ??= result.error;
    }

    const refreshed = await refresh();
    if (failure) error.value = failure;
    return refreshed && failure === null;
  } finally {
    working.value = false;
  }
}

export function useCollections() {
  return {
    collections,
    error,
    loading,
    working,
    refresh,
    createCollection,
    renameCollection,
    deleteCollection,
    getCharacterCollections,
    getCollectionItems,
    saveCharacterCollections,
  };
}
