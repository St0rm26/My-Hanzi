import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";
import {
  isPersonalRating,
  type PersonalRating,
  ratingOptions,
} from "./api/ratings.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
type Rating = Wire["/rating/view"]["output"]["rating"];

const { sessionEnded } = useSession();
const currentRating = ref<PersonalRating | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
let definitionsReady = false;
let definitionsRequest: Promise<
  { category: string } | { message: string } | null
> | null = null;
let requestSequence = 0;
let activeItem: string | null = null;

async function fetchDefinedRatings(): Promise<
  { category: string } | { message: string } | null
> {
  if (definitionsReady) return null;
  try {
    const result = await api["/rating/add-defined-ratings"]({
      ratings: ratingOptions.map(({ value }) => value),
    });
    if ("error" in result) {
      return { category: result.error };
    }
    definitionsReady = true;
    return null;
  } catch (cause) {
    return {
      message:
        cause instanceof Error
          ? cause.message
          : "Could not load the available personal ratings.",
    };
  }
}

function ensureDefinedRatings() {
  if (definitionsReady) return Promise.resolve(null);
  definitionsRequest ??= fetchDefinedRatings().finally(() => {
    definitionsRequest = null;
  });
  return definitionsRequest;
}

async function loadRating(item: string): Promise<PersonalRating | null> {
  const sequence = ++requestSequence;
  activeItem = item;
  loading.value = true;
  error.value = null;
  currentRating.value = null;
  try {
    const definitionsFailure = await ensureDefinedRatings();
    if (definitionsFailure !== null) {
      if (sequence === requestSequence) {
        if ("category" in definitionsFailure) {
          if (definitionsFailure.category === "UNAUTHORIZED") sessionEnded();
          error.value = messageFor(
            "/rating/add-defined-ratings",
            definitionsFailure.category,
          );
        } else {
          error.value = definitionsFailure.message;
        }
      }
      return null;
    }
    const result = await api["/rating/view"]({ item });
    if (sequence !== requestSequence) return null;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/rating/view", result.error);
      return null;
    }
    const rating: Rating = result.rating;
    currentRating.value =
      rating && isPersonalRating(rating.rating) ? rating.rating : null;
    return currentRating.value;
  } catch (cause) {
    if (sequence === requestSequence) {
      error.value =
        cause instanceof Error
          ? cause.message
          : "Could not load this character's personal rating.";
    }
    return null;
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

async function loadRatings(items: string[]): Promise<{
  ratings: Map<string, PersonalRating | null>;
  error: string | null;
}> {
  const ratings = new Map<string, PersonalRating | null>();
  const uniqueItems = [...new Set(items)];
  if (uniqueItems.length === 0) return { ratings, error: null };

  const definitionsFailure = await ensureDefinedRatings();
  if (definitionsFailure !== null) {
    const failure =
      "category" in definitionsFailure
        ? messageFor("/rating/add-defined-ratings", definitionsFailure.category)
        : definitionsFailure.message;
    if (
      "category" in definitionsFailure &&
      definitionsFailure.category === "UNAUTHORIZED"
    ) {
      sessionEnded();
    }
    return { ratings, error: failure };
  }

  const results = await Promise.all(
    uniqueItems.map(async (item) => {
      try {
        const result = await api["/rating/view"]({ item });
        if ("error" in result) {
          if (result.error === "UNAUTHORIZED") sessionEnded();
          return {
            item,
            rating: null,
            error: messageFor("/rating/view", result.error),
          };
        }
        const rating: Rating = result.rating;
        return {
          item,
          rating:
            rating && isPersonalRating(rating.rating) ? rating.rating : null,
          error: null,
        };
      } catch (cause) {
        return {
          item,
          rating: null,
          error:
            cause instanceof Error
              ? cause.message
              : "Could not load collection ratings.",
        };
      }
    }),
  );

  let firstError: string | null = null;
  for (const result of results) {
    ratings.set(result.item, result.rating);
    firstError ??= result.error;
  }
  return { ratings, error: firstError };
}

async function saveRating(item: string, rating: PersonalRating) {
  if (saving.value) return false;
  const sequence = requestSequence;
  saving.value = true;
  error.value = null;
  try {
    const definitionsFailure = await ensureDefinedRatings();
    if (definitionsFailure !== null) {
      if (sequence !== requestSequence || item !== activeItem) return false;
      if ("category" in definitionsFailure) {
        if (definitionsFailure.category === "UNAUTHORIZED") sessionEnded();
        error.value = messageFor(
          "/rating/add-defined-ratings",
          definitionsFailure.category,
        );
      } else {
        error.value = definitionsFailure.message;
      }
      return false;
    }
    const result = await api["/rating/rate"]({ item, rating });
    if ("error" in result) {
      if (sequence === requestSequence && item === activeItem) {
        if (result.error === "UNAUTHORIZED") sessionEnded();
        error.value = messageFor("/rating/rate", result.error);
      }
      return false;
    }
    if (sequence === requestSequence && item === activeItem) {
      currentRating.value = rating;
    }
    return true;
  } catch (cause) {
    if (sequence === requestSequence && item === activeItem) {
      error.value =
        cause instanceof Error
          ? cause.message
          : "Could not save this character's personal rating.";
    }
    return false;
  } finally {
    saving.value = false;
  }
}

export function usePersonalRating() {
  return {
    currentRating,
    loading,
    saving,
    error,
    loadRating,
    loadRatings,
    saveRating,
  };
}
