import { createGateway } from "@mit-sdg/sync-engine/boundary";
import { createHttpHandler } from "@mit-sdg/sync-engine-http/handler";
import { assembleApplication } from "./assembly.ts";
import { policy } from "./http.ts";
import { db } from "./db.ts";

const application = assembleApplication();
const gateway = createGateway({ application });
const api = createHttpHandler({ application, gateway, policy });

const dist = `${import.meta.dir}/../frontend/dist`;

const server = Bun.serve({
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    const file = Bun.file(dist + pathname);
    return new Response(
      pathname !== "/" && (await file.exists())
        ? file
        : Bun.file(`${dist}/index.html`),
    );
  },
  routes: {
    "/api/*": api,
    "/health": async () => {
      try {
        await db
          .collection("tagging.tags")
          .findOne({}, { maxTimeMS: 2000, timeoutMS: 3000 });
        return Response.json(
          { status: "ok" },
          { headers: { "Cache-Control": "no-store" } },
        );
      } catch {
        return Response.json(
          { status: "unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
    },
  },
});

console.log(`Backend ready on ${server.url}`);
