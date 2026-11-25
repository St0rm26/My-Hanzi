<script setup lang="ts">
import { ref } from "vue";
import MultiCharacterActions from "./MultiCharacterActions.vue";
import type { Collection } from "../useCollections.ts";
import type { PersonalRating } from "../api/ratings.ts";
import {
  scriptForCharacter,
  type CharacterSearchScript,
} from "../api/characterScripts.ts";
import type { CharacterEntry } from "../api/characters.ts";

defineProps<{
  query: string;
  script: CharacterSearchScript;
  characters: CharacterEntry[];
  loading: boolean;
  error: string | null;
  collections: Collection[];
  bulkBusy: boolean;
  bulkStatus: string | null;
  bulkError: string | null;
}>();

const emit = defineEmits<{
  back: [];
  select: [character: CharacterEntry];
  addToCollection: [characters: string[], collection: Collection];
  assignRating: [characters: string[], rating: PersonalRating];
}>();

const selectionMode = ref(false);
const selectedCharacters = ref<string[]>([]);

function toggleSelection(enabled: boolean) {
  selectionMode.value = enabled;
  selectedCharacters.value = [];
}

function toggleCharacter(character: string) {
  selectedCharacters.value = selectedCharacters.value.includes(character)
    ? selectedCharacters.value.filter((selected) => selected !== character)
    : [...selectedCharacters.value, character];
}
</script>

<template>
  <main>
    <div class="page-actions">
      <button type="button" class="rounded-action" @click="emit('back')">
        Back
      </button>
      <MultiCharacterActions
        v-if="!loading && !error && characters.length > 0"
        :selection-mode="selectionMode"
        :selected-count="selectedCharacters.length"
        :collections="collections"
        :busy="bulkBusy"
        :status="bulkStatus"
        :error="bulkError"
        @toggle-selection="toggleSelection"
        @add-to-collection="
          emit('addToCollection', selectedCharacters, $event)
        "
        @assign-rating="emit('assignRating', selectedCharacters, $event)"
      />
    </div>
    <h1>
      {{
        `${script === "simplified" ? "Simplified" : "Traditional"} results for "${query}"`
      }}
    </h1>
    <p v-if="loading" role="status">Searching characters...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="characters.length === 0">
      No matching {{ script }} characters.
    </p>

    <div v-else class="character-grid">
      <button
        v-for="character in characters"
        :key="character.character"
        class="character-result"
        :disabled="bulkBusy"
        :class="{
          'is-selected': selectedCharacters.includes(character.character),
        }"
        type="button"
        :aria-pressed="
          selectionMode ? selectedCharacters.includes(character.character) : undefined
        "
        @click="
          selectionMode
            ? toggleCharacter(character.character)
            : emit('select', character)
        "
      >
        <span
          class="result-character"
          :class="{
            'traditional-hanzi':
              scriptForCharacter(character.character) === 'traditional',
          }"
          >{{ character.character }}</span
        >
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

.page-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.character-result.is-selected {
  outline: 3px solid var(--palette-yellow);
  outline-offset: -3px;
  background: #fff7d6;
}
</style>
