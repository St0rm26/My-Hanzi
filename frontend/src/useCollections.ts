import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { isApiError, messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
type Path = keyof Wire;
export type Collection = Wire["/tags/list"]["output"]["tags"][number];
export type CollectionId = Collection["tag"];
export type CollectionItem = Wire["/tags/items"]["output"]["items"][number];
export type SharedUser = Wire["/tags/audience"]["output"]["users"][number];
type CollectionPrivacy = Wire["/tags/audience"]["output"]["isPublic"][number];
export type CollectionSharingState = {
  users: SharedUser[];
  isPublic: boolean;
};
type CallResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code: string };
export type AddItemsResult = {
  added: number;
  skipped: number;
  errors: string[];
};

const { sessionEnded } = useSession();
const collections = ref<Collection[]>([]);
const error = ref<string | null>(null);
const sharingError = ref<string | null>(null);
const loading = ref(false);
const working = ref(false);

async function call<P extends Path>(
  path: P,
  request: Promise<unknown>,
): Promise<CallResult<Wire[P]["output"]>> {
  const result = await request;
  if (isApiError(result)) {
    if (result.error === "UNAUTHORIZED") sessionEnded();
    return {
      ok: false,
      error: messageFor(path, result.error),
      code: result.error,
    };
  }
  return { ok: true, value: result as Wire[P]["output"] };
}

async function loadTags(): Promise<Collection[] | null> {
  const result = await call("/tags/list", api["/tags/list"]());
  if (!result.ok) {
    error.value = result.error;
    return null;
  }
  collections.value = result.value.tags;
  return result.value.tags;
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

async function change<P extends Path>(
  path: P,
  request: Promise<unknown>,
): Promise<boolean> {
  if (working.value) return false;
  working.value = true;
  error.value = null;
  try {
    const result = await call(path, request);
    if (!result.ok) {
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

function shareCollection(collection: Collection, audience: string[]) {
  if (working.value) return Promise.resolve(false);
  working.value = true;
  sharingError.value = null;
  return (async () => {
    try {
      const result = await call(
        "/tags/share",
        api["/tags/share"]({ tag: collection.tag, audience }),
      );
      if (!result.ok) {
        sharingError.value = result.error;
        return false;
      }
      return true;
    } catch (cause) {
      sharingError.value =
        cause instanceof Error ? cause.message : "Could not share collection.";
      return false;
    } finally {
      working.value = false;
    }
  })();
}

async function setCollectionPublic(
  collection: Collection,
  isPublic: boolean,
): Promise<boolean> {
  if (working.value) return false;
  working.value = true;
  sharingError.value = null;
  const path = isPublic ? "/tags/make-public" : "/tags/make-private";
  try {
    const result =
      isPublic
        ? await call(path, api["/tags/make-public"]({ tag: collection.tag }))
        : await call(path, api["/tags/make-private"]({ tag: collection.tag }));
    if (!result.ok) {
      sharingError.value = result.error;
      return false;
    }
    return true;
  } catch (cause) {
    sharingError.value =
      cause instanceof Error ? cause.message : "Could not update collection visibility.";
    return false;
  } finally {
    working.value = false;
  }
}

async function getCharacterCollections(
  character: string,
): Promise<CollectionId[] | null> {
  const result = await call(
    "/tags/item-membership",
    api["/tags/item-membership"]({ item: character }),
  );
  if (!result.ok) {
    error.value = result.error;
    return null;
  }
  return result.value.tags.map(({ tag }) => tag);
}

async function getCollectionItems(
  collection: Collection,
): Promise<CollectionItem[] | null> {
  error.value = null;
  const result = await call(
    "/tags/items",
    api["/tags/items"]({ tag: collection.tag }),
  );
  if (!result.ok) {
    error.value = result.error;
    return null;
  }
  return result.value.items;
}

async function getCollectionAudience(
  collection: Collection,
): Promise<CollectionSharingState | null> {
  error.value = null;
  const result = await call(
    "/tags/audience",
    api["/tags/audience"]({ tag: collection.tag }),
  );
  if (!result.ok) {
    error.value = result.error;
    return null;
  }
  const publicState: CollectionPrivacy | undefined = result.value.isPublic[0];
  return {
    users: result.value.users,
    isPublic: publicState?.isPublic === true,
  };
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
      if (!result.ok) failure ??= result.error;
    }
    for (const tag of removals) {
      const result = await call(
        "/tags/remove-item",
        api["/tags/remove-item"]({ tag, item: character }),
      );
      if (!result.ok) failure ??= result.error;
    }

    const refreshed = await refresh();
    if (failure) error.value = failure;
    return refreshed && failure === null;
  } finally {
    working.value = false;
  }
}

async function addItemsToCollections(
  items: string[],
  targets: Collection[],
  sourceTag?: CollectionId,
): Promise<AddItemsResult | null> {
  if (working.value) return null;
  working.value = true;
  const result: AddItemsResult = { added: 0, skipped: 0, errors: [] };
  const uniqueItems = [...new Set(items)];

  try {
    for (const target of targets) {
      if (target.tag === sourceTag) continue;

      try {
        const current = await call(
          "/tags/items",
          api["/tags/items"]({ tag: target.tag }),
        );
        if (!current.ok) {
          result.errors.push(
            `Could not load "${target.name}": ${current.error}`,
          );
          continue;
        }

        const existing = new Set(
          current.value.items.map(({ item }) => item),
        );
        for (const item of uniqueItems) {
          if (existing.has(item)) {
            result.skipped++;
            continue;
          }

          const added = await call(
            "/tags/add-item",
            api["/tags/add-item"]({ tag: target.tag, item }),
          );
          if (!added.ok) {
            if (added.code === "CONFLICT") {
              result.skipped++;
              continue;
            }
            result.errors.push(
              `Could not add ${item} to "${target.name}": ${added.error}`,
            );
            continue;
          }
          result.added++;
        }
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "The request failed.";
        result.errors.push(`Could not update "${target.name}": ${message}`);
      }
    }
    return result;
  } finally {
    working.value = false;
  }
}

export function useCollections() {
  return {
    collections,
    error,
    sharingError,
    loading,
    working,
    refresh,
    createCollection,
    renameCollection,
    deleteCollection,
    shareCollection,
    setCollectionPublic,
    getCharacterCollections,
    getCollectionItems,
    getCollectionAudience,
    saveCharacterCollections,
    addItemsToCollections,
  };
}
