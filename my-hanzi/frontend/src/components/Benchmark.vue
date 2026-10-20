<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  lookupCharacters,
  normalizePinyin,
  type CharacterEntry,
} from "../api/characters.ts";
import type { Benchmark } from "../useBenchmarks.ts";

const props = defineProps<{
  benchmark: Benchmark;
  items: string[];
  studiedItems: string[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  back: [];
  select: [character: string];
}>();

const entries = ref(new Map<string, CharacterEntry>());
const dictionaryLoading = ref(false);
const dictionaryError = ref<string | null>(null);
let lookupSequence = 0;

watch(
  () => props.items,
  async (items) => {
    const sequence = ++lookupSequence;
    entries.value = new Map();
    dictionaryError.value = null;
    dictionaryLoading.value = false;
    if (items.length === 0) return;

    dictionaryLoading.value = true;
    try {
      entries.value = await lookupCharacters(items);
    } catch (cause) {
      dictionaryError.value =
        cause instanceof Error
          ? cause.message
          : "Could not load character pronunciation data.";
    } finally {
      if (sequence === lookupSequence) dictionaryLoading.value = false;
    }
  },
  { immediate: true },
);

const orderedItems = computed(() =>
  [...props.items].sort(
    (left, right) =>
      normalizePinyin(entries.value.get(left)?.pinyin ?? "").localeCompare(
        normalizePinyin(entries.value.get(right)?.pinyin ?? ""),
      ) || left.localeCompare(right),
  ),
);
</script>

<template>
  <main class="benchmark-page">
    <button type="button" class="back-button" @click="emit('back')">
      Back to benchmarks
    </button>
    <h1>{{ benchmark.name }}</h1>
    <p v-if="loading" role="status">Loading characters...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="items.length === 0">This benchmark has no characters.</p>

    <template v-else>
      <p v-if="dictionaryLoading" role="status">
        Sorting characters by pinyin...
      </p>
      <p v-if="dictionaryError" role="alert">
        {{ dictionaryError }} Characters are shown in character order instead.
      </p>
      <ul class="character-grid" :aria-label="benchmark.name + ' characters'">
        <li v-for="item in orderedItems" :key="item">
          <button
            type="button"
            class="character-card"
            :style="{
              backgroundColor: studiedItems.includes(item)
                ? '#ffffff'
                : '#c7c7c7',
            }"
            @click="emit('select', item)"
          >
            <span class="character">{{ item }}</span>
            <span class="pinyin">
              {{ entries.get(item)?.pinyin || "Pinyin unavailable" }}
            </span>
          </button>
        </li>
      </ul>
    </template>
  </main>
</template>

<style scoped>
.benchmark-page {
  width: min(100% - 2rem, 64rem);
  margin: 2rem auto;
}

.back-button {
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 1rem;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.character-card {
  display: flex;
  width: 100%;
  min-height: 7rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #c7c7c7;
}

.character {
  font-size: 2.5rem;
}

.pinyin {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
