<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  lookupCharacters,
  normalizePinyin,
} from "../api/characters.ts";
import type { CharacterEntry } from "../api/characters.ts";
import {
  personalRatingColor,
  ratingOptions,
  type PersonalRating,
} from "../api/ratings.ts";
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
  ratings?: ReadonlyMap<string, PersonalRating | null>;
  ratingsLoading?: boolean;
  ratingError?: string | null;
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
  isPublic?: boolean;
  backLabel?: string;
  removingItem?: string | null;
}>(), {
  shared: false,
  sharedUsers: () => [],
  searchResults: () => [],
  searchingUsers: false,
  searchError: null,
  shareError: null,
  sharing: false,
  shareStatus: null,
  isPublic: false,
  backLabel: undefined,
  ratings: () => new Map(),
  ratingsLoading: false,
  ratingError: null,
  removingItem: null,
});

const emit = defineEmits<{
  back: [];
  select: [character: string];
  removeCharacter: [character: string];
  searchUsers: [term: string];
  saveAudience: [users: SharedUser[]];
  togglePublic: [isPublic: boolean];
}>();

type RatingFilterValue = PersonalRating | "None";

const query = ref("");
const sortOrder = ref<SortOrder>("newest");
const entries = ref(new Map<string, CharacterEntry>());
const allRatingValues: RatingFilterValue[] = [
  ...ratingOptions.map(({ value }) => value),
  "None",
];
const ratingFilterOpen = ref(false);
const selectedRatingDraft = ref<RatingFilterValue[]>([...allRatingValues]);
const selectedRatings = ref<RatingFilterValue[]>([...allRatingValues]);
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
    ratingFilterOpen.value = false;
    selectedRatingDraft.value = [...allRatingValues];
    selectedRatings.value = [...allRatingValues];
  },
);

watch(
  () => props.items.length,
  (length) => {
    if (length === 0) {
      sharePanelOpen.value = false;
      searchTerm.value = "";
      searchSubmitted.value = false;
      selectedAudience.value = [];
    }
  },
);

watch(
  () => props.isPublic,
  (isPublic) => {
    if (isPublic) {
      sharePanelOpen.value = false;
      searchTerm.value = "";
      searchSubmitted.value = false;
    }
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

function ratingIconFor(item: string) {
  const rating = props.ratings.get(item);
  return ratingOptions.find((option) => option.value === rating)?.icon;
}

function ratingColorFor(item: string) {
  const rating = props.ratings.get(item);
  return rating ? personalRatingColor(rating) : undefined;
}

function ratingIconForFilter(rating: RatingFilterValue) {
  return ratingOptions.find((option) => option.value === rating)?.icon;
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
  if (!props.ratingsLoading && !props.ratingError) {
    const allowedRatings = new Set(selectedRatings.value);
    result = result.filter(({ item }) =>
      allowedRatings.has(props.ratings.get(item) ?? "None"),
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

function confirmRatingFilter() {
  selectedRatings.value = [...selectedRatingDraft.value];
  ratingFilterOpen.value = false;
}

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

function togglePublic() {
  const nextIsPublic = !props.isPublic;
  if (
    nextIsPublic &&
    !window.confirm(
      "Making this collection public removes all previously shared users from its audience. You will need to add them again if you make it private. Continue?",
    )
  ) {
    return;
  }
  emit("togglePublic", nextIsPublic);
}

function formatAddedDate(value: string) {
  return new Date(value).toLocaleDateString();
}
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">
      {{
        backLabel ??
        (shared ? "Back to shared collections" : "Back to collections")
      }}
    </button>
    <h1>{{ collection.name }}</h1>
    <section v-if="!shared" class="sharing-panel">
      <div class="sharing-buttons">
        <button
          type="button"
          :aria-expanded="sharePanelOpen"
          :disabled="loading || isPublic || items.length === 0"
          @click="sharePanelOpen = !sharePanelOpen"
        >
          Share
        </button>
        <button
          type="button"
          :disabled="loading || sharing || items.length === 0"
          @click="togglePublic"
        >
          {{ isPublic ? "Make Private" : "Make Public" }}
        </button>
      </div>
      <p v-if="items.length === 0" class="sharing-note">
        Add at least one item before this collection can be shared.
      </p>
      <p v-if="shareError" role="alert">{{ shareError }}</p>
      <p v-if="shareStatus && !audienceChanged" role="status">
        {{ shareStatus }}
      </p>
      <div v-if="sharePanelOpen && !isPublic" class="sharing-content">
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
      <p v-if="ratingError" role="alert">{{ ratingError }}</p>
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
        <div class="rating-filter">
          <button
            type="button"
            :aria-expanded="ratingFilterOpen"
            aria-controls="rating-filter-options"
            @click="ratingFilterOpen = !ratingFilterOpen"
          >
            Filter by Rating
          </button>
          <div
            v-if="ratingFilterOpen"
            id="rating-filter-options"
            class="rating-filter-options"
            role="group"
            aria-label="Show ratings"
          >
            <span class="rating-filter-heading">Show ratings</span>
            <label
              v-for="rating in allRatingValues"
              :key="rating"
              class="rating-filter-option"
              :style="
                rating === 'None'
                  ? undefined
                  : { color: personalRatingColor(rating) }
              "
            >
              <input
                v-model="selectedRatingDraft"
                type="checkbox"
                :value="rating"
              />
              <span class="rating-filter-icon-slot" aria-hidden="true">
                <svg
                  v-if="rating !== 'None'"
                  class="rating-filter-icon"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="24" cy="24" r="21" />
                  <path
                    v-if="ratingIconForFilter(rating) === 'star'"
                    d="m24 12 3.7 7.5 8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z"
                  />
                  <g
                    v-else-if="
                      ratingIconForFilter(rating) === 'thumbs-up' ||
                      ratingIconForFilter(rating) === 'thumbs-down'
                    "
                    transform="translate(12 12)"
                  >
                    <path
                      :transform="
                        ratingIconForFilter(rating) === 'thumbs-down'
                          ? 'rotate(180 12 12)'
                          : undefined
                      "
                      d="M7 10v12m0-12h2.5c1 0 1.8-.6 2.2-1.5l2-5.2c.4-1.1 2-1.1 2.4 0 .5 1.2.6 2.6.2 3.9L15.5 10H20a2 2 0 0 1 1.9 2.6l-2.2 7A2 2 0 0 1 17.8 21H7m-3-11h3v12H4z"
                    />
                  </g>
                  <path
                    v-else-if="ratingIconForFilter(rating) === 'horizontal-line'"
                    d="M17 24h14"
                  />
                  <path v-else d="m18 18 12 12m0-12L18 30" />
                </svg>
              </span>
              <span>({{ rating }})</span>
            </label>
            <button
              type="button"
              :disabled="ratingsLoading"
              @click="confirmRatingFilter"
            >
              Confirm
            </button>
          </div>
        </div>
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
          <svg
            v-if="ratingIconFor(item.item)"
            class="cell-rating-icon"
            :style="{ color: ratingColorFor(item.item) }"
            viewBox="0 0 48 48"
            role="img"
            :aria-label="`${props.ratings.get(item.item)} rating`"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="24" cy="24" r="21" />
            <path
              v-if="ratingIconFor(item.item) === 'star'"
              d="m24 12 3.7 7.5 8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z"
            />
            <g
              v-else-if="
                ratingIconFor(item.item) === 'thumbs-up' ||
                ratingIconFor(item.item) === 'thumbs-down'
              "
              transform="translate(12 12)"
            >
              <path
                :transform="
                  ratingIconFor(item.item) === 'thumbs-down'
                    ? 'rotate(180 12 12)'
                    : undefined
                "
                d="M7 10v12m0-12h2.5c1 0 1.8-.6 2.2-1.5l2-5.2c.4-1.1 2-1.1 2.4 0 .5 1.2.6 2.6.2 3.9L15.5 10H20a2 2 0 0 1 1.9 2.6l-2.2 7A2 2 0 0 1 17.8 21H7m-3-11h3v12H4z"
              />
            </g>
            <path
              v-else-if="ratingIconFor(item.item) === 'horizontal-line'"
              d="M17 24h14"
            />
            <path v-else d="m18 18 12 12m0-12L18 30" />
          </svg>
          <span class="character">{{ item.item }}</span>
          <span class="pinyin">{{ pinyinFor(item.item) }}</span>
          <span
            class="item-rating"
            :style="{ color: ratingColorFor(item.item) }"
          >
            Rating:
            {{
              ratingsLoading
                ? "Loading..."
                : (props.ratings.get(item.item) ?? "None")
            }}
          </span>
          <time v-if="!shared" class="added-date" :datetime="item.addedDate">
            Added {{ formatAddedDate(item.addedDate) }}
          </time>
        </button>
        <button
          v-if="!shared"
          type="button"
          class="remove-character"
          :aria-label="`Remove ${item.item} from ${collection.name}`"
          :disabled="removingItem !== null"
          @click="emit('removeCharacter', item.item)"
        >
          ×
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

.sharing-buttons {
  display: flex;
  gap: 0.5rem;
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

.rating-filter {
  position: relative;
}

.rating-filter-options {
  position: absolute;
  z-index: 1;
  top: calc(100% + 0.35rem);
  right: 0;
  display: grid;
  min-width: 12rem;
  gap: 0.35rem;
  margin: 0;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.rating-filter-heading {
  font-weight: 600;
  text-align: left;
}

.rating-filter-option {
  display: grid;
  grid-template-columns: auto 1.25rem 1fr;
  width: 100%;
  align-items: center;
  gap: 0.4rem;
  text-align: left;
}

.rating-filter-option input {
  margin: 0;
}

.rating-filter-icon-slot {
  display: flex;
  width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
}

.rating-filter-icon {
  width: 100%;
  height: 100%;
}

.rating-filter-options > button {
  width: 100%;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.character-grid > li {
  position: relative;
}

.character-card {
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: 100%;
  aspect-ratio: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  border: 1px solid #ccc;
  cursor: pointer;
  padding: 2.1rem 0.4rem 0.4rem;
}

.character {
  font-size: 2rem;
}

.added-date {
  font-size: 0.7rem;
  color: #666;
}

.item-rating {
  font-size: 0.7rem;
  text-align: center;
}

.cell-rating-icon {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  width: 1.6rem;
  height: 1.6rem;
}

.remove-character {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--palette-red);
}
</style>
