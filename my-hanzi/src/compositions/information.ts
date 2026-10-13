import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, no, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { textInput } from "./inputs.ts";

const { InformationCollecting } = concepts;

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
  ({ item }) =>
    receive({ item }).then(
      respond({ information: AllItemInformation({ item }) }),
    ),
  { input: { required: ["item"] } },
);

const ViewField = endpoint(
  "/information/view-field",
  ({ item, fieldName, information }) =>
    receive({ item, fieldName }).then(
      where(
        InformationCollecting._information({ item, fieldName }).is({
          information,
        }),
      ).then(respond({ information })),
    ),
  { input: { required: ["item", "fieldName"] } },
);

const UpdateField = endpoint(
  "/information/update-field",
  ({ item, fieldName, description, infoField }) =>
    receive({ item, fieldName, description }).then(
      where(
        InformationCollecting._infoField({ item, fieldName }).is({ infoField }),
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
    input: { required: ["item", "fieldName", "description"] },
    validators: { input: textInput },
  },
);

export const composition = {
  View,
  ViewField,
  UpdateField,
};
