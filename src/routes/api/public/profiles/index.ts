import { createFileRoute } from "@tanstack/react-router";
import { listProfiles } from "@/context/store";
import { AVAILABLE_TOOLS } from "@/context/types";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/profiles/")({
  server: {
    handlers: {
      GET: async () => json({ profiles: listProfiles(), available_tools: AVAILABLE_TOOLS }),
    },
  },
});
