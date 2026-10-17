import {
  each,
  former,
  now,
  reaction,
  when,
  whether,
  where,
} from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Tagging, Registering, Sessioning, Sharing, Benchmarking } = concepts;

const UserTags = former("the tags owned by a user", ({ user }, { tag, name }) =>
  each(Tagging._tags({ user }).is({ tag, name })).form({ tag, name }),
);

const ItemTags = former(
  "the user's collections containing an item",
  ({ user, item }, { tag }) =>
    each(Tagging._tagsContainingItem({ user, item }).is({ tag })).form({ tag }),
);

const TaggedItems = former(
  "the items in a user's collection",
  ({ user, tag }, { item, addedDate }) =>
    each(Tagging._taggedItems({ user, tag }).is({ item, addedDate })).form({
      item,
      addedDate,
    }),
);

const AudienceUsers = former(
  "the users in a collection's sharing audience",
  ({ user, tag }, { audience, username }) =>
    each(Tagging._audience({ user, tag }).is({ audience }))
      .where(
        whether(Registering._username({ user: audience }).is({ username })),
      )
      .form({ user: audience, username }),
);

const List = endpoint(
  "/tags/list",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ tags: UserTags({ user }) })),
  { input: { required: ["session"] } },
);

const Items = endpoint(
  "/tags/items",
  ({ session, tag, user }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ items: TaggedItems({ user, tag }) })),
  { input: { required: ["session", "tag"] } },
);

const GetAudience = endpoint(
  "/tags/audience",
  ({ session, tag, user }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ users: AudienceUsers({ user, tag }) })),
  { input: { required: ["session", "tag"] } },
);

const ItemMembership = endpoint(
  "/tags/item-membership",
  ({ session, item, user }) =>
    receive({ session, item })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ tags: ItemTags({ user, item }) })),
  { input: { required: ["session", "item"] } },
);

const Initialize = reaction(({ user }) =>
  when(Registering.register({}).responds({ user })).then(
    Tagging.createTag({ user, name: "Studied" }),
  ),
);

const CreateTag = endpoint(
  "/tags/create-tag",
  ({ session, name, tag, user }) =>
    receive({ session, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Tagging.createTag({ user, name }).responds({ tag }))
      .then(respond({ tag })),
  { input: { required: ["session", "name"] } },
);

const EditTag = endpoint(
  "/tags/edit-tag",
  ({ session, tag, name, user }) =>
    receive({ session, tag, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Tagging.renameTag({ user, tag, newName: name }).responds({ tag }))
      .then(respond({ tag })),
  { input: { required: ["session", "tag", "name"] } },
);

const DeleteTagEndpoint = endpoint(
  "/tags/delete-tag",
  ({ session, tag, user, audience, ids }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        Tagging.captureTagForDeletion({ user, tag }).responds({
          audience,
          ids,
        }),
      )
      .then(Sharing.revokeItems({ author: user, items: ids, audience }))
      .then(Tagging.deleteTag({ user, tag }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag"] } },
);

const ShareCollectionEndpoint = endpoint(
  "/tags/share",
  ({ session, tag, audience, user, previousAudience, ids }) =>
    receive({ session, tag, audience })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        Tagging.captureTagSharing({ user, tag }).responds({
          audience: previousAudience,
          ids,
        }),
      )
      .then(Sharing.revokeItems({
        author: user,
        items: ids,
        audience: previousAudience,
      }))
      .then(Tagging.updateAudience({ user, tag, audience }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag", "audience"] } },
);

const AddItemEndpoint = endpoint(
  "/tags/add-item",
  ({ session, tag, item, date, user }) =>
    receive({ session, tag, item })
      .where(now(date))
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Tagging.addItemTag({ user, tag, item, date }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag", "item"] } },
);

const AddCharacter = reaction(({ user, tag, item, benchmark }) =>
  when(Tagging.addItemTag({ user, tag, item }).responds({}))
    .where(
      Tagging._tags({ user }).is({ tag, name: "Studied" }),
      Benchmarking._benchmarks({ user }).is({ benchmark }),
      Benchmarking._items({ benchmark }).is({ item }),
    )
    .then(Benchmarking.checkBenchmarkItem({ benchmark, item })),
);

const ShareCharacter = reaction(({ user, tag, item, id, audience }) =>
  when(Tagging.addItemTag({ user, tag, item }).responds({}))
    .then(Tagging.generateTaggedItemID({ user, tag, item }).responds({ id }))
    .then(
      where(Tagging._audienceList({ user, tag }).is({ audience })).then(
        Sharing.shareItem({ author: user, item: id, audience }),
      ),
    ),
);

const ShareCollection = reaction(({ user, tag, audience, ids }) =>
  when(Tagging.updateAudience({ user, tag, audience }).responds({}))
    .then(Tagging.findTaggedItemsID({ user, tag }).responds({ ids }))
    .then(
      Sharing.shareItems({
        author: user,
        items: ids,
        audience,
      }),
    ),
);

const RemoveCharacter = reaction(({ user, tag, item, benchmark }) =>
  when(Tagging.removeItemTag({ user, tag, item }).responds({}))
    .where(
      Tagging._tags({ user }).is({ tag, name: "Studied" }),
      Benchmarking._benchmarks({ user }).is({ benchmark }),
      Benchmarking._items({ benchmark }).is({ item }),
    )
    .then(Benchmarking.uncheckBenchmarkItem({ benchmark, item })),
);

const RemoveItemEndpoint = endpoint(
  "/tags/remove-item",
  ({ session, tag, item, user, ids, audience }) =>
    receive({ session, tag, item })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        Tagging.captureItemSharing({ user, tag, item }).responds({
          audience,
          ids,
        }),
      )
      .then(Sharing.revokeItems({ author: user, items: ids, audience }))
      .then(Tagging.removeItemTag({ user, tag, item }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag", "item"] } },
);

export const tagsHttp = {
  publicErrors: {
    TAG_ALREADY_EXISTS: "CONFLICT",
    TAG_NOT_FOUND: "NOT_FOUND",
    DEFAULT_TAG_CANNOT_BE_DELETED: "CONFLICT",
    ITEM_ALREADY_TAGGED: "CONFLICT",
  },
} as const;

export const composition = {
  Initialize,
  ShareCollection,
  AddCharacter,
  ShareCharacter,
  RemoveCharacter,
  List,
  Items,
  Audience: GetAudience,
  ItemMembership,
  CreateTag,
  EditTag,
  DeleteTag: DeleteTagEndpoint,
  Share: ShareCollectionEndpoint,
  AddItem: AddItemEndpoint,
  RemoveItem: RemoveItemEndpoint,
};
