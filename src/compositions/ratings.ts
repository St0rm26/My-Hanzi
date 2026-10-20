import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import type { EndpointValidator } from "@mit-sdg/sync-engine/boundary";
import { former, no, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { textInput } from "./inputs.ts";

const { PersonalRating, Sessioning } = concepts;

const ItemRating = former(
  "an item's rating",
  ({ user, item }, { rating }) =>
    where(PersonalRating._rating({ user, item }).is({ rating })).form({
      rating,
    }),
).optional();

const Rate = endpoint(
  "/rating/rate",
  ({ session, item, rating, user }) =>
    receive({ session, item, rating })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(PersonalRating._rating({ user, item }))
          .then(PersonalRating.changeRating({ user, item, rating }).responds({}))
          .named("existing"),
        where(no(PersonalRating._rating({ user, item })))
          .then(PersonalRating.addRating({ user, item, rating }).responds({}))
          .named("new"),
      )
      .then(respond({})),
  {
    input: { required: ["session", "item", "rating"] },
    validators: { input: textInput },
  },
);

const Remove = endpoint(
  "/rating/remove",
  ({ session, item, user }) =>
    receive({ session, item })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(PersonalRating.deleteRating({ user, item }).responds({}))
      .then(respond({})),
  {
    input: { required: ["session", "item"] },
    validators: { input: textInput },
  },
);

const View = endpoint(
  "/rating/view",
  ({ session, item, user }) =>
    receive({ session, item })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ rating: ItemRating({ user, item }) })),
  {
    input: { required: ["session", "item"] },
    validators: { input: textInput },
  },
);

const ratingsInput: EndpointValidator = (value) => {
  const valid =
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(([name, field]) =>
      name === "ratings"
        ? Array.isArray(field) &&
          field.every((rating) => typeof rating === "string")
        : typeof field === "string" ||
          (field === null && name === "session"),
    );
  return valid
    ? { ok: true }
    : { ok: false, detail: "expected a ratings list and text fields" };
};

const AddDefinedRatings = endpoint(
  "/rating/add-defined-ratings",
  ({ session, ratings }) =>
    receive({ session, ratings })
      .then(Sessioning.use({ session }).responds({}))
      .then(PersonalRating.addDefinedRatings({ ratings }).responds({}))
      .then(respond({})),
  {
    input: { required: ["session", "ratings"] },
    validators: { input: ratingsInput },
  },
);

export const ratingsHttp = {
  publicErrors: {
    ALREADY_RATED: "CONFLICT",
    PERSONAL_RATING_NOT_FOUND: "NOT_FOUND",
    RATING_NOT_DEFINED: "INVALID_REQUEST",
  },
} as const;

export const composition = {
  Rate,
  Remove,
  View,
  AddDefinedRatings,
};
