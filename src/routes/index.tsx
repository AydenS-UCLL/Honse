import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Profile, Suggestion, Tool } from "@/context/types.ts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Context Engine — Automation Starter Suggestions" },
      {
        name: "description",
        content:
          "Demo console for the context module: mock user profiles, tool suggestions with rationale, and simulated life events.",
      },
      { property: "og:title", content: "Context Engine — Automation Starter Suggestions" },
      {
        property: "og:description",
        content:
          "Inspect demo profiles, see which automations the engine recommends, and fire life events at the runner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Console,
});

const API = "/api/public/profiles";

type ProfileSummary = { id: string; name: string; headline: string; location: string };
type Analysis = { profile_id: string; suggestions: Suggestion[]; engine: string };

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

function Console() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState("moving-alex");
  const [eventType, setEventType] = useState("bill_increased");
  const [amount, setAmount] = useState("45");

  const index = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getJSON<{ profiles: ProfileSummary[]; available_tools: Tool[] }>(API),
  });
  const profile = useQuery({
    queryKey: ["profile", selected],
    queryFn: () => getJSON<Profile>(`${API}/${selected}`),
  });
  const analysis = useQuery({
    queryKey: ["suggestions", selected],
    queryFn: () => getJSON<Analysis>(`${API}/${selected}/suggestions`),
  });

  const fireEvent = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/${selected}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: eventType, payload: { amount: Number(amount) || 0 } }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", selected] });
      qc.invalidateQueries({ queryKey: ["suggestions", selected] });
    },
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Context module
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Starter automation recommendations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Pick a demo profile, review what the engine recommends and why, then simulate a life
            event to watch the suggestions shift.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          {(index.data?.profiles ?? []).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                selected === p.id
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="text-sm font-semibold text-foreground">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.headline}</div>
            </button>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Suggested tools{" "}
              <span className="font-normal text-muted-foreground">
                ({analysis.data?.engine ?? "…"} engine)
              </span>
            </h2>
            <div className="space-y-3">
              {(analysis.data?.suggestions ?? []).map((s) => (
                <article key={s.tool_name} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold text-foreground">{s.tool_name}</h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      {Math.round(s.confidence_score * 100)}% match
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{s.trigger_reason}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    First step: {s.suggested_action}
                  </p>
                </article>
              ))}
              {analysis.isLoading && (
                <p className="text-sm text-muted-foreground">Analyzing context…</p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Simulate an event</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="bill_increased">bill_increased</option>
                  <option value="subscription_added">subscription_added</option>
                  <option value="large_purchase">large_purchase</option>
                  <option value="lease_end_notice">lease_end_notice</option>
                </select>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="amount"
                />
                <button
                  onClick={() => fireEvent.mutate()}
                  disabled={fireEvent.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {fireEvent.isPending ? "Sending…" : "Send event"}
                </button>
              </div>
            </div>
          </div>

          <aside className="md:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Raw context</h2>
            <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-muted p-4 text-xs text-muted-foreground">
              {JSON.stringify(profile.data ?? {}, null, 2)}
            </pre>
          </aside>
        </section>
      </div>
    </div>
  );
}
