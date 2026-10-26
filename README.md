# MyHanzi

Personal Simplified and Traditional Hanzi (Chinese character) tracking and collecting app with detailed information about each character. Collections sharable and HSK and character frequency benchmarks help users check their progress.

## File Structure

The relevant folders and files are listed below:

```
design/                                 # Contains all design specs
  compositions/                         # Composition design specs
  concepts/                             # Concept design specs
  reactions/                            # Reaction design specs
  ...
docs/                                   # App design documents; not specs
  design-document.md                    # The final design document
  user-journey.md                       # An example user journey
  visual-design-study-colors.png        # Visual design color study collage
  visual-design-study-typography.png    # Visual design typography study collage
  ...
frontend/                               # Frontend code
  ...
src/                                    # Source code
  compositions/                         # Code implementation of compositions
  concepts/                             # Code implementation of concepts
  ...
tests/                                  # Test suites
  concepts/                             # Concept tests
  ...
README.md                               # This file
...
```

## App Design

The [detailed design](docs/p1-design.md) document outlines the initial project's background and design information for P1. Note that the current design differs from this document (e.g. new concepts). The most significant design changes are noted in the final [design document](docs/design-document.md)

The current built-in benchmarks include:

- HSK 1-6 character lists, referenced from [hanziDB](http://hanzidb.org/character-list/hsk)
- Character frequency lists, referenced from [HanziCraft](https://hanzicraft.com/lists/frequency)

The visual design study collages are located under the `docs/` folder. There is both a [color](docs/visual-design-study-colors.png) and [typography](docs/visual-design-study-typography.png) collage.

Concept, composition, and reaction designs are found in `design/`.

## User Journey

The user journey for this app follows a Mandarin learner who wants an easy interface to track studied characters for an upcoming benchmark HSK exam. More information can be found in [here](docs/user-journey.md).

## Building, Running, and Testing

### Building the App

To build the app:

```bash
bun run build
```

### Running the App

To run the app locally with MongoDB, ensure that there is a running Podman machine on your device. If there is no Podman machine, run:

```bash
podman machine init
```

Then, to start the machine, run:

```bash
podman machine start
```

After the podman machine is running, run:

```bash
bun run preview
```

The backend will be ready at http://127.0.0.1:3000.

If you want to run the app in dev mode, run:

```bash
bun run dev
```

The frontend will be ready at http://127.0.0.1:8080; the backend will be ready at http://127.0.0.1:3000. Whilst making concept and composition design changes, check its validity and then update the `generated/` files:

```bash
bun run check:design
bun run generate
```

### Testing the App

There are plentiful tests available in the `tests` directory. To run all tests in the directory, run:

```bash
bun test
```

To just run the concept tests in `tests/concepts`, run:

```bash
bun run test:concepts
```

The test outputs are stored [here](tests/output.txt).
