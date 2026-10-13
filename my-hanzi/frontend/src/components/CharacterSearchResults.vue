<script setup lang="ts">
import type { CharacterEntry } from "../api/characters.ts";

defineProps<{
  query: string;
  characters: CharacterEntry[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  back: [];
  select: [character: CharacterEntry];
}>();
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">Back</button>
    <h1>Results for “{{ query }}”</h1>
    <p v-if="loading" role="status">Searching characters...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="characters.length === 0">
      No matching simplified characters.
    </p>

    <div v-else class="character-grid">
      <button
        v-for="character in characters"
        :key="character.character"
        class="character-result"
        type="button"
        @click="emit('select', character)"
      >
        <span class="result-character">{{ character.character }}</span>
        <span>{{ character.pinyin || "Pinyin unavailable" }}</span>
      </button>
    </div>
  </main>
</template>

<style scoped>
main {
  width: min(100% - 2rem, 64rem);
  margin: 2rem auto;
}

h1 {
  margin: 1rem 0;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}

.character-result {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 4.5rem;
  padding: 0.65rem;
  border: 0;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  background: #fff;
  text-align: left;
}

.result-character {
  font-size: 1.8rem;
}
</style>
