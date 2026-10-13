import { reaction, when } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { endpoint, receive } from "@mit-sdg/sync-engine/boundary";

const { Tagging, Registering, Sharing } = concepts;

const Initialize = reaction(({ user }) =>
  when(Registering.register({}).responds({ user })).then(
    Tagging.createTag({ user, name: "Studied" }),
  ),
);

const CreateTag = endpoint(
  "/tags/create-tag",
  ({ user, name }) =>
    receive({ user, name }).then(Tagging.createTag({ user, name })),
  { input: { required: ["user", "name"] } },
);

const EditTag = endpoint(
  "/tags/edit-tag",
  ({ user, tag, name }) =>
    receive({ user, tag, name }).then(
      Tagging.renameTag({ user, tag, newName: name }),
    ),
  { input: { required: ["user", "tag", "name"] } },
);

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
