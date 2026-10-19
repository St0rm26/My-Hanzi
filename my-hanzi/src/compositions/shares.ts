import { each, former, whether } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Registering, Sharing, Sessioning, Tagging } = concepts;

const UserSharedCollections = former(
  "the distinct collections shared with a user",
  ({ user }, { item, tag, name, author, authorUsername }) =>
    each(Sharing._sharedItems({ user }).is({ item }))
      .where(
        whether(
          Tagging._tagDetailsOfItem({ id: item }).is({
            tag,
            name,
            author,
          }),
        ),
        whether(
          Registering._username({ user: author }).is({
            username: authorUsername,
          }),
        ),
      )
      .form({ tag, name, author, authorUsername }),
);

const UserSharedCollectionItems = former(
  "the items in a collection shared with a user",
  ({ user, tag }, { sharedItem, item, addedDate }) =>
    each(Sharing._sharedItems({ user }).is({ item: sharedItem }))
      .where(
        whether(
          Tagging._tagDetailsOfItem({ id: sharedItem }).is({
            tag,
            item,
            addedDate,
          }),
        ),
      )
      .form({ item, addedDate }),
);

const UserPublicCollections = former(
  "the public collections",
  ({ user }, { tag, name, author, authorUsername }) =>
    each(
      Sharing._publicCollections({ user }).is({ author, tag }),
    )
      .where(
        whether(Tagging._tagDetails({ tag }).is({ author, name })),
        whether(
          Registering._username({ user: author }).is({
            username: authorUsername,
          }),
        ),
      )
      .arranged(name, "ascending")
      .form({ tag, name, author, authorUsername }),
);

const UserPublicCollectionItems = former(
  "the items in a public collection",
  ({ tag }, { publicItem, item, addedDate }) =>
    each(Sharing._publicItems({ tag }).is({ item: publicItem }))
      .where(
        whether(
          Tagging._tagDetailsOfItem({ id: publicItem }).is({
            tag,
            item,
            addedDate,
          }),
        ),
      )
      .form({ item, addedDate }),
);

const Collections = endpoint(
  "/shares/collections",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ collections: UserSharedCollections({ user }) })),
  { input: { required: ["session"] } },
);

const CollectionItems = endpoint(
  "/shares/collection-items",
  ({ session, tag, user }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ items: UserSharedCollectionItems({ user, tag }) })),
  { input: { required: ["session", "tag"] } },
);

const PublicCollections = endpoint(
  "/shares/public-collections",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        respond({ collections: UserPublicCollections({ user }) }),
      ),
  { input: { required: ["session"] } },
);

const PublicCollectionItems = endpoint(
  "/shares/public-collection-items",
  ({ session, tag }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({}))
      .then(
        respond({
          items: UserPublicCollectionItems({ tag }),
        }),
      ),
  { input: { required: ["session", "tag"] } },
);

export const composition = {
  Collections,
  CollectionItems,
  PublicCollections,
  PublicCollectionItems,
};
