import seed from "./profiles.json";
import type { Profile, ProfileEvent } from "./types.ts";

// In-memory demo store. Seeded from profiles.json on first access.
const profiles = new Map<string, Profile>(
  (seed as Profile[]).map((p) => [p.id, structuredClone(p)]),
);

export function listProfiles() {
  return [...profiles.values()].map((p) => ({
    id: p.id,
    name: p.name,
    headline: p.headline,
    location: p.location,
  }));
}

export function getProfile(id: string): Profile | undefined {
  return profiles.get(id);
}

export function appendEvent(id: string, event: ProfileEvent): Profile | undefined {
  const profile = profiles.get(id);
  if (!profile) return undefined;
  profile.events = [event, ...profile.events];
  applySideEffects(profile, event);
  return profile;
}

// Small simulation so events visibly change the context the analyzer reads.
function applySideEffects(profile: Profile, event: ProfileEvent) {
  const payload = event.payload ?? {};
  const amount = Number(payload["amount"] ?? 0);

  if (event.type === "bill_increased" && amount > 0) {
    const provider = String(payload["provider"] ?? "");
    const target =
      profile.providers.find((p) => p.name.toLowerCase() === provider.toLowerCase()) ??
      profile.providers[0];
    if (target) target.monthly_usd = Math.round((target.monthly_usd + amount) * 100) / 100;
  }

  if (event.type === "subscription_added" && amount > 0) {
    profile.finances.subscriptions_count += 1;
    profile.finances.subscriptions_monthly_usd += amount;
  }

  if (event.type === "large_purchase" && amount > 0) {
    profile.finances.savings_balance_usd = Math.max(
      0,
      profile.finances.savings_balance_usd - amount,
    );
  }

  if (event.type === "lease_signed" && payload["address"]) {
    profile.address.new_address = String(payload["address"]);
  }

  if (event.type === "lease_end_notice" && payload["days_remaining"] != null) {
    profile.address.lease_ends_in_days = Number(payload["days_remaining"]);
  }
}
