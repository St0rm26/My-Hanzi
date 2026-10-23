<script setup lang="ts">
import HanziWriter from "hanzi-writer";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { CharacterEntry } from "../api/characters.ts";
import { scriptForCharacter } from "../api/characterScripts.ts";
import {
  personalRatingColor,
  ratingOptions,
  type PersonalRating,
} from "../api/ratings.ts";
import type { Collection, CollectionId } from "../useCollections.ts";

const props = defineProps<{
  character: CharacterEntry;
  informationLoading: boolean;
  informationError: string | null;
  collections: Collection[];
  selectedTags: CollectionId[];
  savedTags: CollectionId[];
  membershipLoading: boolean;
  working: boolean;
  error: string | null;
  saveStatus: string | null;
  personalRating: PersonalRating | null;
  ratingLoading: boolean;
  ratingSaving: boolean;
  ratingError: string | null;
  backLabel?: string;
}>();

const emit = defineEmits<{
  back: [];
  selection: [tagIds: CollectionId[]];
  save: [];
  rate: [rating: PersonalRating];
}>();

const writerTarget = ref<HTMLDivElement | null>(null);
const ratingDialog = ref<HTMLDialogElement | null>(null);
const collectionPickerOpen = ref(false);
const strokeError = ref(false);
let writer: HanziWriter | undefined;
const ratings = ratingOptions;
const characterScript = computed(() =>
  scriptForCharacter(props.character.character),
);
const characterScriptLabel = computed(() =>
  characterScript.value === "simplified-and-traditional"
    ? "Simplified and Traditional"
    : characterScript.value === "traditional"
      ? "Traditional"
      : "Simplified",
);

function openRatingPicker() {
  if (!props.ratingLoading && !props.ratingSaving) {
    ratingDialog.value?.showModal();
  }
}

function closeRatingPicker() {
  ratingDialog.value?.close();
}

function chooseRating(rating: PersonalRating) {
  closeRatingPicker();
  emit("rate", rating);
}

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

function cancelCollectionChanges() {
  emit("selection", [...props.savedTags]);
  collectionPickerOpen.value = false;
}
</script>

<template>
  <main>
    <button
      type="button"
      :class="{
        'rounded-action':
          backLabel === 'Back to collection' ||
          backLabel === 'Back to shared collection' ||
          backLabel === 'Back to public collection' ||
          backLabel === 'Back to benchmark' ||
          backLabel === 'Back to results',
      }"
      @click="emit('back')"
    >
      {{ backLabel ?? "Back to results" }}
    </button>
    <header class="character-heading">
      <h1
        :class="{
          'traditional-hanzi': characterScript === 'traditional',
        }"
      >
        {{ character.character }}
      </h1>
      <p>{{ character.pinyin || "Pinyin unavailable" }}</p>
      <span class="script-badge">{{ characterScriptLabel }}</span>
    </header>

    <div class="detail-layout">
      <section class="stroke-panel" aria-labelledby="stroke-heading">
        <h2 id="stroke-heading">Stroke order</h2>
        <div
          ref="writerTarget"
          class="writer-target"
          aria-label="Animated stroke order"
        ></div>
        <button type="button" class="rounded-action" @click="replayStrokeOrder">
          Replay strokes
        </button>
        <p v-if="strokeError" role="status">Stroke animation is unavailable.</p>
        <section class="collection-picker">
          <button
            type="button"
            class="rounded-action"
            :aria-expanded="collectionPickerOpen"
            aria-controls="collection-picker-options"
            @click="collectionPickerOpen = !collectionPickerOpen"
          >
            Add to collections
          </button>
          <div
            v-if="collectionPickerOpen"
            id="collection-picker-options"
            class="collection-picker-options"
          >
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
            <div class="collection-picker-actions">
              <button
                type="button"
                class="rounded-action"
                :disabled="working || membershipLoading"
                @click="emit('save')"
              >
                {{ working ? "Saving..." : "Save" }}
              </button>
              <button
                type="button"
                class="rounded-action"
                @click="cancelCollectionChanges"
              >
                Cancel
              </button>
            </div>
            <p v-if="saveStatus" role="status">{{ saveStatus }}</p>
            <p v-if="error" role="alert">{{ error }}</p>
          </div>
        </section>
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
            <dd
              :class="{
                'traditional-hanzi': characterScript === 'traditional',
              }"
            >
              {{ character.character }}
            </dd>
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

        <section class="rating-picker" aria-labelledby="rating-heading">
          <h2 id="rating-heading">
            Personal rating:
            <span
              :style="
                personalRating
                  ? { color: personalRatingColor(personalRating) }
                  : undefined
              "
            >
              {{ personalRating ?? "None" }}
            </span>
          </h2>
          <button
            type="button"
            class="rounded-action"
            :disabled="ratingLoading || ratingSaving"
            @click="openRatingPicker"
          >
            {{
              ratingSaving
                ? "Saving rating..."
                : personalRating
                  ? "Change rating"
                  : "Add a personal rating"
            }}
          </button>
          <p v-if="ratingLoading" role="status">Loading rating...</p>
          <p v-if="ratingError" role="alert">{{ ratingError }}</p>
        </section>
      </section>
    </div>

    <dialog
      ref="ratingDialog"
      class="rating-dialog"
      aria-labelledby="rating-dialog-heading"
      @click.self="closeRatingPicker"
    >
      <div class="rating-dialog-content">
        <div class="rating-dialog-heading">
          <h2 id="rating-dialog-heading">Rate this character</h2>
          <button
            type="button"
            class="close-rating"
            aria-label="Close rating options"
            @click="closeRatingPicker"
          >
            ×
          </button>
        </div>
        <div class="rating-options">
          <button
            v-for="option in ratings"
            :key="option.value"
            type="button"
            class="rating-option"
            :style="{ color: personalRatingColor(option.value) }"
            :aria-pressed="personalRating === option.value"
            @click="chooseRating(option.value)"
          >
            <svg
              class="rating-icon"
              viewBox="0 0 48 48"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="24" cy="24" r="21" />
              <path
                v-if="option.icon === 'star'"
                d="m24 12 3.7 7.5 8.3 1.2-6 5.9 1.4 8.3-7.4-3.9-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z"
              />
              <g
                v-else-if="
                  option.icon === 'thumbs-up' || option.icon === 'thumbs-down'
                "
                transform="translate(12 12)"
              >
                <path
                  :transform="
                    option.icon === 'thumbs-down'
                      ? 'rotate(180 12 12)'
                      : undefined
                  "
                  d="M7 10v12m0-12h2.5c1 0 1.8-.6 2.2-1.5l2-5.2c.4-1.1 2-1.1 2.4 0 .5 1.2.6 2.6.2 3.9L15.5 10H20a2 2 0 0 1 1.9 2.6l-2.2 7A2 2 0 0 1 17.8 21H7m-3-11h3v12H4z"
                />
              </g>
              <path
                v-else-if="option.icon === 'horizontal-line'"
                d="M17 24h14"
              />
              <path v-else d="m18 18 12 12m0-12L18 30" />
            </svg>
            <span>{{ option.value }}</span>
          </button>
        </div>
      </div>
    </dialog>
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

.script-badge {
  padding: 0.25rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  white-space: nowrap;
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
  position: relative;
  margin-top: 0.75rem;
}

.collection-picker-options {
  position: absolute;
  z-index: 1;
  top: calc(100% + 0.35rem);
  left: 0;
  display: grid;
  min-width: min(100%, 18rem);
  gap: 0.55rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.collection-picker-actions {
  display: flex;
  gap: 0.5rem;
}

.rating-picker {
  display: grid;
  justify-items: start;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.rating-dialog {
  width: min(42rem, calc(100% - 2rem));
  max-width: none;
  margin: auto;
  padding: 1.25rem;
  border: 1px solid #aaa;
  border-radius: 12px;
  background: #fff;
  color: #000;
}

.rating-dialog::backdrop {
  background: rgb(0 0 0 / 35%);
}

.rating-dialog-content {
  display: grid;
  gap: 1.25rem;
}

.rating-dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-rating {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #000;
  font-size: 1.5rem;
  line-height: 1;
}

.rating-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
}

.rating-option {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.1rem;
  border: 0;
  background: transparent;
  color: #000;
  font-size: 0.8rem;
}

.rating-icon {
  width: clamp(2.5rem, 12vw, 3.5rem);
  height: clamp(2.5rem, 12vw, 3.5rem);
}

.collection-picker-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collection-picker-options button {
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
