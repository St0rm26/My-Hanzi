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
import {
  frequencyBenchmarks,
  traditionalFrequencyBenchmarks,
} from "./benchmarks/Frequency.ts";

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
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[0].name,
        items: frequencyBenchmarks[0].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[1].name,
        items: frequencyBenchmarks[1].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[2].name,
        items: frequencyBenchmarks[2].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[3].name,
        items: frequencyBenchmarks[3].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[4].name,
        items: frequencyBenchmarks[4].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: frequencyBenchmarks[5].name,
        items: frequencyBenchmarks[5].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[0].name,
        items: traditionalFrequencyBenchmarks[0].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[1].name,
        items: traditionalFrequencyBenchmarks[1].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[2].name,
        items: traditionalFrequencyBenchmarks[2].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[3].name,
        items: traditionalFrequencyBenchmarks[3].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[4].name,
        items: traditionalFrequencyBenchmarks[4].items,
      }),
    )
    .then(
      Benchmarking.createBenchmark({
        user,
        name: traditionalFrequencyBenchmarks[5].name,
        items: traditionalFrequencyBenchmarks[5].items,
      }),
    ),
);

const AddCharacter = reaction(
  ({ user, tag, item, date, benchmark }: ReactionVars) =>
    when(Tagging.addItemTag({ user, tag, item, date }))
      .where(
        Tagging._tags({ user }).is({ tag, name: "Studied" }),
        Benchmarking._benchmarks({ user }).is({ benchmark }),
        Benchmarking._items({ benchmark }).is({ item }),
      )
      .then(Benchmarking.checkBenchmarkItem({ benchmark, item })),
);

const RemoveCharacter = reaction(
  ({ user, tag, item, benchmark }: ReactionVars) =>
    when(Tagging.removeItemTag({ user, tag, item }))
      .where(
        Tagging._tags({ user }).is({ tag, name: "Studied" }),
        Benchmarking._benchmarks({ user }).is({ benchmark }),
        Benchmarking._items({ benchmark }).is({ item }),
        Benchmarking._finishedItems({ benchmark }).is({ item }),
      )
      .then(Benchmarking.uncheckBenchmarkItem({ benchmark, item })),
);

const CompleteStudied = reaction(
  ({ user, item, benchmark, name, items }: ReactionVars) =>
    when(
      Benchmarking.ensureBenchmark({ user, name, items }).responds({
        benchmark,
      }),
    )
      .where(
        Tagging._taggedItemsByName({ user, tagName: "Studied" }).is({ item }),
        Benchmarking._unfinishedItems({ benchmark }).is({ item }),
      )
      .then(Benchmarking.checkBenchmarkItem({ benchmark, item })),
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
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 1",
          items: HSK1,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 2",
          items: HSK2,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 3",
          items: HSK3,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 4",
          items: HSK4,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 5",
          items: HSK5,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: "HSK 6",
          items: HSK6,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[0].name,
          items: frequencyBenchmarks[0].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[1].name,
          items: frequencyBenchmarks[1].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[2].name,
          items: frequencyBenchmarks[2].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[3].name,
          items: frequencyBenchmarks[3].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[4].name,
          items: frequencyBenchmarks[4].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: frequencyBenchmarks[5].name,
          items: frequencyBenchmarks[5].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[0].name,
          items: traditionalFrequencyBenchmarks[0].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[1].name,
          items: traditionalFrequencyBenchmarks[1].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[2].name,
          items: traditionalFrequencyBenchmarks[2].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[3].name,
          items: traditionalFrequencyBenchmarks[3].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[4].name,
          items: traditionalFrequencyBenchmarks[4].items,
        }),
      )
      .then(
        Benchmarking.ensureBenchmark({
          user,
          name: traditionalFrequencyBenchmarks[5].name,
          items: traditionalFrequencyBenchmarks[5].items,
        }),
      )
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
    BENCHMARK_ALREADY_EXISTS: "CONFLICT",
  },
} as const;

export const composition = {
  Initialize,
  AddCharacter,
  RemoveCharacter,
  CompleteStudied,
  List,
  Items,
  Completed,
  NotCompleted,
};
