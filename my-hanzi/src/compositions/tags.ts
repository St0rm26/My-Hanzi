import {
  each,
  former,
  now,
  reaction,
  when,
} from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Tagging, Registering, Sharing } = concepts;

const UserTags = former("the tags owned by a user", ({ user }, { tag, name }) =>
  each(Tagging._tags({ user }).is({ tag, name })).form({ tag, name }),
);

const ItemTags = former(
  "the user's collections containing an item",
  ({ user, item }, { tag }) =>
    each(Tagging._tagsContainingItem({ user, item }).is({ tag })).form({ tag }),
);

const List = endpoint(
  "/tags/list",
  ({ user }) => receive({ user }).then(respond({ tags: UserTags({ user }) })),
  { input: { required: ["user"] } },
);

const ItemMembership = endpoint(
  "/tags/item-membership",
  ({ user, item }) =>
    receive({ user, item }).then(respond({ tags: ItemTags({ user, item }) })),
  { input: { required: ["user", "item"] } },
);

const Initialize = reaction(({ user }) =>
  when(Registering.register({}).responds({ user })).then(
    Tagging.createTag({ user, name: "Studied" }),
  ),
);

const CreateTag = endpoint(
  "/tags/create-tag",
  ({ user, name, tag }) =>
    receive({ user, name })
      .then(Tagging.createTag({ user, name }).responds({ tag }))
      .then(respond({ tag })),
  { input: { required: ["user", "name"] } },
);

const EditTag = endpoint(
  "/tags/edit-tag",
  ({ user, tag, name }) =>
    receive({ user, tag, name })
      .then(Tagging.renameTag({ user, tag, newName: name }).responds({ tag }))
      .then(respond({ tag })),
  { input: { required: ["user", "tag", "name"] } },
);

const DeleteTagEndpoint = endpoint(
  "/tags/delete-tag",
  ({ user, tag }) =>
    receive({ user, tag })
      .then(Tagging.deleteTag({ user, tag }).responds({}))
      .then(respond({})),
  { input: { required: ["user", "tag"] } },
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
  ({ user, tag, item, date }) =>
    receive({ user, tag, item })
      .where(now(date))
      .then(Tagging.addItemTag({ user, tag, item, date }).responds({}))
      .then(respond({})),
  { input: { required: ["user", "tag", "item"] } },
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
  ({ user, tag, item }) =>
    receive({ user, tag, item })
      .then(Tagging.removeItemTag({ user, tag, item }).responds({}))
      .then(respond({})),
  { input: { required: ["user", "tag", "item"] } },
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
  List,
  ItemMembership,
  CreateTag,
  EditTag,
  DeleteTag: DeleteTagEndpoint,
  AddItem: AddItemEndpoint,
  RemoveItem: RemoveItemEndpoint,
};
