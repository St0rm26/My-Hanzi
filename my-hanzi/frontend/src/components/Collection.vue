<script setup lang="ts">
import type { Collection, CollectionItem } from "../useCollections.ts";

defineProps<{
  collection: Collection;
  items: CollectionItem[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  back: [];
}>();

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

    <ul v-else class="character-grid" :aria-label="collection.name">
      <li v-for="item in items" :key="item.item" class="character-card">
        <span class="character">{{ item.item }}</span>
        <time :datetime="item.addedDate">
          Added {{ formatAddedDate(item.addedDate) }}
        </time>
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
  min-height: 7rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #ccc;
}

.character {
  font-size: 2.5rem;
}
</style>