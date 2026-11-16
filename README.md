# MyHanzi

Personal Simplified and Traditional Hanzi (Chinese character) tracking and collecting app with detailed information about each character. Collections sharable and HSK and character frequency benchmarks help users check their progress.

## Delployed URL

This app is deployed at this [URL](https://myhanzi.mit-sdg.dev).

## File Structure

The relevant folders and files are listed below:

```
design/                                 # Contains all design specs
  compositions/                         # Composition design specs
  concepts/                             # Concept design specs
  reactions/                            # Reaction design specs
  ...
docs/                                   # App design documents; not specs
  user_testing/                         # User testing files
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

## User Testing

User testing was conducted on 2 participants to identify flaws and possible points of confusion that could arise whilst using the app. The relevant files, linked below, are all in the `docs/user_testing` folder:

- [Task list](docs/user_testing/task-list.md): defines 8 tasks that participants were asked to do
- [Study reports](docs/user_testing/study-reports.md) detail interesting observations made during the two user tests
- [Flaws and opportunities](docs/user_testing/flaws-and-opportunities.md) lists a few flaws and opportunities for improvement based on observations during the user tests

### Demo Video

A demo video that illustrates the user journey is linked [here](https://youtu.be/-29vpvES0ik).

## Building, Running, and Testing

### Prerequisites and setup

Run these commands from the repository root:

1. Install [Bun](https://bun.sh/) (the version specified in `package.json` is 1.4.2).
2. Install the project dependencies:

   ```bash
   bun install --frozen-lockfile
   ```

3. To run the app locally, install [Podman](https://podman.io/) and a working Podman Compose provider. On Windows and macOS, initialize a Podman machine once and start it before running container commands:

   ```bash
   podman machine init
   podman machine start
   ```

   Skip initialization if the machine already exists. On Linux, use a running Podman service instead. Podman is not required just to build the frontend.

4. For local development or preview, copy `.env.example` to `.env` in the repository root:

   ```bash
   cp .env.example .env
   ```

   In PowerShell, use `Copy-Item .env.example .env` instead. The example sets `MONGODB_URL` for the local MongoDB container. If using another MongoDB instance, set `MONGODB_URL` to that instance's connection string instead. Do not commit `.env`.

### Building the app

```bash
bun run build
```

This builds the production frontend into `frontend/dist/`. It does not start MongoDB or the app, and does not compile the backend: Bun runs the backend TypeScript directly.

### Running locally

For development with automatic reloads:

```bash
bun run dev
```

This starts the MongoDB container, the backend at http://127.0.0.1:3000, and the Vite frontend at http://localhost:8080. Open the frontend URL in your browser. The frontend proxies API requests to the backend. Stop the development processes with Ctrl+C; MongoDB continues running in its container.

To build the frontend and serve it from the backend without watch mode:

```bash
bun run preview
```

Open http://127.0.0.1:3000. Preview also starts the MongoDB container. To run the backend separately, first build the frontend, ensure MongoDB is available and `MONGODB_URL` is set, then run `bun run start`.

### Running in containers

Alternatively, run MongoDB, the backend, and the frontend in containers:

```bash
bun run up
```

This builds the images, starts the services, and checks the API. Open http://localhost:8080. The Compose configuration supplies the backend's MongoDB connection; the local `.env` file is not needed for this workflow.

Useful container commands:

```bash
bun run logs      # View backend and frontend logs
bun run db:logs   # View MongoDB logs
bun run down      # Stop the containers; keep MongoDB data
```

`bun run db:reset` stops the containers **and deletes the local MongoDB volume**. Use it only when you want to discard all local app data.

### Checking and testing changes

After changing concept or composition designs, validate the designs, regenerate artifacts, and run the project checks:

```bash
bun run check:design
bun run generate
bun run check
```

`bun run check` checks concept source, generated artifacts, and TypeScript. To run tests:

```bash
bun test                # All tests
bun run test:concepts   # Concept tests, with a longer timeout
bun test tests/frontend # Frontend tests
```

The concept tests use an in-memory MongoDB server and may download a MongoDB binary on the first run. The test outputs are stored [here](tests/output.txt).
