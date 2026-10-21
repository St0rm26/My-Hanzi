<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  lookupCharacters,
  normalizePinyin,
  type CharacterEntry,
} from "../api/characters.ts";
import {
  personalRatingColor,
  ratingOptions,
  type PersonalRating,
} from "../api/ratings.ts";
import type { Benchmark } from "../useBenchmarks.ts";

const props = defineProps<{
  benchmark: Benchmark;
  items: string[];
  studiedItems: string[];
  ratings: ReadonlyMap<string, PersonalRating | null>;
  ratingsLoading: boolean;
  ratingError: string | null;
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
type RatingFilterValue = PersonalRating | "None";
const allRatingValues: RatingFilterValue[] = [
  ...ratingOptions.map(({ value }) => value),
  "None",
];
const query = ref("");
const ratingFilterOpen = ref(false);
const selectedRatingDraft = ref<RatingFilterValue[]>([...allRatingValues]);
const selectedRatings = ref<RatingFilterValue[]>([...allRatingValues]);
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

const visibleItems = computed(() => {
  const term = query.value.trim();
  let result = orderedItems.value;
  if (term) {
    const normalized = normalizePinyin(term);
    result = result.filter(
      (item) =>
        item.includes(term) ||
        (normalized !== "" &&
          (entries.value.get(item)?.pinyin ?? "")
            .split(", ")
            .some((pinyin) => normalizePinyin(pinyin).includes(normalized))),
    );
  }
  if (!props.ratingsLoading && !props.ratingError) {
    const allowedRatings = new Set(selectedRatings.value);
    result = result.filter((item) =>
      allowedRatings.has(props.ratings.get(item) ?? "None"),
    );
  }
  return result;
});

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

function confirmRatingFilter() {
  selectedRatings.value = [...selectedRatingDraft.value];
  ratingFilterOpen.value = false;
}
</script>

<template>
  <main class="benchmark-page">
    <button
      type="button"
      class="back-button rounded-action"
      @click="emit('back')"
    >
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
      <p v-if="ratingError" role="alert">{{ ratingError }}</p>
      <div class="controls">
        <input
          v-model="query"
          type="search"
          placeholder="Search by hanzi or pinyin"
          aria-label="Search this benchmark"
        />
        <div class="rating-filter">
          <button
            type="button"
            class="rounded-action"
            :aria-expanded="ratingFilterOpen"
            aria-controls="benchmark-rating-filter-options"
            @click="ratingFilterOpen = !ratingFilterOpen"
          >
            Filter by Rating
          </button>
          <div
            v-if="ratingFilterOpen"
            id="benchmark-rating-filter-options"
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
                    v-else-if="
                      ratingIconForFilter(rating) === 'horizontal-line'
                    "
                    d="M17 24h14"
                  />
                  <path v-else d="m18 18 12 12m0-12L18 30" />
                </svg>
              </span>
              <span>({{ rating }})</span>
            </label>
            <button
              type="button"
              class="rounded-action"
              :disabled="ratingsLoading"
              @click="confirmRatingFilter"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      <p v-if="visibleItems.length === 0">No matching characters.</p>
      <ul
        v-if="visibleItems.length > 0"
        class="character-grid"
        :aria-label="benchmark.name + ' characters'"
      >
        <li v-for="item in visibleItems" :key="item">
          <button
            type="button"
            class="character-card"
            :style="{
              backgroundColor:
                ratingColorFor(item) ??
                (studiedItems.includes(item) ? '#ffffff' : '#c7c7c7'),
            }"
            @click="emit('select', item)"
          >
            <svg
              v-if="ratingIconFor(item)"
              class="cell-rating-icon"
              viewBox="0 0 48 48"
              role="img"
              :aria-label="`${ratings.get(item)} rating`"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="24" cy="24" r="21" />
              <path
                v-if="ratingIconFor(item) === 'star'"
                d="m24 12 3.7 7.5 8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z"
              />
              <g
                v-else-if="
                  ratingIconFor(item) === 'thumbs-up' ||
                  ratingIconFor(item) === 'thumbs-down'
                "
                transform="translate(12 12)"
              >
                <path
                  :transform="
                    ratingIconFor(item) === 'thumbs-down'
                      ? 'rotate(180 12 12)'
                      : undefined
                  "
                  d="M7 10v12m0-12h2.5c1 0 1.8-.6 2.2-1.5l2-5.2c.4-1.1 2-1.1 2.4 0 .5 1.2.6 2.6.2 3.9L15.5 10H20a2 2 0 0 1 1.9 2.6l-2.2 7A2 2 0 0 1 17.8 21H7m-3-11h3v12H4z"
                />
              </g>
              <path
                v-else-if="ratingIconFor(item) === 'horizontal-line'"
                d="M17 24h14"
              />
              <path v-else d="m18 18 12 12m0-12L18 30" />
            </svg>
            <span class="character">{{ item }}</span>
            <span class="pinyin">
              {{ entries.get(item)?.pinyin || "Pinyin unavailable" }}
            </span>
            <span class="item-rating">
              Rating:
              {{
                ratingsLoading ? "Loading..." : (ratings.get(item) ?? "None")
              }}
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
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.character-grid > li {
  position: relative;
  min-width: 0;
  aspect-ratio: 1;
}

.character-card {
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  aspect-ratio: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #c7c7c7;
  color: #000;
  padding: 2.25rem 0.75rem 0.75rem;
}

.cell-rating-icon {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  width: 1.6rem;
  height: 1.6rem;
}

.character {
  font-size: 2.5rem;
}

.pinyin {
  color: #000;
  font-size: var(--text-sm);
}

.item-rating {
  color: #000;
  font-size: 0.7rem;
  text-align: center;
}
</style>
