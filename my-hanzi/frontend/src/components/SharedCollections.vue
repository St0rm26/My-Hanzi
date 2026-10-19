<script setup lang="ts">
import { computed } from "vue";
import type { SharedCollection } from "../useSharing.ts";

const props = defineProps<{
  collections: SharedCollection[];
  loading: boolean;
  error: string | null;
  title?: string;
  emptyMessage?: string;
}>();

const emit = defineEmits<{
  back: [];
  select: [collection: SharedCollection];
}>();

const sortedCollections = computed(() => {
  const unique = new Map<string, SharedCollection>();
  for (const collection of props.collections) {
    if (collection.tag !== null) unique.set(collection.tag, collection);
  }
  return [...unique.values()].sort(
    (left, right) =>
      (left.name ?? "").localeCompare(right.name ?? "", undefined, {
        sensitivity: "base",
      }) ||
      (left.authorUsername ?? "").localeCompare(
        right.authorUsername ?? "",
        undefined,
        { sensitivity: "base" },
      ),
  );
});
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">Back</button>
    <h1>{{ title ?? "Shared with me" }}</h1>
    <p v-if="loading" role="status">Loading shared collections...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="sortedCollections.length === 0">
      {{ emptyMessage ?? "No collections have been shared with you." }}
    </p>
    <ul v-else class="shared-collection-list">
      <li
        v-for="collection in sortedCollections"
        :key="collection.tag ?? ''"
        class="shared-collection-row"
      >
        <button
          type="button"
          class="shared-collection-name"
          @click="emit('select', collection)"
        >
          {{ collection.name ?? "Unnamed collection" }}
        </button>
        <span class="shared-author">
          {{ collection.authorUsername ?? "Unknown user" }}
        </span>
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

.shared-collection-list {
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.shared-collection-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.shared-author {
  color: #555;
  text-align: right;
  padding: 1rem;
}

.shared-collection-row:hover {
  background: #e1e0e0;
}

.shared-collection-name {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  padding: 1rem;
}
</style>
