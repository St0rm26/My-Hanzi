<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  lookupCharacters,
  normalizePinyin,
} from "../api/characters.ts";
import type { CharacterEntry } from "../api/characters.ts";
import type {
  Collection,
  CollectionItem,
  SharedUser,
} from "../useCollections.ts";
import type { ShareCandidate } from "../useSharing.ts";

type SortOrder = "newest" | "oldest" | "alphabetical";

const props = withDefaults(defineProps<{
  collection: Collection;
  items: CollectionItem[];
  loading: boolean;
  error: string | null;
  shared?: boolean;
  sharedUsers?: SharedUser[];
  searchResults?: ShareCandidate[];
  searchingUsers?: boolean;
  searchError?: string | null;
  shareError?: string | null;
  sharing?: boolean;
  shareStatus?: string | null;
}>(), {
  shared: false,
  sharedUsers: () => [],
  searchResults: () => [],
  searchingUsers: false,
  searchError: null,
  shareError: null,
  sharing: false,
  shareStatus: null,
});

const emit = defineEmits<{
  back: [];
  select: [character: string];
  searchUsers: [term: string];
  saveAudience: [users: SharedUser[]];
}>();

const query = ref("");
const sortOrder = ref<SortOrder>("newest");
const entries = ref(new Map<string, CharacterEntry>());
const sharePanelOpen = ref(false);
const searchTerm = ref("");
const searchSubmitted = ref(false);
const selectedAudience = ref<SharedUser[]>([]);

watch(
  () => props.sharedUsers,
  (users) => {
    selectedAudience.value = [...users];
  },
  { immediate: true },
);

watch(
  () => props.collection.tag,
  () => {
    sharePanelOpen.value = false;
    searchTerm.value = "";
    searchSubmitted.value = false;
  },
);

watch(searchTerm, () => {
  searchSubmitted.value = false;
});

// Pinyin is not stored on collection items, so look it up from the dictionary.
watch(
  () => props.items,
  async (items) => {
    try {
      const found = await lookupCharacters(items.map(({ item }) => item));
      if (items === props.items) entries.value = found;
    } catch {
      entries.value = new Map();
    }
  },
  { immediate: true },
);

function pinyinFor(item: string) {
  return entries.value.get(item)?.pinyin ?? "";
}

const visibleItems = computed(() => {
  const term = query.value.trim();
  let result = props.items;
  if (term) {
    const normalized = normalizePinyin(term);
    result = result.filter(
      ({ item }) =>
        item.includes(term) ||
        (normalized !== "" &&
          pinyinFor(item)
            .split(", ")
            .some((pinyin) => normalizePinyin(pinyin).includes(normalized))),
    );
  }
  const sorted = [...result];
  if (sortOrder.value === "newest") {
    sorted.sort((a, b) => b.addedDate.localeCompare(a.addedDate));
  } else if (sortOrder.value === "oldest") {
    sorted.sort((a, b) => a.addedDate.localeCompare(b.addedDate));
  } else {
    sorted.sort(
      (a, b) =>
        normalizePinyin(pinyinFor(a.item)).localeCompare(
          normalizePinyin(pinyinFor(b.item)),
        ) || a.item.localeCompare(b.item),
    );
  }
  return sorted;
});

const availableUsers = computed(() => {
  const selectedIds = new Set([
    ...props.sharedUsers.map(({ user }) => user),
    ...selectedAudience.value.map(({ user }) => user),
  ]);
  return props.searchResults.filter(({ user }) => !selectedIds.has(user));
});

const audienceChanged = computed(() => {
  const persistedIds = new Set(props.sharedUsers.map(({ user }) => user));
  return (
    selectedAudience.value.length !== persistedIds.size ||
    selectedAudience.value.some(({ user }) => !persistedIds.has(user))
  );
});

function searchForUsers() {
  const term = searchTerm.value.trim();
  searchSubmitted.value = true;
  emit("searchUsers", term);
}

function addToAudience(user: ShareCandidate) {
  if (selectedAudience.value.some((selected) => selected.user === user.user)) {
    return;
  }
  selectedAudience.value = [...selectedAudience.value, user];
}

function removeFromAudience(user: SharedUser) {
  selectedAudience.value = selectedAudience.value.filter(
    (selected) => selected.user !== user.user,
  );
}

function cancelSharing() {
  selectedAudience.value = [...props.sharedUsers];
  sharePanelOpen.value = false;
}

function formatAddedDate(value: string) {
  return new Date(value).toLocaleDateString();
}
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">
      {{ shared ? "Back to shared collections" : "Back to collections" }}
    </button>
    <h1>{{ collection.name }}</h1>
    <section v-if="!shared" class="sharing-panel">
      <button
        type="button"
        :aria-expanded="sharePanelOpen"
        :disabled="loading"
        @click="sharePanelOpen = !sharePanelOpen"
      >
        Share
      </button>
      <div v-if="sharePanelOpen" class="sharing-content">
        <form class="user-search" @submit.prevent="searchForUsers">
          <label for="user-search">Find users to share with</label>
          <div>
            <input
              id="user-search"
              v-model="searchTerm"
              type="search"
              autocomplete="off"
              placeholder="Search usernames"
            />
            <button type="submit">Search</button>
          </div>
        </form>
        <p v-if="searchingUsers" role="status">Searching users...</p>
        <p v-if="searchError" role="alert">{{ searchError }}</p>
        <ul
          v-if="searchSubmitted && !searchingUsers && availableUsers.length > 0"
          class="user-search-results"
          aria-label="Matching users"
        >
          <li v-for="user in availableUsers" :key="user.user">
            <button type="button" @click="addToAudience(user)">
              {{ user.username }}
            </button>
          </li>
        </ul>
        <p
          v-else-if="searchSubmitted && !searchingUsers && !searchError"
          class="no-user-results"
        >
          No matching users available.
        </p>

        <section class="shared-users" aria-labelledby="shared-users-heading">
          <h2 id="shared-users-heading">Shared users</h2>
          <p v-if="selectedAudience.length === 0">No users selected.</p>
          <ul v-else>
            <li v-for="user in selectedAudience" :key="user.user">
              <span>{{ user.username ?? "Unknown user" }}</span>
              <button
                type="button"
                :aria-label="`Remove ${user.username ?? 'user'}`"
                :disabled="sharing"
                @click="removeFromAudience(user)"
              >
                ×
              </button>
            </li>
          </ul>
        </section>
        <p v-if="shareError" role="alert">{{ shareError }}</p>
        <p v-if="shareStatus && !audienceChanged" role="status">
          {{ shareStatus }}
        </p>
        <div class="sharing-actions">
          <button
            type="button"
            :disabled="sharing || !audienceChanged"
            @click="emit('saveAudience', selectedAudience)"
          >
            {{ sharing ? "Saving..." : "Save sharing" }}
          </button>
          <button type="button" :disabled="sharing" @click="cancelSharing">
            Cancel
          </button>
        </div>
      </div>
    </section>
    <p v-if="loading" role="status">Loading characters...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="items.length === 0">This collection is empty.</p>

    <template v-else>
      <div class="controls">
        <input
          v-model="query"
          type="search"
          placeholder="Search by hanzi or pinyin"
          aria-label="Search this collection"
        />
        <label>
          Sort by
          <select v-model="sortOrder">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </label>
      </div>
      <p v-if="visibleItems.length === 0">No matching characters.</p>
    </template>

    <ul
      v-if="!loading && !error && visibleItems.length > 0"
      class="character-grid"
      :aria-label="collection.name"
    >
      <li v-for="item in visibleItems" :key="item.item">
        <button
          type="button"
          class="character-card"
          @click="emit('select', item.item)"
        >
          <span class="character">{{ item.item }}</span>
          <span class="pinyin">{{ pinyinFor(item.item) }}</span>
          <time v-if="!shared" class="added-date" :datetime="item.addedDate">
            Added {{ formatAddedDate(item.addedDate) }}
          </time>
        </button>
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  width: min(100% - 2rem, 48rem);
  margin: 2rem auto;
}

h1 {
  margin: 1rem 0;
}

.sharing-panel {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
}

.sharing-content {
  display: grid;
  width: min(100%, 28rem);
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.user-search {
  display: grid;
  gap: 0.4rem;
}

.user-search > div {
  display: flex;
  gap: 0.5rem;
}

.user-search input {
  flex: 1;
  min-width: 0;
}

.user-search-results,
.shared-users ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.user-search-results {
  max-height: 12rem;
  overflow-y: auto;
  border: 1px solid #ddd;
}

.user-search-results button {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 0;
  border-bottom: 1px solid #eee;
  background: #fff;
  color: #222;
  text-align: left;
}

.user-search-results button:hover {
  background: #f2f2f2;
}

.shared-users {
  display: grid;
  gap: 0.4rem;
}

.shared-users h2 {
  margin: 0;
  font-size: 1rem;
}

.shared-users li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.2rem 0;
}

.shared-users li button {
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
}

.sharing-actions {
  display: flex;
  gap: 0.5rem;
}

.no-user-results {
  margin: 0;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.controls input {
  flex: 1 1 12rem;
  max-width: 20rem;
}

.controls label {
  margin-left: auto;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.character-card {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 7rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #ccc;
  cursor: pointer;
}

.character {
  font-size: 2.5rem;
}

.added-date {
  font-size: 0.875rem;
  color: #666;
}
</style>
