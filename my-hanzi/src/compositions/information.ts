import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, no, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { textInput } from "./inputs.ts";

const { InformationCollecting, Sessioning } = concepts;

const AllItemInformation = former(
  "all an item's information",
  ({ item }, { information }) =>
    form({
      information: each(
        InformationCollecting._allInformation({ item }).is({ information }),
      ).first(information),
    }),
);

const View = endpoint(
  "/information/view",
  ({ session, item }) =>
    receive({ session, item })
      .then(Sessioning.use({ session }).responds({}))
      .then(respond({ information: AllItemInformation({ item }) })),
  { input: { required: ["session", "item"] } },
);

const ViewField = endpoint(
  "/information/view-field",
  ({ session, item, fieldName, information }) =>
    receive({ session, item, fieldName })
      .then(Sessioning.use({ session }).responds({}))
      .then(
        where(
          InformationCollecting._information({ item, fieldName }).is({
            information,
          }),
        ).then(respond({ information })),
      ),
  { input: { required: ["session", "item", "fieldName"] } },
);

const AddField = endpoint(
  "/information/add-field",
  ({ session, item, fieldName, description, infoField }) =>
    receive({ session, item, fieldName, description })
      .then(Sessioning.use({ session }).responds({}))
      .then(
        InformationCollecting.addInfoField({
          item,
          fieldName,
          description,
        }).responds({ infoField }),
      )
      .then(respond({ infoField })),
  {
    input: { required: ["session", "item", "fieldName", "description"] },
    validators: { input: textInput },
  },
);

const UpdateField = endpoint(
  "/information/update-field",
  ({ session, item, fieldName, description, infoField }) =>
    receive({ session, item, fieldName, description })
      .then(Sessioning.use({ session }).responds({}))
      .then(
        where(
          InformationCollecting._infoField({ item, fieldName }).is({
            infoField,
          }),
        )
          .then(
            InformationCollecting.editInfoField({
              item,
              infoField,
              description,
            }).responds({ infoField }),
          )
          .then(respond({}))
          .named("found"),
        where(no(InformationCollecting._infoField({ item, fieldName })))
          .then(respond({ error: "INFO_FIELD_NOT_FOUND" }))
          .named("missing"),
      ),
  {
    input: { required: ["session", "item", "fieldName", "description"] },
    validators: { input: textInput },
  },
);

export const informationHttp = {
  publicErrors: {
    ALREADY_COLLECTED_INFORMATION: "CONFLICT",
    INFO_FIELD_NOT_FOUND: "NOT_FOUND",
  },
} as const;

export const composition = {
  View,
  AddField,
  ViewField,
  UpdateField,
};
