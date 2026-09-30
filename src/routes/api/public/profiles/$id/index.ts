import { createFileRoute } from "@tanstack/react-router";
import { getProfile } from "@/context/store";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/profiles/$id/")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const profile = getProfile(params.id);
        if (!profile) return json({ error: "profile_not_found", id: params.id }, 404);
        return json(profile);
      },
    },
  },
});
