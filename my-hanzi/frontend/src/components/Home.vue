<script setup lang="ts">
import { onMounted, ref } from "vue";
import CollectionPage from "./Collection.vue";
import CharacterDetail from "./CharacterDetail.vue";
import CharacterSearchResults from "./CharacterSearchResults.vue";
import {
  type CharacterEntry,
  lookupCharacters,
  searchSimplifiedCharacters,
} from "../api/characters.ts";
import {
  type Collection,
  type CollectionId,
  type CollectionItem,
  useCollections,
} from "../useCollections.ts";
import { useInformation } from "../useInformation.ts";
import { useSession } from "../session.ts";

const { me, signOut } = useSession();

const {
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
} = useCollections();
const {
  loading: informationLoading,
  error: informationError,
  getCharacterInformation,
} = useInformation();
const page = ref<"home" | "results" | "detail" | "collection">("home");
const searchQuery = ref("");
const lastSearch = ref("");
const characters = ref<CharacterEntry[]>([]);
const activeCharacter = ref<CharacterEntry | null>(null);
const activeCollection = ref<Collection | null>(null);
const collectionItems = ref<CollectionItem[]>([]);
const collectionLoading = ref(false);
const selectedCollectionIds = ref<CollectionId[]>([]);
const initialCollectionIds = ref<CollectionId[]>([]);
const membershipLoading = ref(false);
const detailOrigin = ref<"results" | "collection">("results");
const searching = ref(false);
const searchError = ref<string | null>(null);
const saveStatus = ref<string | null>(null);
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

async function openCollectionCharacter(character: string) {
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
    "collection",
  );
}

function closeDetail() {
  if (detailOrigin.value === "collection" && activeCollection.value) {
    void openCollection(activeCollection.value);
  } else {
    page.value = "results";
  }
}

async function openCharacter(
  character: CharacterEntry,
  origin: "results" | "collection" = "results",
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
  collectionLoading.value = true;
  page.value = "collection";
  try {
    const items = await getCollectionItems(collection);
    if (sequence === collectionSequence && items !== null) {
      collectionItems.value = items;
    }
  } finally {
    if (sequence === collectionSequence) collectionLoading.value = false;
  }
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

onMounted(() => void refresh());
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
        <span>{{ me?.username }}</span>
        <button type="button" @click="signOut">Sign out</button>
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
      :back-label="
        detailOrigin === 'collection' ? 'Back to collection' : 'Back to results'
      "
      @back="closeDetail"
      @selection="updateSelectedCollections"
      @save="saveSelectedCollections"
    />

    <CollectionPage
      v-else-if="page === 'collection' && activeCollection"
      :collection="activeCollection"
      :items="collectionItems"
      :loading="collectionLoading"
      :error="error"
      :selected-character="activeCharacter"
      @back="page = 'home'"
      @select="openCollectionCharacter"
    />

    <main v-else>
      <section aria-labelledby="collections-heading">
        <div class="section-heading">
          <h1 id="collections-heading">Collections</h1>
          <button
            type="button"
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
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  background: #fff;
  color: #222;
  font-family: system-ui, sans-serif;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ccc;
}

.brand {
  color: inherit;
  font-weight: 600;
  text-decoration: none;
}

.navbar input {
  box-sizing: border-box;
  width: min(24rem, 65vw);
  padding: 0.45rem 0.6rem;
}

.account {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.collection-button {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

@media (max-width: 32rem) {
  .create-controls input {
    flex-basis: 100%;
  }
}
</style>
