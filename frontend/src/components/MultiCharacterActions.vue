<script setup lang="ts">
import { ref, watch } from "vue";
import type { Collection } from "../useCollections.ts";
import {
  personalRatingColor,
  ratingOptions,
  type PersonalRating,
} from "../api/ratings.ts";

const props = defineProps<{
  selectionMode: boolean;
  selectedCount: number;
  collections: Collection[];
  busy: boolean;
  status: string | null;
  error: string | null;
}>();

const emit = defineEmits<{
  toggleSelection: [enabled: boolean];
  addToCollection: [collection: Collection];
  assignRating: [rating: PersonalRating];
}>();

const openAction = ref<"collection" | "rating" | null>(null);

watch(
  () => props.selectionMode,
  (enabled) => {
    if (!enabled) openAction.value = null;
  },
);

function chooseCollection(collection: Collection) {
  openAction.value = null;
  emit("addToCollection", collection);
}

function chooseRating(rating: PersonalRating) {
  openAction.value = null;
  emit("assignRating", rating);
}
</script>

<template>
  <div class="multi-character-actions">
    <button
      v-if="!selectionMode"
      type="button"
      class="rounded-action"
      @click="emit('toggleSelection', true)"
    >
      Select multiple characters
    </button>
    <template v-else>
      <span class="selected-count" role="status">
        {{ selectedCount }} selected
      </span>
      <div class="action-menu">
        <button
          type="button"
          class="rounded-action"
          :disabled="busy || selectedCount === 0 || collections.length === 0"
          :aria-expanded="openAction === 'collection'"
          aria-controls="bulk-collection-options"
          @click="
            openAction = openAction === 'collection' ? null : 'collection'
          "
        >
          Add to collection
        </button>
        <div
          v-if="openAction === 'collection'"
          id="bulk-collection-options"
          class="action-options"
          role="group"
          aria-label="Choose a collection"
        >
          <span>Add {{ selectedCount }} selected characters to:</span>
          <button
            v-for="collection in collections"
            :key="collection.tag"
            type="button"
            :disabled="busy"
            @click="chooseCollection(collection)"
          >
            {{ collection.name }}
          </button>
        </div>
      </div>
      <div class="action-menu">
        <button
          type="button"
          class="rounded-action"
          :disabled="busy || selectedCount === 0"
          :aria-expanded="openAction === 'rating'"
          aria-controls="bulk-rating-options"
          @click="openAction = openAction === 'rating' ? null : 'rating'"
        >
          Assign rating
        </button>
        <div
          v-if="openAction === 'rating'"
          id="bulk-rating-options"
          class="action-options"
          role="group"
          aria-label="Choose a rating"
        >
          <span>Assign to {{ selectedCount }} selected characters:</span>
          <button
            v-for="option in ratingOptions"
            :key="option.value"
            type="button"
            :disabled="busy"
            :style="{ color: personalRatingColor(option.value) }"
            @click="chooseRating(option.value)"
          >
            {{ option.value }}
          </button>
        </div>
      </div>
      <button
        type="button"
        class="rounded-action"
        :disabled="busy"
        @click="emit('toggleSelection', false)"
      >
        Done
      </button>
    </template>
    <p v-if="busy" class="action-feedback" role="status" aria-live="polite">
      Updating selected characters...
    </p>
    <p v-if="status" class="action-feedback" role="status">{{ status }}</p>
    <p v-if="error" class="action-feedback" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.multi-character-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.selected-count {
  font-weight: 600;
}

.action-menu {
  position: relative;
}

.action-options {
  position: absolute;
  z-index: 5;
  top: calc(100% + 0.35rem);
  right: 0;
  display: grid;
  min-width: 13rem;
  max-height: min(60vh, 24rem);
  gap: 0.35rem;
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.action-options button {
  border: 0;
  background: transparent;
  color: #222;
  font: inherit;
  padding: 0.35rem;
  text-align: left;
}

.action-options button:hover {
  background: #eee;
}

.action-feedback {
  flex-basis: 100%;
  margin: 0;
  text-align: right;
}
</style>
