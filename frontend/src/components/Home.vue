<script setup lang="ts">
import { onMounted, ref } from "vue";
import BenchmarkPage from "./Benchmark.vue";
import CollectionPage from "./Collection.vue";
import CharacterDetail from "./CharacterDetail.vue";
import CharacterSearchResults from "./CharacterSearchResults.vue";
import SharedCollectionsPage from "./SharedCollections.vue";
import {
  type CharacterEntry,
  lookupCharacters,
  searchSimplifiedCharacters,
} from "../api/characters.ts";
import {
  type Collection,
  type CollectionId,
  type CollectionItem,
  type SharedUser,
  useCollections,
} from "../useCollections.ts";
import {
  type SharedCollection,
  useSharing,
} from "../useSharing.ts";
import { useInformation } from "../useInformation.ts";
import { usePersonalRating } from "../usePersonalRating.ts";
import type { PersonalRating } from "../api/ratings.ts";
import { type Benchmark, useBenchmarks } from "../useBenchmarks.ts";
import { useSession } from "../session.ts";

const { me, signOut } = useSession();

const {
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
} = useCollections();
const {
  searchResults: userSearchResults,
  searching: userSearchLoading,
  error: userSearchError,
  searchUsers,
  resetSearch,
  sharedCollections,
  sharedCollectionsLoading,
  sharedCollectionsError,
  loadSharedCollections,
  sharedCollectionItems,
  sharedCollectionItemsLoading,
  sharedCollectionItemsError,
  loadSharedCollectionItems,
  publicCollections,
  publicCollectionsLoading,
  publicCollectionsError,
  loadPublicCollections,
  publicCollectionItems,
  publicCollectionItemsLoading,
  publicCollectionItemsError,
  loadPublicCollectionItems,
} = useSharing();
const {
  benchmarks,
  loading: benchmarksLoading,
  error: benchmarksError,
  loadBenchmarks,
  getBenchmarkItems,
} = useBenchmarks();
const {
  loading: informationLoading,
  error: informationError,
  getCharacterInformation,
} = useInformation();
const {
  currentRating,
  loading: ratingLoading,
  saving: ratingSaving,
  error: ratingError,
  loadRating,
  loadRatings,
  saveRating,
} = usePersonalRating();
const page = ref<
  | "home"
  | "results"
  | "benchmark"
  | "detail"
  | "collection"
  | "shared"
  | "shared-collection"
  | "public"
  | "public-collection"
>("home");
const searchQuery = ref("");
const lastSearch = ref("");
const characters = ref<CharacterEntry[]>([]);
const activeCharacter = ref<CharacterEntry | null>(null);
const activeCollection = ref<Collection | null>(null);
const activeSharedCollection = ref<Collection | null>(null);
const activePublicCollection = ref<Collection | null>(null);
const activeBenchmark = ref<Benchmark | null>(null);
const benchmarkItems = ref<string[]>([]);
const benchmarkStudiedItems = ref<string[]>([]);
const benchmarkLoading = ref(false);
const benchmarkSequence = ref(0);
const collectionItems = ref<CollectionItem[]>([]);
const collectionRatings = ref(new Map<string, PersonalRating | null>());
const collectionRatingsLoading = ref(false);
const collectionRatingsError = ref<string | null>(null);
const removingCharacter = ref<string | null>(null);
const sharedUsers = ref<SharedUser[]>([]);
const collectionIsPublic = ref(false);
const collectionLoading = ref(false);
const selectedCollectionIds = ref<CollectionId[]>([]);
const initialCollectionIds = ref<CollectionId[]>([]);
const membershipLoading = ref(false);
const detailOrigin = ref<
  | "results"
  | "collection"
  | "benchmark"
  | "shared-collection"
  | "public-collection"
>("results");
const searching = ref(false);
const searchError = ref<string | null>(null);
const saveStatus = ref<string | null>(null);
const shareStatus = ref<string | null>(null);
let searchSequence = 0;
let characterSequence = 0;
let collectionSequence = 0;
const isEditing = ref(false);
const collectionName = ref("");

function openCreateForm() {
  activeCollection.value = null;
  collectionName.value = "";
  isEditing.value = true;
}

async function searchCharacters() {
  const query = searchQuery.value.trim();
  if (!query) return;

  const sequence = ++searchSequence;
  lastSearch.value = query;
  characters.value = [];
  searchError.value = null;
  searching.value = true;
  page.value = "results";
  try {
    characters.value = await searchSimplifiedCharacters(query);
  } catch (cause) {
    searchError.value =
      cause instanceof Error ? cause.message : "Character search failed.";
  } finally {
    if (sequence === searchSequence) searching.value = false;
  }
}

async function openCharacterById(
  character: string,
  origin:
    | "collection"
    | "benchmark"
    | "shared-collection"
    | "public-collection",
) {
  let entry: CharacterEntry | undefined;
  try {
    entry = (await lookupCharacters([character])).get(character);
  } catch {
    entry = undefined;
  }
  // Characters missing from the dictionary still get a detail page.
  await openCharacter(
    entry ?? {
      character,
      pinyin: "",
      meaning: "No definition available.",
      radical: "Not listed",
      strokeCount: null,
    },
    origin,
  );
}

function openCollectionCharacter(character: string) {
  return openCharacterById(character, "collection");
}

function closeDetail() {
  if (detailOrigin.value === "collection" && activeCollection.value) {
    void openCollection(activeCollection.value);
  } else if (detailOrigin.value === "shared-collection") {
    page.value = "shared-collection";
  } else if (detailOrigin.value === "public-collection") {
    page.value = "public-collection";
  } else if (detailOrigin.value === "benchmark") {
    if (activeBenchmark.value) void openBenchmark(activeBenchmark.value);
    else page.value = "home";
  } else {
    page.value = "results";
  }
}

async function openCharacter(
  character: CharacterEntry,
  origin:
    | "results"
    | "collection"
    | "benchmark"
    | "shared-collection"
    | "public-collection" = "results",
) {
  detailOrigin.value = origin;
  const sequence = ++characterSequence;
  activeCharacter.value = character;
  initialCollectionIds.value = [];
  selectedCollectionIds.value = [];
  saveStatus.value = null;
  page.value = "detail";
  membershipLoading.value = true;
  try {
    const [containingTags, information] = await Promise.all([
      getCharacterCollections(character.character),
      getCharacterInformation(character),
      loadRating(character.character),
    ]);
    if (sequence !== characterSequence) return;
    if (containingTags !== null) {
      initialCollectionIds.value = containingTags;
      selectedCollectionIds.value = [...containingTags];
    }
    if (information !== null) activeCharacter.value = information;
  } finally {
    if (sequence === characterSequence) membershipLoading.value = false;
  }
}

async function savePersonalRating(rating: PersonalRating) {
  if (activeCharacter.value) {
    await saveRating(activeCharacter.value.character, rating);
  }
}

async function openBenchmark(benchmark: Benchmark) {
  const sequence = ++benchmarkSequence.value;
  activeBenchmark.value = benchmark;
  benchmarkItems.value = [];
  benchmarkLoading.value = true;
  page.value = "benchmark";
  try {
    const result = await getBenchmarkItems(benchmark);
    if (sequence === benchmarkSequence.value && result !== null) {
      benchmarkItems.value = result.items;
      benchmarkStudiedItems.value = result.studiedItems;
    }
  } finally {
    if (sequence === benchmarkSequence.value) benchmarkLoading.value = false;
  }
}

function benchmarkNumber(benchmark: Benchmark) {
  return benchmark.name.match(/\d+/u)?.[0] ?? "";
}

function benchmarkColor(benchmark: Benchmark) {
  const level = Number(benchmarkNumber(benchmark));
  return level >= 1 && level <= 6 ? `var(--color-hsk-${level})` : "#fff";
}

function updateSelectedCollections(tagIds: CollectionId[]) {
  selectedCollectionIds.value = tagIds;
  saveStatus.value = null;
}

async function saveSelectedCollections() {
  if (!activeCharacter.value) return;
  const saved = await saveCharacterCollections(
    activeCharacter.value.character,
    initialCollectionIds.value,
    selectedCollectionIds.value,
  );
  if (saved) {
    initialCollectionIds.value = [...selectedCollectionIds.value];
    saveStatus.value = "Collection membership saved.";
  }
}

function openEditForm(collection: Collection) {
  activeCollection.value = collection;
  collectionName.value = collection.name;
  isEditing.value = true;
}

async function openCollection(collection: Collection) {
  const sequence = ++collectionSequence;
  activeCollection.value = collection;
  collectionItems.value = [];
  collectionRatings.value = new Map();
  collectionRatingsLoading.value = false;
  collectionRatingsError.value = null;
  removingCharacter.value = null;
  sharedUsers.value = [];
  collectionIsPublic.value = false;
  shareStatus.value = null;
  collectionLoading.value = true;
  resetSearch();
  page.value = "collection";
  try {
    const [items, audience] = await Promise.all([
      getCollectionItems(collection),
      getCollectionAudience(collection),
    ]);
    if (sequence === collectionSequence && items !== null) {
      collectionItems.value = items;
      await loadCollectionRatings(
        items.map(({ item }) => item),
        sequence,
      );
    }
    if (sequence === collectionSequence && audience !== null) {
      sharedUsers.value = audience.users;
      collectionIsPublic.value = audience.isPublic;
    }
  } finally {
    if (sequence === collectionSequence) collectionLoading.value = false;
  }
}

async function loadCollectionRatings(items: string[], sequence: number) {
  collectionRatingsLoading.value = true;
  collectionRatingsError.value = null;
  try {
    const result = await loadRatings(items);
    if (sequence === collectionSequence) {
      collectionRatings.value = result.ratings;
      collectionRatingsError.value = result.error;
    }
  } catch (cause) {
    if (sequence === collectionSequence) {
      collectionRatingsError.value =
        cause instanceof Error ? cause.message : "Could not load ratings.";
    }
  } finally {
    if (sequence === collectionSequence) {
      collectionRatingsLoading.value = false;
    }
  }
}

async function removeCollectionCharacter(character: string) {
  const collection = activeCollection.value;
  if (!collection || removingCharacter.value !== null) return;
  const sequence = collectionSequence;
  removingCharacter.value = character;
  try {
    const removed = await saveCharacterCollections(
      character,
      [collection.tag],
      [],
    );
    if (removed && sequence === collectionSequence) {
      collectionItems.value = collectionItems.value.filter(
        ({ item }) => item !== character,
      );
      const ratings = new Map(collectionRatings.value);
      ratings.delete(character);
      collectionRatings.value = ratings;
      if (collectionItems.value.length === 0) {
        sharedUsers.value = [];
        collectionIsPublic.value = false;
      }
    }
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : "Could not remove this character from the collection.";
  } finally {
    removingCharacter.value = null;
  }
}

function searchForShareUsers(term: string) {
  shareStatus.value = null;
  void searchUsers(term);
}

async function saveCollectionAudience(users: SharedUser[]) {
  if (!activeCollection.value || collectionIsPublic.value) return;
  shareStatus.value = null;
  const saved = await shareCollection(
    activeCollection.value,
    users.map(({ user }) => user),
  );
  if (saved) {
    sharedUsers.value = [...users];
    shareStatus.value = "Sharing updated.";
  }
}

async function toggleCollectionPublic(isPublic: boolean) {
  if (!activeCollection.value) return;
  shareStatus.value = null;
  const saved = await setCollectionPublic(activeCollection.value, isPublic);
  if (saved) {
    collectionIsPublic.value = isPublic;
    if (isPublic) {
      sharedUsers.value = [];
      shareStatus.value = "Collection is public.";
    } else {
      shareStatus.value = "Collection is private.";
    }
  }
}

async function openSharedCollections() {
  page.value = "shared";
  await loadSharedCollections();
}

async function openPublicCollections() {
  page.value = "public";
  await loadPublicCollections();
}

async function openPublicCollection(collection: SharedCollection) {
  if (collection.tag === null || collection.name === null) return;
  const sequence = ++collectionSequence;
  collectionRatings.value = new Map();
  collectionRatingsError.value = null;
  collectionRatingsLoading.value = false;
  activePublicCollection.value = {
    tag: collection.tag,
    name: collection.name,
  };
  page.value = "public-collection";
  await loadPublicCollectionItems(collection.tag);
  if (sequence === collectionSequence && !publicCollectionItemsError.value) {
    await loadCollectionRatings(
      publicCollectionItems.value.map(({ item }) => item),
      sequence,
    );
  }
}

async function openSharedCollection(collection: SharedCollection) {
  if (collection.tag === null || collection.name === null) return;
  const sequence = ++collectionSequence;
  collectionRatings.value = new Map();
  collectionRatingsError.value = null;
  collectionRatingsLoading.value = false;
  activeSharedCollection.value = {
    tag: collection.tag,
    name: collection.name,
  };
  page.value = "shared-collection";
  await loadSharedCollectionItems(collection.tag);
  if (sequence === collectionSequence && !sharedCollectionItemsError.value) {
    await loadCollectionRatings(
      sharedCollectionItems.value.map(({ item }) => item),
      sequence,
    );
  }
}

function openSharedCollectionCharacter(character: string) {
  return openCharacterById(character, "shared-collection");
}

function openPublicCollectionCharacter(character: string) {
  return openCharacterById(character, "public-collection");
}

function cancelForm() {
  isEditing.value = false;
  activeCollection.value = null;
  collectionName.value = "";
}

async function saveCollection() {
  const name = collectionName.value.trim();
  if (!name) return;

  const saved = activeCollection.value
    ? await renameCollection(activeCollection.value, name)
    : await createCollection(name);
  if (saved) cancelForm();
}

async function removeCollection(collection: Collection) {
  if (collection.name === "Studied") return;
  if (!window.confirm(`Delete the "${collection.name}" collection?`)) return;
  await deleteCollection(collection);
}

onMounted(() => {
  void refresh();
  void loadBenchmarks();
});
</script>

<template>
  <div class="home">
    <header class="navbar">
      <a class="brand" href="/">MyHanzi</a>
      <form class="search-form" @submit.prevent="searchCharacters">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Pinyin or character (note: type v for ü)"
          aria-label="Search by pinyin or character"
        />
      </form>
      <div class="account">
        <button
          type="button"
          class="shared-with-me"
          @click="openSharedCollections"
        >
          Shared with me
        </button>
        <button
          type="button"
          class="shared-with-me"
          @click="openPublicCollections"
        >
          Public collections
        </button>
        <span>{{ me?.username }}</span>
        <button
          type="button"
          class="sign-out"
          :disabled="working"
          @click="signOut"
        >
          Sign out
        </button>
      </div>
    </header>

    <CharacterSearchResults
      v-if="page === 'results'"
      :query="lastSearch"
      :characters="characters"
      :loading="searching"
      :error="searchError"
      @back="page = 'home'"
      @select="openCharacter"
    />

    <BenchmarkPage
      v-else-if="page === 'benchmark' && activeBenchmark"
      :benchmark="activeBenchmark"
      :items="benchmarkItems"
      :studied-items="benchmarkStudiedItems"
      :loading="benchmarkLoading"
      :error="benchmarksError"
      @back="page = 'home'"
      @select="openCharacterById($event, 'benchmark')"
    />

    <CharacterDetail
      v-else-if="page === 'detail' && activeCharacter"
      :character="activeCharacter"
      :information-loading="informationLoading"
      :information-error="informationError"
      :collections="collections"
      :selected-tags="selectedCollectionIds"
      :membership-loading="membershipLoading"
      :working="working"
      :error="error"
      :save-status="saveStatus"
      :personal-rating="currentRating"
      :rating-loading="ratingLoading"
      :rating-saving="ratingSaving"
      :rating-error="ratingError"
      :back-label="
        detailOrigin === 'collection'
          ? 'Back to collection'
          : detailOrigin === 'shared-collection'
            ? 'Back to shared collection'
            : detailOrigin === 'public-collection'
              ? 'Back to public collection'
              : detailOrigin === 'benchmark'
                ? 'Back to benchmark'
                : 'Back to results'
      "
      @back="closeDetail"
      @selection="updateSelectedCollections"
      @save="saveSelectedCollections"
      @rate="savePersonalRating"
    />

    <CollectionPage
      v-else-if="page === 'collection' && activeCollection"
      :collection="activeCollection"
      :items="collectionItems"
      :ratings="collectionRatings"
      :ratings-loading="collectionRatingsLoading"
      :rating-error="collectionRatingsError"
      :removing-item="removingCharacter"
      :loading="collectionLoading"
      :error="error"
      :shared-users="sharedUsers"
      :search-results="userSearchResults"
      :searching-users="userSearchLoading"
      :search-error="userSearchError"
      :share-error="sharingError"
      :sharing="working"
      :share-status="shareStatus"
      :is-public="collectionIsPublic"
      @back="page = 'home'"
      @select="openCollectionCharacter"
      @remove-character="removeCollectionCharacter"
      @search-users="searchForShareUsers"
      @save-audience="saveCollectionAudience"
      @toggle-public="toggleCollectionPublic"
    />

    <SharedCollectionsPage
      v-else-if="page === 'shared'"
      :collections="sharedCollections"
      :loading="sharedCollectionsLoading"
      :error="sharedCollectionsError"
      @back="page = 'home'"
      @select="openSharedCollection"
    />

    <SharedCollectionsPage
      v-else-if="page === 'public'"
      :collections="publicCollections"
      :loading="publicCollectionsLoading"
      :error="publicCollectionsError"
      title="Public collections"
      empty-message="No public collections are available."
      @back="page = 'home'"
      @select="openPublicCollection"
    />

    <CollectionPage
      v-else-if="page === 'shared-collection' && activeSharedCollection"
      :collection="activeSharedCollection"
      :items="sharedCollectionItems"
      :ratings="collectionRatings"
      :ratings-loading="collectionRatingsLoading"
      :rating-error="collectionRatingsError"
      :loading="sharedCollectionItemsLoading"
      :error="sharedCollectionItemsError"
      shared
      @back="page = 'shared'"
      @select="openSharedCollectionCharacter"
    />

    <CollectionPage
      v-else-if="page === 'public-collection' && activePublicCollection"
      :collection="activePublicCollection"
      :items="publicCollectionItems"
      :ratings="collectionRatings"
      :ratings-loading="collectionRatingsLoading"
      :rating-error="collectionRatingsError"
      :loading="publicCollectionItemsLoading"
      :error="publicCollectionItemsError"
      shared
      back-label="Back to public collections"
      @back="page = 'public'"
      @select="openPublicCollectionCharacter"
    />

    <main v-else>
      <section aria-labelledby="collections-heading">
        <div class="section-heading">
          <h1 id="collections-heading">Collections</h1>
          <button
            type="button"
            class="new-collection"
            :aria-expanded="isEditing"
            :disabled="working"
            @click="openCreateForm"
          >
            New collection
          </button>
        </div>

        <p v-if="error" role="alert">{{ error }}</p>
        <p v-if="loading">Loading collections...</p>

        <form v-if="isEditing" @submit.prevent="saveCollection">
          <label for="collection-name">Collection name</label>
          <div class="create-controls">
            <input
              id="collection-name"
              v-model="collectionName"
              required
              maxlength="50"
              :disabled="working"
            />
            <button type="submit" :disabled="working">
              {{ activeCollection ? "Save" : "Create" }}
            </button>
            <button type="button" :disabled="working" @click="cancelForm">
              Cancel
            </button>
          </div>
        </form>

        <ul class="collection-list">
          <li
            v-for="collection in collections"
            :key="collection.tag"
            class="collection-row"
          >
            <button
              type="button"
              class="collection-button"
              @click="openCollection(collection)"
            >
              {{ collection.name }}
            </button>
            <template v-if="collection.name !== 'Studied'">
              <button
                type="button"
                :disabled="working"
                @click="openEditForm(collection)"
              >
                Rename
              </button>
              <button
                type="button"
                :disabled="working"
                @click="removeCollection(collection)"
              >
                Delete
              </button>
            </template>
          </li>
        </ul>
      </section>

      <section class="benchmarks-section" aria-labelledby="benchmarks-heading">
        <div class="section-heading">
          <h1 id="benchmarks-heading">Benchmarks</h1>
        </div>
        <p v-if="benchmarksLoading" role="status">Loading benchmarks...</p>
        <p v-else-if="benchmarksError" role="alert">{{ benchmarksError }}</p>
        <p v-else-if="benchmarks.length === 0">No benchmarks are available.</p>
        <ul v-else class="benchmark-grid">
          <li v-for="benchmark in benchmarks" :key="benchmark.benchmark">
            <button
              type="button"
              class="benchmark-card"
              @click="openBenchmark(benchmark)"
            >
              <span
                class="benchmark-icon"
                :style="{ backgroundColor: benchmarkColor(benchmark) }"
                aria-hidden="true"
              >
                {{ benchmarkNumber(benchmark) }}
              </span>
              <span class="benchmark-name">{{ benchmark.name }}</span>
            </button>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  background: #fff;
  color: #222;
  font-family: var(--font-sans);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ccc;
  background: #bdbdbd;
}

.brand {
  color: rgb(255, 255, 255);
  font-weight: 800;
  text-decoration: none;
  font-size: large;
}

.brand:hover {
  color: rgb(236, 236, 236);
}

.navbar input {
  box-sizing: border-box;
  width: min(24rem, 65vw);
  padding: 0.45rem 0.6rem;
}

.account {
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sign-out {
  background: white;
  color: black;
  font-weight: 600;
  border-radius: 6px;
}

.shared-with-me {
  background: white;
  color: black;
  font-weight: 600;
  border-radius: 6px;
}

main {
  width: min(100% - 2rem, 48rem);
  margin: 2rem auto;
}

.section-heading,
.create-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-heading {
  justify-content: space-between;
}

.benchmarks-section {
  margin-top: 2.5rem;
}

.benchmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.benchmark-card {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 0;
  background: transparent;
}

.benchmark-icon {
  display: grid;
  width: 6rem;
  max-width: 100%;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  color: #111;
  font-size: 2.75rem;
  font-weight: 700;
}

.benchmark-name {
  font-weight: 600;
}

main form {
  margin-top: 1rem;
}

.create-controls {
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.collection-list {
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.collection-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.collection-row:hover {
  background: #e1e0e0;
}

.new-collection {
  background: #bdbdbd;
  color: rgb(255, 255, 255);
  font-weight: 500;
  border-radius: 6px;
}

.collection-button {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  padding: 1rem 1rem;
}

@media (max-width: 32rem) {
  .create-controls input {
    flex-basis: 100%;
  }
}
</style>
