# My-Hanzi

Personal Hanzi (Chinese character) tracking app with detailed information about each character and sharable collections. Supports both Simplified and Traditional characters.

## Design

The [detailed design](docs/p1-design.md) document outlines the initial project's background and design information for P1. Note that the current design might slightly differ (e.g. new concepts).

The current built-in benchmarks include:

- HSK 1-6 character lists, referenced from [hanziDB](http://hanzidb.org/character-list/hsk)

The visual design study collages are located under the `docs/` folder.

## User Journey

The user journey for this app follows a Mandarin learner who wants an easy interface to track studied characters for an upcoming benchmark exam. More information can be found in the [detailed document](docs/user-journey.md).

## Tests

There are plentiful tests available in the `tests` directory. To run all tests in the directory, run:

```bash
bun test
```

To just run the concept tests in `tests/concepts`, run:

```bash
bun run test:concepts
```

The test outputs are stored [here](tests/output.txt).
