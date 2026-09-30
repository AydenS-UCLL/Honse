export type Provider = {
  category: string;
  name: string;
  account: string;
  monthly_usd: number;
};

export type Ticket = {
  id: string;
  source: string;
  subject: string;
  status: string;
  received_at: string;
};

export type ProfileEvent = {
  type: string;
  at: string;
  payload: Record<string, unknown>;
};

export type Profile = {
  id: string;
  name: string;
  headline: string;
  location: string;
  address: {
    current: string;
    type: string;
    lease_ends_in_days: number;
    new_address: string | null;
    deposit_held_usd: number;
  };
  providers: Provider[];
  finances: {
    monthly_net_income_usd: number;
    savings_balance_usd: number;
    subscriptions_count: number;
    subscriptions_monthly_usd: number;
    dining_delivery_this_month_usd: number;
    dining_delivery_3mo_avg_usd: number;
  };
  open_tickets: Ticket[];
  events: ProfileEvent[];
};

export type Tool = {
  name: string;
  description: string;
  tags: string[];
};

export type Suggestion = {
  tool_name: string;
  confidence_score: number;
  trigger_reason: string;
  suggested_action: string;
  source?: "llm" | "heuristic";
};

export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: "Address Change Pipeline",
    description: "Notifies every provider, bank and subscription of a new address.",
    tags: ["moving", "address"],
  },
  {
    name: "Utility Transfer Agent",
    description: "Schedules stop/start dates for energy and internet at the new place.",
    tags: ["moving", "utilities"],
  },
  {
    name: "Deposit Return Checker",
    description: "Tracks move-out inspection and chases the landlord for the deposit.",
    tags: ["moving", "deposit"],
  },
  {
    name: "Personal Financial Advisor",
    description: "Builds a weekly budget and flags overspending categories.",
    tags: ["finance", "budget"],
  },
  {
    name: "Subscription Cancellation Bot",
    description: "Finds unused subscriptions and cancels them on your behalf.",
    tags: ["finance", "subscriptions"],
  },
  {
    name: "High-Bill Alert",
    description: "Watches provider invoices and disputes unexpected increases.",
    tags: ["finance", "bills"],
  },
  {
    name: "Renter's Insurance Updater",
    description: "Moves your policy coverage to the new address on the move date.",
    tags: ["moving", "insurance"],
  },
];
