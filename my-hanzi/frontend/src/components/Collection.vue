<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  lookupCharacters,
  normalizePinyin,
  type CharacterEntry,
} from "../api/characters.ts";
import type { Collection, CollectionItem } from "../useCollections.ts";

type SortOrder = "newest" | "oldest" | "alphabetical";

const props = defineProps<{
  collection: Collection;
  items: CollectionItem[];
  loading: boolean;
  error: string | null;
  selectedCharacter: CharacterEntry | null;
}>();

const emit = defineEmits<{
  back: [];
  select: [character: string];
}>();

const query = ref("");
const sortOrder = ref<SortOrder>("newest");
const entries = ref(new Map<string, CharacterEntry>());

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

function formatAddedDate(value: string) {
  return new Date(value).toLocaleDateString();
}
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">Back to collections</button>
    <h1>{{ collection.name }}</h1>
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
          <time class="added-date" :datetime="item.addedDate">
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
