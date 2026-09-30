import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { analyzeProfileForTools } from "@/context/analyzer";
import { appendEvent, getProfile } from "@/context/store";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });

const EventSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
  at: z.string().optional(),
});

/**
 * Hand-off to Person 1's runner. Fire-and-forget: a missing or failing
 * runner must never break the demo.
 */
async function notifyRunner(body: unknown) {
  const url = process.env["RUNNER_URL"];
  if (!url) return { forwarded: false, reason: "RUNNER_URL not configured" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return { forwarded: res.ok, status: res.status };
  } catch (e) {
    return { forwarded: false, reason: (e as Error).message };
  }
}

export const Route = createFileRoute("/api/public/profiles/$id/events")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!getProfile(params.id)) {
          return json({ error: "profile_not_found", id: params.id }, 404);
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        const parsed = EventSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ error: "invalid_event", issues: parsed.error.issues }, 400);
        }

        const event = {
          type: parsed.data.type,
          at: parsed.data.at ?? new Date().toISOString().slice(0, 10),
          payload: parsed.data.payload as Record<string, unknown>,
        };

        appendEvent(params.id, event);
        const analysis = await analyzeProfileForTools(params.id);
        const runner = await notifyRunner({ event, ...analysis });

        return json({ accepted: event, runner, ...analysis }, 201);
      },
    },
  },
});
