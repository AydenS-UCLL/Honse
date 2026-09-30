import { getProfile } from "./store.ts";
import { AVAILABLE_TOOLS, type Profile, type Suggestion, type Tool } from "./types.ts";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const clamp = (n: number) => Math.max(0, Math.min(1, Math.round(n * 100) / 100));

/**
 * Deterministic heuristic engine. Always available, never throws.
 */
export function heuristicSuggestions(profile: Profile, tools: Tool[]): Suggestion[] {
  const allowed = new Set(tools.map((t) => t.name));
  const out: Suggestion[] = [];
  const f = profile.finances;
  const a = profile.address;

  const push = (s: Suggestion) => {
    if (allowed.has(s.tool_name)) out.push({ ...s, source: "heuristic" });
  };

  // --- Moving signals -------------------------------------------------
  const moving = a.new_address != null || a.lease_ends_in_days <= 45;
  if (moving) {
    const days = a.lease_ends_in_days;
    push({
      tool_name: "Address Change Pipeline",
      confidence_score: clamp(a.new_address ? 0.95 : 0.7),
      trigger_reason: a.new_address
        ? `You signed a new lease at ${a.new_address} and your current lease ends in ${days} days.`
        : `Your lease ends in ${days} days, so an address change is likely imminent.`,
      suggested_action: `Draft address-change notices for your ${profile.providers.length} providers and confirm each one.`,
    });
    push({
      tool_name: "Utility Transfer Agent",
      confidence_score: clamp(0.88),
      trigger_reason: `Energy and internet are still tied to ${a.current}.`,
      suggested_action: "Schedule stop dates at the old place and start dates at the new one.",
    });
    push({
      tool_name: "Deposit Return Checker",
      confidence_score: clamp(a.deposit_held_usd > 0 ? 0.82 : 0.5),
      trigger_reason: `Your landlord holds a ${usd(a.deposit_held_usd)} deposit and has opened a move-out inspection notice.`,
      suggested_action: "Book the inspection, photograph the unit and set a 21-day refund deadline.",
    });
    push({
      tool_name: "Renter's Insurance Updater",
      confidence_score: clamp(0.6),
      trigger_reason: "Your renter's policy still covers the old address.",
      suggested_action: "Move coverage to the new address effective on the move date.",
    });
  }

  // --- Financial stress signals ---------------------------------------
  const diningJump =
    f.dining_delivery_3mo_avg_usd > 0
      ? f.dining_delivery_this_month_usd / f.dining_delivery_3mo_avg_usd - 1
      : 0;
  const burn = (f.subscriptions_monthly_usd + f.dining_delivery_this_month_usd) /
    Math.max(1, f.monthly_net_income_usd);
  const thinSavings = f.savings_balance_usd < f.monthly_net_income_usd;

  if (diningJump > 0.25 || burn > 0.3 || thinSavings) {
    push({
      tool_name: "Personal Financial Advisor",
      confidence_score: clamp(0.6 + (thinSavings ? 0.25 : 0) + (diningJump > 0.5 ? 0.12 : 0)),
      trigger_reason: `Your food spending is up ${Math.round(diningJump * 100)}% this month and savings sit at ${usd(f.savings_balance_usd)} — under one month of income.`,
      suggested_action: "Build a weekly spending cap and flag categories running over budget.",
    });
  }

  if (f.subscriptions_count >= 5 || f.subscriptions_monthly_usd >= 100) {
    push({
      tool_name: "Subscription Cancellation Bot",
      confidence_score: clamp(0.55 + Math.min(0.35, f.subscriptions_count * 0.04)),
      trigger_reason: `You have ${f.subscriptions_count} active subscriptions costing ${usd(f.subscriptions_monthly_usd)} every month.`,
      suggested_action: "Rank subscriptions by last use and cancel the unused ones for you.",
    });
  }

  const billEvent = profile.events.find((e) => e.type === "bill_increased");
  if (billEvent || profile.open_tickets.some((t) => /increase|bill/i.test(t.subject))) {
    const amount = Number((billEvent?.payload as Record<string, unknown>)?.["amount"] ?? 0);
    push({
      tool_name: "High-Bill Alert",
      confidence_score: clamp(amount > 0 ? 0.78 : 0.62),
      trigger_reason: amount
        ? `A provider bill jumped by ${usd(amount)} compared with last month.`
        : "One of your providers flagged an unusual invoice increase.",
      suggested_action: "Compare the invoice with prior months and open a dispute if it is unexplained.",
    });
  }

  return out
    .sort((x, y) => y.confidence_score - x.confidence_score)
    .slice(0, 3);
}

function buildPrompt(profile: Profile, tools: Tool[]) {
  return `You are a context analyzer for an automation builder.
Pick the 2-3 most useful tools for this user from the catalogue.

TOOL CATALOGUE:
${tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

USER CONTEXT (JSON):
${JSON.stringify(profile, null, 2)}

Respond with STRICT JSON only, no prose, shaped exactly as:
{"suggestions":[{"tool_name":"<must match catalogue exactly>","confidence_score":0.0,"trigger_reason":"one concise sentence citing real numbers from the context","suggested_action":"what the tool does first"}]}`;
}

/**
 * Main entry point. Tries the LLM, silently falls back to heuristics.
 */
export async function analyzeProfileForTools(
  profileId: string,
  availableTools: Tool[] = AVAILABLE_TOOLS,
): Promise<{ profile_id: string; suggestions: Suggestion[]; engine: "llm" | "heuristic" }> {
  const profile = getProfile(profileId);
  if (!profile) throw new Error(`Unknown profile: ${profileId}`);

  const fallback = heuristicSuggestions(profile, availableTools);

  try {
    const llm = await llmSuggestions(profile, availableTools);
    if (llm && llm.length) return { profile_id: profileId, suggestions: llm, engine: "llm" };
  } catch {
    // demo must never crash on a flaky network
  }
  return { profile_id: profileId, suggestions: fallback, engine: "heuristic" };
}

async function llmSuggestions(profile: Profile, tools: Tool[]): Promise<Suggestion[] | null> {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(profile, tools) }],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;

  const parsed = JSON.parse(raw) as { suggestions?: Suggestion[] };
  const names = new Set(tools.map((t) => t.name));
  const clean = (parsed.suggestions ?? [])
    .filter((s) => s && names.has(s.tool_name))
    .slice(0, 3)
    .map((s) => ({
      tool_name: s.tool_name,
      confidence_score: clamp(Number(s.confidence_score) || 0.5),
      trigger_reason: String(s.trigger_reason ?? ""),
      suggested_action: String(s.suggested_action ?? ""),
      source: "llm" as const,
    }));
  return clean.length ? clean : null;
}
