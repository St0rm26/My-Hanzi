import {
  each,
  former,
  now,
  reaction,
  when,
} from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Tagging, Registering, Sessioning } = concepts;

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
  ({ session, tag, user }) =>
    receive({ session, tag })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Tagging.deleteTag({ user, tag }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag"] } },
);

/*Combines both the FindTaggedCharactersIds and DeleteCollection reactions*/
//TODO Sharing.deleteItems in beta
const DeleteTag = reaction(({ user, tag }) =>
  when(Tagging.deleteTag({ user, tag }).responds({})).then(
    Tagging.findTaggedItemsID({ user, tag }),
  ),
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

/*Combines both the GenerateCharacterId and AddCharacter reactions*/
//TODO Sharing.shareItem in beta
const TagItem = reaction(({ user, tag, item }) =>
  when(Tagging.addItemTag({ user, tag, item }).responds({})).then(
    Tagging.generateTaggedItemID({ user, tag, item }),
  ),
);

const RemoveItemEndpoint = endpoint(
  "/tags/remove-item",
  ({ session, tag, item, user }) =>
    receive({ session, tag, item })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Tagging.removeItemTag({ user, tag, item }).responds({}))
      .then(respond({})),
  { input: { required: ["session", "tag", "item"] } },
);

/*Combines both the FindCharacterId and RemoveCharacter reactions*/
//TODO Sharing.deleteItems in beta
const UntagItem = reaction(({ user, tag, item }) =>
  when(Tagging.removeItemTag({ user, tag, item }).responds({})).then(
    Tagging.findTaggedItemID({ user, tag, item }),
  ),
);

// TODO: AddToBenchmark
// TODO: RemoveFromBenchmark

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
  List,
  Items,
  ItemMembership,
  CreateTag,
  EditTag,
  DeleteTag: DeleteTagEndpoint,
  AddItem: AddItemEndpoint,
  RemoveItem: RemoveItemEndpoint,
};
