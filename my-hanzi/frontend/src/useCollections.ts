import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";

type Wire = MyHanziWireHttp;
type Path = keyof Wire;
export type Collection = Wire["/tags/list"]["output"]["tags"][number];
type ErrorResult = { error: string; detail?: string };

const collections = ref<Collection[]>([]);
const error = ref<string | null>(null);
const loading = ref(false);
const working = ref(false);
const user = getGuestUser();

function getGuestUser() {
  const storageKey = "my-hanzi-guest-user";
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  const created = crypto.randomUUID();
  localStorage.setItem(storageKey, created);
  return created;
}

async function call<T extends object>(
  path: Path,
  request: Promise<T | ErrorResult>,
): Promise<T | ErrorResult> {
  const result = await request;
  return "error" in result ? { error: messageFor(path, result.error) } : result;
}

async function loadTags(): Promise<Collection[] | null> {
  const result = await call("/tags/list", api["/tags/list"]({ user }));
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
    let tags = await loadTags();
    if (tags === null) return false;

    if (!tags.some(({ name }) => name === "Studied")) {
      const created = await api["/tags/create-tag"]({
        user,
        name: "Studied",
      });
      if ("error" in created && created.error !== "CONFLICT") {
        error.value = messageFor("/tags/create-tag", created.error);
        return false;
      }
      tags = await loadTags();
      if (tags === null) return false;
    }
    return true;
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
  return change("/tags/create-tag", api["/tags/create-tag"]({ user, name }));
}

function renameCollection(collection: Collection, name: string) {
  return change(
    "/tags/edit-tag",
    api["/tags/edit-tag"]({ user, tag: collection.tag, name }),
  );
}

function deleteCollection(collection: Collection) {
  return change(
    "/tags/delete-tag",
    api["/tags/delete-tag"]({ user, tag: collection.tag }),
  );
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
  };
}
