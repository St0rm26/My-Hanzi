<script setup lang="ts">
import HanziWriter from "hanzi-writer";
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { CharacterEntry } from "../api/characters.ts";
import type { Collection, CollectionId } from "../useCollections.ts";

const props = defineProps<{
  character: CharacterEntry;
  informationLoading: boolean;
  informationError: string | null;
  collections: Collection[];
  selectedTags: CollectionId[];
  membershipLoading: boolean;
  working: boolean;
  error: string | null;
  saveStatus: string | null;
}>();

const emit = defineEmits<{
  back: [];
  selection: [tagIds: CollectionId[]];
  save: [];
}>();

const writerTarget = ref<HTMLDivElement | null>(null);
const strokeError = ref(false);
let writer: HanziWriter | undefined;

onMounted(() => {
  if (!writerTarget.value) return;
  writer = HanziWriter.create(writerTarget.value, props.character.character, {
    width: 280,
    height: 280,
    padding: 18,
    showOutline: true,
    showCharacter: false,
    strokeAnimationSpeed: 1.5,
    delayBetweenStrokes: 250,
    onLoadCharDataSuccess: () => void writer?.animateCharacter(),
    onLoadCharDataError: () => {
      strokeError.value = true;
    },
  });
});

onBeforeUnmount(() => {
  void writer?.pauseAnimation();
});

function replayStrokeOrder() {
  strokeError.value = false;
  void writer?.animateCharacter();
}

function updateSelectedCollection(tag: CollectionId, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  const selected = new Set(props.selectedTags);
  if (checked) selected.add(tag);
  else selected.delete(tag);
  emit("selection", [...selected]);
}
</script>

<template>
  <main>
    <button type="button" @click="emit('back')">Back to results</button>
    <header class="character-heading">
      <h1>{{ character.character }}</h1>
      <p>{{ character.pinyin || "Pinyin unavailable" }}</p>
    </header>

    <div class="detail-layout">
      <section class="stroke-panel" aria-labelledby="stroke-heading">
        <h2 id="stroke-heading">Stroke order</h2>
        <div
          ref="writerTarget"
          class="writer-target"
          aria-label="Animated stroke order"
        ></div>
        <button type="button" @click="replayStrokeOrder">Replay strokes</button>
        <p v-if="strokeError" role="status">Stroke animation is unavailable.</p>
      </section>

      <section
        class="character-information"
        aria-labelledby="information-heading"
      >
        <h2 id="information-heading">Character information</h2>
        <p v-if="informationLoading" role="status">
          Loading character information...
        </p>
        <p v-if="informationError" role="alert">{{ informationError }}</p>
        <dl>
          <div>
            <dt>Character</dt>
            <dd>{{ character.character }}</dd>
          </div>
          <div>
            <dt>Pinyin</dt>
            <dd>{{ character.pinyin || "Not available" }}</dd>
          </div>
          <div>
            <dt>Meaning</dt>
            <dd>{{ character.meaning }}</dd>
          </div>
          <div>
            <dt>Radical</dt>
            <dd>{{ character.radical }}</dd>
          </div>
          <div>
            <dt>Stroke count</dt>
            <dd>{{ character.strokeCount ?? "Not available" }}</dd>
          </div>
        </dl>

        <section
          class="collection-picker"
          aria-labelledby="collection-picker-heading"
        >
          <h2 id="collection-picker-heading">Add to collections</h2>
          <p v-if="collections.length === 0">No collections available.</p>
          <p v-if="membershipLoading" role="status">
            Loading collection membership...
          </p>
          <label v-for="collection in collections" :key="collection.tag">
            <input
              type="checkbox"
              :checked="selectedTags.includes(collection.tag)"
              :disabled="working || membershipLoading"
              @change="updateSelectedCollection(collection.tag, $event)"
            />
            {{ collection.name }}
          </label>
          <button
            type="button"
            :disabled="working || membershipLoading"
            @click="emit('save')"
          >
            {{ working ? "Saving..." : "Save" }}
          </button>
          <p v-if="saveStatus" role="status">{{ saveStatus }}</p>
          <p v-if="error" role="alert">{{ error }}</p>
        </section>
      </section>
    </div>
  </main>
</template>

<style scoped>
main {
  width: min(100% - 2rem, 64rem);
  margin: 2rem auto;
}

.character-heading {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin: 1rem 0;
}

.character-heading h1 {
  font-size: 4rem;
}

.character-heading p {
  font-size: 1.25rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) minmax(18rem, 1fr);
  gap: 2rem;
  align-items: start;
}

.stroke-panel,
.character-information {
  min-width: 0;
}

.writer-target {
  width: min(100%, 18rem);
  aspect-ratio: 1;
}

dl {
  margin: 1rem 0;
}

dl > div {
  padding: 0.65rem 0;
  border-bottom: 1px solid #ddd;
}

dt {
  font-weight: 600;
}

dd {
  margin-top: 0.2rem;
}

.collection-picker {
  display: grid;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.collection-picker label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collection-picker button {
  justify-self: start;
  margin-top: 0.35rem;
}

@media (max-width: 42rem) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .writer-target {
    width: min(100%, 16rem);
  }
}
</style>
