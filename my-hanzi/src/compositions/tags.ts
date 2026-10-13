import { each, former, reaction, when } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";

const { Tagging, Registering, Sharing } = concepts;

const UserTags = former("the tags owned by a user", ({ user }, { tag, name }) =>
  each(Tagging._tags({ user }).is({ tag, name })).form({ tag, name }),
);

const List = endpoint(
  "/tags/list",
  ({ user }) => receive({ user }).then(respond({ tags: UserTags({ user }) })),
  { input: { required: ["user"] } },
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

export const tagsHttp = {
  publicErrors: {
    TAG_ALREADY_EXISTS: "CONFLICT",
    TAG_NOT_FOUND: "NOT_FOUND",
    DEFAULT_TAG_CANNOT_BE_DELETED: "CONFLICT",
  },
} as const;

/*Combines both the FindTaggedCharactersIds and DeleteCollection reactions*/
//TODO Sharing.deleteItems in beta
const DeleteTag = reaction(({ user, tag }) =>
  when(Tagging.deleteTag({ user, tag }).responds({})).then(
    Tagging.findTaggedItemsID({ user, tag }),
  ),
);

/*Combines both the GenerateCharacterId and AddCharacter reactions*/
//TODO Sharing.shareItem in beta
const TagItem = reaction(({ user, tag, item }) =>
  when(Tagging.addItemTag({ user, tag, item }).responds({})).then(
    Tagging.generateTaggedItemID({ user, tag, item }),
  ),
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

export const composition = {
  List,
  CreateTag,
  EditTag,
  DeleteTag: DeleteTagEndpoint,
};
