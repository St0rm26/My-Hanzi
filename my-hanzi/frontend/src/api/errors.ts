const categoryMessages: Record<string, string> = {
  INVALID_REQUEST: "Check the information and try again.",
  UNAUTHORIZED: "You need to sign in to do that.",
  FORBIDDEN: "You are not allowed to do that.",
  NOT_FOUND: "The requested item could not be found.",
  CONFLICT: "That change conflicts with existing data.",
  INTERNAL_ERROR: "The server couldn't complete the request.",
  UNAVAILABLE: "The service is temporarily unavailable.",
  NETWORK_ERROR: "Could not connect to the service.",
  BAD_JSON: "The service returned an invalid response.",
  BAD_STATUS: "The service couldn't complete the request.",
  HEADER_RESOLUTION_FAILED: "The request could not be prepared.",
  RESPONSE_TOO_LARGE: "The service response was too large to read.",
  TIMED_OUT: "The request timed out. Try again.",
  ABORTED: "The request was canceled.",
};

const endpointMessages: Record<string, Record<string, string>> = {
  "/information/add-field": {
    CONFLICT: "That information field already exists.",
  },
  "/tags/create-tag": {
    CONFLICT: "A collection with that name already exists.",
  },
  "/tags/edit-tag": {
    CONFLICT: "A collection with that name already exists.",
    NOT_FOUND: "That collection no longer exists.",
  },
  "/tags/delete-tag": {
    CONFLICT: 'The default "Studied" collection cannot be deleted.',
    NOT_FOUND: "That collection no longer exists.",
  },
  "/tags/add-item": {
    CONFLICT: "That character is already in the selected collection.",
  },
  "/rating/rate": {
    INVALID_REQUEST: "That personal rating is not available.",
  },
  "/rating/view": {
    INVALID_REQUEST: "Could not load this character's personal rating.",
  },
  "/rating/add-defined-ratings": {
    INVALID_REQUEST: "Could not initialize the personal rating options.",
  },
};

export function messageFor(path: string, error: string): string {
  return (
    endpointMessages[path]?.[error] ??
    categoryMessages[error] ??
    "Something went wrong. Try again."
  );
}
