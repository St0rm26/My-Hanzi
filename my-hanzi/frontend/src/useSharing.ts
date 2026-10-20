import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
export type ShareCandidate = Wire["/users/search"]["output"]["users"][number];
export type SharedCollection =
  Wire["/shares/collections"]["output"]["collections"][number];
export type PublicCollection =
  Wire["/shares/public-collections"]["output"]["collections"][number];
export type SharedTag = Wire["/shares/collection-items"]["input"]["tag"];
export type SharedCollectionItem =
  Wire["/shares/collection-items"]["output"]["items"][number];
type PublicTag = Wire["/shares/public-collection-items"]["input"]["tag"];
type PublicCollectionItem =
  Wire["/shares/public-collection-items"]["output"]["items"][number];
type LoadedSharedCollectionItem = { item: string; addedDate: string };

const { sessionEnded } = useSession();
const searchResults = ref<ShareCandidate[]>([]);
const searching = ref(false);
const error = ref<string | null>(null);
const sharedCollections = ref<SharedCollection[]>([]);
const sharedCollectionsLoading = ref(false);
const sharedCollectionsError = ref<string | null>(null);
const publicCollections = ref<SharedCollection[]>([]);
const publicCollectionsLoading = ref(false);
const publicCollectionsError = ref<string | null>(null);
const sharedCollectionItems = ref<LoadedSharedCollectionItem[]>([]);
const sharedCollectionItemsLoading = ref(false);
const sharedCollectionItemsError = ref<string | null>(null);
const publicCollectionItems = ref<LoadedSharedCollectionItem[]>([]);
const publicCollectionItemsLoading = ref(false);
const publicCollectionItemsError = ref<string | null>(null);
let requestSequence = 0;
let collectionsRequestSequence = 0;
let collectionItemsRequestSequence = 0;
let publicCollectionsRequestSequence = 0;
let publicCollectionItemsRequestSequence = 0;

async function searchUsers(term: string) {
  const query = term.trim();
  const sequence = ++requestSequence;
  searchResults.value = [];
  error.value = null;
  if (!query) {
    searching.value = false;
    return;
  }

  searching.value = true;
  try {
    const result = await api["/users/search"]({ term: query });
    if (sequence !== requestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/users/search", result.error);
      return;
    }
    searchResults.value = result.users;
  } catch (cause) {
    if (sequence === requestSequence) {
      error.value =
        cause instanceof Error ? cause.message : "Could not search users.";
    }
  } finally {
    if (sequence === requestSequence) searching.value = false;
  }
}

function resetSearch() {
  requestSequence++;
  searchResults.value = [];
  searching.value = false;
  error.value = null;
}

async function loadSharedCollections() {
  const sequence = ++collectionsRequestSequence;
  sharedCollections.value = [];
  sharedCollectionsError.value = null;
  sharedCollectionsLoading.value = true;
  try {
    const result = await api["/shares/collections"]();
    if (sequence !== collectionsRequestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      sharedCollectionsError.value = messageFor(
        "/shares/collections",
        result.error,
      );
      return;
    }
    sharedCollections.value = result.collections;
  } catch (cause) {
    if (sequence === collectionsRequestSequence) {
      sharedCollectionsError.value =
        cause instanceof Error
          ? cause.message
          : "Could not load collections shared with you.";
    }
  } finally {
    if (sequence === collectionsRequestSequence) {
      sharedCollectionsLoading.value = false;
    }
  }
}

async function loadSharedCollectionItems(tag: SharedTag) {
  const sequence = ++collectionItemsRequestSequence;
  sharedCollectionItems.value = [];
  sharedCollectionItemsError.value = null;
  sharedCollectionItemsLoading.value = true;
  try {
    const result = await api["/shares/collection-items"]({ tag });
    if (sequence !== collectionItemsRequestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      sharedCollectionItemsError.value = messageFor(
        "/shares/collection-items",
        result.error,
      );
      return;
    }
    sharedCollectionItems.value = result.items.filter(
      (item): item is LoadedSharedCollectionItem =>
        item.item !== null && item.addedDate !== null,
    );
  } catch (cause) {
    if (sequence === collectionItemsRequestSequence) {
      sharedCollectionItemsError.value =
        cause instanceof Error
          ? cause.message
          : "Could not load this shared collection.";
    }
  } finally {
    if (sequence === collectionItemsRequestSequence) {
      sharedCollectionItemsLoading.value = false;
    }
  }
}

async function loadPublicCollections() {
  const sequence = ++publicCollectionsRequestSequence;
  publicCollections.value = [];
  publicCollectionsError.value = null;
  publicCollectionsLoading.value = true;
  try {
    const result = await api["/shares/public-collections"]();
    if (sequence !== publicCollectionsRequestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      publicCollectionsError.value = messageFor(
        "/shares/public-collections",
        result.error,
      );
      return;
    }
    publicCollections.value = result.collections;
  } catch (cause) {
    if (sequence === publicCollectionsRequestSequence) {
      publicCollectionsError.value =
        cause instanceof Error
          ? cause.message
          : "Could not load public collections.";
    }
  } finally {
    if (sequence === publicCollectionsRequestSequence) {
      publicCollectionsLoading.value = false;
    }
  }
}

async function loadPublicCollectionItems(tag: PublicTag) {
  const sequence = ++publicCollectionItemsRequestSequence;
  publicCollectionItems.value = [];
  publicCollectionItemsError.value = null;
  publicCollectionItemsLoading.value = true;
  try {
    const result = await api["/shares/public-collection-items"]({ tag });
    if (sequence !== publicCollectionItemsRequestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      publicCollectionItemsError.value = messageFor(
        "/shares/public-collection-items",
        result.error,
      );
      return;
    }
    publicCollectionItems.value = result.items.filter(
      (item): item is PublicCollectionItem & LoadedSharedCollectionItem =>
        item.item !== null && item.addedDate !== null,
    );
  } catch (cause) {
    if (sequence === publicCollectionItemsRequestSequence) {
      publicCollectionItemsError.value =
        cause instanceof Error
          ? cause.message
          : "Could not load this public collection.";
    }
  } finally {
    if (sequence === publicCollectionItemsRequestSequence) {
      publicCollectionItemsLoading.value = false;
    }
  }
}

export function useSharing() {
  return {
    searchResults,
    searching,
    error,
    searchUsers,
    resetSearch,
    sharedCollections,
    sharedCollectionsLoading,
    sharedCollectionsError,
    loadSharedCollections,
    publicCollections,
    publicCollectionsLoading,
    publicCollectionsError,
    loadPublicCollections,
    sharedCollectionItems,
    sharedCollectionItemsLoading,
    sharedCollectionItemsError,
    loadSharedCollectionItems,
    publicCollectionItems,
    publicCollectionItemsLoading,
    publicCollectionItemsError,
    loadPublicCollectionItems,
  };
}
