## Running the app

- `bun run dev` starts MongoDB in a container, then the backend at http://127.0.0.1:3000 and the frontend at http://127.0.0.1:8080, both in watch mode.
- `bun run up` runs all three in containers. `bun run down` stops them, and `bun run db:reset` deletes the local data.

## Design

- Reference an existing application built on [sync-engine](https://github.com/mit-sdg/sync-engine) for guidance on design: [ConceptBox](https://github.com/mit-sdg/conceptbox/tree/main).
- Change `design/` before the code. Check it with `bun run check:design`, then run `bun run generate` and `bun run check`.
