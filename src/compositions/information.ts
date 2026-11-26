import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";

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

export const informationHttp = {
  publicErrors: {
    INFO_FIELD_NOT_FOUND: "NOT_FOUND",
  },
} as const;

export const composition = {
  View,
  ViewField,
};
