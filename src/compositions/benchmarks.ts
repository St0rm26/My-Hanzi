import {
  each,
  former,
  no,
  reaction,
  when,
  where,
} from "@mit-sdg/sync-engine/language";
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { concepts } from "../concepts.ts";
import HSK1 from "./benchmarks/HSK1.ts";
import HSK2 from "./benchmarks/HSK2.ts";
import HSK3 from "./benchmarks/HSK3.ts";
import HSK4 from "./benchmarks/HSK4.ts";
import HSK5 from "./benchmarks/HSK5.ts";
import HSK6 from "./benchmarks/HSK6.ts";

const { Registering, Benchmarking, Sessioning, Tagging } = concepts;
type ReactionVars = Record<string, symbol>;

const Initialize = reaction(({ user }: ReactionVars) =>
  when(Registering.register({}).responds({ user }))
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 1",
        items: HSK1,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 2",
        items: HSK2,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 3",
        items: HSK3,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 4",
        items: HSK4,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 5",
        items: HSK5,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: "HSK 6",
        items: HSK6,
      }),
    ),
);

const AddCharacter = reaction(({ user, tag, item, date, benchmark }: ReactionVars) =>
  when(Tagging.addItemTag({ user, tag, item, date }))
    .where(
      Tagging._tags({ user }).is({ tag, name: "Studied" }),
      Benchmarking._benchmarks({ user }).is({ benchmark }),
      Benchmarking._items({ benchmark }).is({ item }),
    )
    .then(Benchmarking.checkBenchmarkItem({ benchmark, item })),
);

const RemoveCharacter = reaction(({ user, tag, item, benchmark }: ReactionVars) =>
  when(Tagging.removeItemTag({ user, tag, item }))
    .where(
      Tagging._tags({ user }).is({ tag, name: "Studied" }),
      Benchmarking._benchmarks({ user }).is({ benchmark }),
      Benchmarking._items({ benchmark }).is({ item }),
    )
    .then(Benchmarking.uncheckBenchmarkItem({ benchmark, item })),
);

const BenchmarkItems = former(
  "the items in a benchmark",
  ({ benchmark }, { item }) =>
    each(Benchmarking._items({ benchmark }).is({ item }))
      .arranged(item, "ascending")
      .form({ item }),
);

const CompletedItems = former(
  "the completed items in a benchmark",
  ({ benchmark }, { item }) =>
    each(Benchmarking._finishedItems({ benchmark }).is({ item }))
      .arranged(item, "ascending")
      .form({ item }),
);

const NotCompletedItems = former(
  "the not-completed items in a benchmark",
  ({ benchmark }, { item }) =>
    each(Benchmarking._unfinishedItems({ benchmark }).is({ item }))
      .arranged(item, "ascending")
      .form({ item }),
);

const UserBenchmarks = former(
  "the benchmarks belonging to a user",
  ({ user }, { benchmark, name }) =>
    each(Benchmarking._benchmarks({ user }).is({ benchmark, name }))
      .arranged(name, "ascending")
      .form({ benchmark, name }),
);

const List = endpoint(
  "/benchmarks/list",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ benchmarks: UserBenchmarks({ user }) })),
  { input: { required: ["session"] } },
);

const Items = endpoint(
  "/benchmarks/items",
  ({ session, benchmark, user }) =>
    receive({ session, benchmark })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Benchmarking._benchmarks({ user }).is({ benchmark }))
          .then(respond({ items: BenchmarkItems({ benchmark }) }))
          .named("found"),
        where(no(Benchmarking._benchmarks({ user }).is({ benchmark })))
          .then(respond({ error: "BENCHMARK_NOT_FOUND" }))
          .named("missing"),
      ),
  { input: { required: ["session", "benchmark"] } },
);

const Completed = endpoint(
  "/benchmarks/completed",
  ({ session, benchmark, user }) =>
    receive({ session, benchmark })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Benchmarking._benchmarks({ user }).is({ benchmark }))
          .then(respond({ items: CompletedItems({ benchmark }) }))
          .named("found"),
        where(no(Benchmarking._benchmarks({ user }).is({ benchmark })))
          .then(respond({ error: "BENCHMARK_NOT_FOUND" }))
          .named("missing"),
      ),
  { input: { required: ["session", "benchmark"] } },
);

const NotCompleted = endpoint(
  "/benchmarks/not-completed",
  ({ session, benchmark, user }) =>
    receive({ session, benchmark })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Benchmarking._benchmarks({ user }).is({ benchmark }))
          .then(respond({ items: NotCompletedItems({ benchmark }) }))
          .named("found"),
        where(no(Benchmarking._benchmarks({ user }).is({ benchmark })))
          .then(respond({ error: "BENCHMARK_NOT_FOUND" }))
          .named("missing"),
      ),
  { input: { required: ["session", "benchmark"] } },
);

export const benchmarksHttp = {
  publicErrors: {
    BENCHMARK_NOT_FOUND: "NOT_FOUND",
  },
} as const;

export const composition = {
  Initialize,
  AddCharacter,
  RemoveCharacter,
  List,
  Items,
  Completed,
  NotCompleted,
};
