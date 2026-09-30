import { createFileRoute } from "@tanstack/react-router";
import { analyzeProfileForTools } from "@/context/analyzer";
import { getProfile } from "@/context/store";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/profiles/$id/suggestions")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!getProfile(params.id)) {
          return json({ error: "profile_not_found", id: params.id }, 404);
        }
        return json(await analyzeProfileForTools(params.id));
      },
    },
  },
});
