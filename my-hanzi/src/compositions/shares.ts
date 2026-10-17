import { each, former, whether } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Sharing, Sessioning, Tagging } = concepts;

const UserSharedItems = former(
  "the items and tags shared with a user",
  ({ user }, { item, tag }) =>
    each(Sharing._sharedItems({ user }).is({ item }))
      .where(whether(Tagging._tagOfItem({ id: item }).is({ tag })))
      .form({ tag, item }),
);

const Shared = endpoint(
  "/shares/shared",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ items: UserSharedItems({ user }) })),
  { input: { required: ["session"] } },
);

export const composition = {
  Shared,
};
