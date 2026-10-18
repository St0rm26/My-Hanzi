import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
export type ShareCandidate = Wire["/users/search"]["output"]["users"][number];

const { sessionEnded } = useSession();
const searchResults = ref<ShareCandidate[]>([]);
const searching = ref(false);
const error = ref<string | null>(null);
let requestSequence = 0;

async function searchUsers(term: string) {
  const query = term.trim();
  const sequence = ++requestSequence;
  searchResults.value = [];
  error.value = null;
  if (!query) {
    searching.value = false;
    return;
  }

  searching.value = true;
  try {
    const result = await api["/users/search"]({ term: query });
    if (sequence !== requestSequence) return;
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/users/search", result.error);
      return;
    }
    searchResults.value = result.users;
  } catch (cause) {
    if (sequence === requestSequence) {
      error.value =
        cause instanceof Error ? cause.message : "Could not search users.";
    }
  } finally {
    if (sequence === requestSequence) searching.value = false;
  }
}

function resetSearch() {
  requestSequence++;
  searchResults.value = [];
  searching.value = false;
  error.value = null;
}

export function useSharing() {
  return { searchResults, searching, error, searchUsers, resetSearch };
}
