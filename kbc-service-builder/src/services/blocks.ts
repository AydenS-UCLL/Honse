import type { BlockDef, BlockInstance, BlockKind, Permission, Risk } from "@/types";

export const BLOCKS: BlockDef[] = [
  // Triggers
  {
    id: "t_address",
    kind: "trigger",
    title: "My address changes",
    subtitle: "Trigger · reads address only",
    description: "Starts the service when you update your address at KBC.",
    risk: "read",
    dataUsed: ["address_changed"],
    dryRun: { date: "30 Sep", text: "Address change detected." },
  },
  {
    id: "t_voucher",
    kind: "trigger",
    title: "A voucher batch expires within 14 days",
    subtitle: "Trigger · reads voucher balance",
    description: "Starts when a batch of meal vouchers is close to its 12-month expiry.",
    risk: "read",
    dataUsed: ["voucher_balance"],
    dryRun: { date: "17 Oct", text: "€ 38.50 voucher batch found, expiring 31 Oct." },
  },
  {
    id: "t_bill",
    kind: "trigger",
    title: "A recurring bill goes up",
    subtitle: "Trigger · reads recurring payments",
    description: "Starts when a direct debit or subscription charges more than last time.",
    risk: "read",
    dataUsed: ["recurring_payments"],
    dryRun: { date: "5 Sep", text: "Energy bill went from [OLD AMOUNT] to [NEW AMOUNT]." },
  },
  {
    id: "t_salary",
    kind: "trigger",
    title: "A new salary arrives",
    subtitle: "Trigger · reads incoming salary",
    description: "Starts when a salary from a new employer lands on your account.",
    risk: "read",
    dataUsed: ["incoming_salary"],
    dryRun: { date: "29 Sep", text: "First salary from a new employer detected." },
  },
  // Conditions
  {
    id: "c_renting",
    kind: "condition",
    title: "I'm renting",
    subtitle: "Skips the steps for buyers",
    description: "Only runs the renting steps: fire insurance for tenants, deposit, landlord.",
    risk: "logic",
    dataUsed: [],
  },
  {
    id: "c_buying",
    kind: "condition",
    title: "I'm buying",
    subtitle: "Adds the steps for home owners",
    description: "Runs the buying steps: deed date, home insurance, renovation.",
    risk: "logic",
    dataUsed: [],
  },
  {
    id: "c_amount",
    kind: "condition",
    title: "Amount is above € 5",
    subtitle: "Ignores tiny leftovers",
    description: "Only continues when the amount involved is above the limit.",
    risk: "logic",
    dataUsed: [],
  },
  {
    id: "c_weekdays",
    kind: "condition",
    title: "Only on weekdays",
    subtitle: "Waits until Monday if needed",
    description: "Holds the next steps until a weekday.",
    risk: "logic",
    dataUsed: [],
  },
  // Actions
  {
    id: "a_checklist",
    kind: "action",
    title: "Build a checklist",
    subtitle: "",
    description: "Creates a to-do list for your situation with due dates.",
    risk: "read",
    dataUsed: [],
    permissions: ["automatic", "remind", "off"],
    defaultPermission: "automatic",
    dryRun: { date: "30 Sep", text: "Checklist created with 7 tasks." },
  },
  {
    id: "a_insurance",
    kind: "action",
    title: "Update insurance addresses",
    subtitle: "",
    description: "Prepares the address change on your KBC policies. You approve and sign each one.",
    risk: "change",
    dataUsed: ["my_kbc_policies"],
    permissions: ["automatic", "ask", "remind"],
    defaultPermission: "ask",
    blockedPermissions: ["automatic"],
    blockedReason: "Not allowed for changes to your contracts",
    optionsLabel: "Which policies?",
    options: [
      { id: "fire", label: "Fire insurance", defaultOn: true },
      { id: "car", label: "Car insurance", defaultOn: true },
      { id: "travel", label: "Travel insurance", defaultOn: false },
    ],
    dryRun: { date: "30 Sep", text: "Would ask you to update insurance addresses.", needsOk: true },
  },
  {
    id: "a_documents",
    kind: "action",
    title: "Flag tasks that need a document",
    subtitle: "",
    description: "Tells you which documents to bring, before you need them.",
    risk: "read",
    dataUsed: [],
    permissions: ["automatic", "off"],
    defaultPermission: "automatic",
    dryRun: { date: "1 Oct", text: "City registration flagged: bring your ID card and rental contract." },
  },
  {
    id: "a_notify",
    kind: "action",
    title: "Notify me",
    subtitle: "",
    description: "Sends you a short message with what happened and what you can do.",
    risk: "read",
    dataUsed: [],
    permissions: ["automatic", "off"],
    defaultPermission: "automatic",
    optionsLabel: "How should we reach you?",
    options: [
      { id: "push", label: "Push notification", defaultOn: true },
      { id: "email", label: "Email", defaultOn: false },
      { id: "inapp", label: "In the app", defaultOn: true },
    ],
    dryRun: { date: "", text: "You'd get a notification with a suggestion." },
  },
  {
    id: "a_spend",
    kind: "action",
    title: "Suggest where to spend vouchers",
    subtitle: "",
    description: "Finds shops you already use that accept meal vouchers.",
    risk: "read",
    dataUsed: ["merchant_names"],
    permissions: ["automatic", "off"],
    defaultPermission: "automatic",
    dryRun: { date: "17 Oct", text: "Suggested your Tuesday shop at [SUPERMARKET]." },
  },
  {
    id: "a_summary",
    kind: "action",
    title: "Summarise my open requests",
    subtitle: "",
    description: "One overview of open claims, messages and requests at KBC.",
    risk: "read",
    dataUsed: ["open_requests"],
    permissions: ["automatic", "off"],
    defaultPermission: "automatic",
    dryRun: { date: "6 Sep", text: "Summary of 2 open requests prepared." },
  },
  {
    id: "a_parcel",
    kind: "action",
    title: "Redirect a parcel",
    subtitle: "",
    description: "Asks the delivery partner to send parcels to your new address.",
    risk: "partner",
    dataUsed: ["parcel_tracking"],
    permissions: ["automatic", "ask", "remind"],
    defaultPermission: "ask",
    blockedPermissions: ["automatic"],
    blockedReason: "Sharing with a partner always needs your OK",
    dryRun: { date: "2 Oct", text: "Would ask to redirect 1 parcel.", needsOk: true },
  },
  {
    id: "a_savings",
    kind: "action",
    title: "Suggest a savings amount",
    subtitle: "",
    description: "Proposes a monthly amount to put aside. Never moves money itself.",
    risk: "read",
    dataUsed: ["incoming_salary"],
    permissions: ["remind", "off"],
    defaultPermission: "remind",
    dryRun: { date: "29 Sep", text: "Would suggest putting aside [AMOUNT] per month." },
  },
  {
    id: "a_money",
    kind: "action",
    title: "Move money between my accounts",
    subtitle: "Not available in services",
    description: "Services can suggest, never move money.",
    risk: "change",
    dataUsed: [],
    unavailable: true,
  },
  // Safeguards
  {
    id: "s_scam",
    kind: "safeguard",
    title: "Check new payees with Scam Pause",
    subtitle: "Always on · can't be removed",
    description: "New payees over € 500 get a 10-minute check before money leaves.",
    risk: "safeguard",
    dataUsed: ["payee_names"],
    locked: true,
    dryRun: { date: "30 Sep", text: "Scam Pause would have held € 1,500 to a new payee for 10 minutes." },
  },
  {
    id: "s_nopay",
    kind: "safeguard",
    title: "Never pay or top up automatically",
    subtitle: "Always on · can't be removed",
    description: "This service can never start a payment.",
    risk: "safeguard",
    dataUsed: [],
    locked: true,
  },
  {
    id: "s_quiet",
    kind: "safeguard",
    title: "Quiet hours 22:00 – 08:00",
    subtitle: "Holds messages overnight",
    description: "No notifications at night. They arrive at 08:00 instead.",
    risk: "safeguard",
    dataUsed: [],
  },
  {
    id: "s_ask",
    kind: "safeguard",
    title: "Ask me before acting",
    subtitle: "Every step waits for your OK",
    description: "Turns every action into a suggestion you confirm.",
    risk: "safeguard",
    dataUsed: [],
  },
];

export const KIND_ORDER: BlockKind[] = ["trigger", "condition", "action", "safeguard"];

export const KIND_TAG: Record<BlockKind, string> = {
  trigger: "WHEN",
  condition: "IF",
  action: "THEN",
  safeguard: "GUARD",
};

export const KIND_LABEL: Record<BlockKind, string> = {
  trigger: "Triggers",
  condition: "Conditions",
  action: "Actions",
  safeguard: "Safeguards",
};

export const RISK_LABEL: Record<Risk, string> = {
  read: "Reads only",
  change: "Changes data",
  partner: "Partner",
  logic: "Logic",
  safeguard: "Safeguard",
};

export const PERMISSION_LABEL: Record<Permission, string> = {
  automatic: "Automatic",
  ask: "Ask me first",
  remind: "Only remind me",
  off: "Off",
};

export const PERMISSION_HINT: Record<Permission, string> = {
  automatic: "Runs by itself",
  ask: "You approve and sign each change",
  remind: "You do it yourself",
  off: "Block stays in the service but does nothing",
};

export const DATA_LABEL: Record<string, string> = {
  address_changed: "see address changes",
  my_kbc_policies: "read your list of KBC policies",
  payee_names: "read payee names on new transfers",
  voucher_balance: "read your voucher balance per batch",
  merchant_names: "see merchant names from card payments",
  recurring_payments: "see recurring payments",
  incoming_salary: "see incoming salary",
  open_requests: "read your open claims and messages",
  parcel_tracking: "share your new address with the courier, per approval",
};

export function getBlock(defId: string): BlockDef {
  const def = BLOCKS.find((b) => b.id === defId);
  if (!def) throw new Error(`Unknown block ${defId}`);
  return def;
}

export function newUid(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function newInstance(defId: string, uid: string = newUid()): BlockInstance {
  const def = getBlock(defId);
  const options: Record<string, boolean> = {};
  def.options?.forEach((o) => {
    options[o.id] = o.defaultOn;
  });
  return { uid, defId, permission: def.defaultPermission, options };
}

export function sortBlocks(blocks: BlockInstance[]): BlockInstance[] {
  return [...blocks].sort(
    (a, b) => KIND_ORDER.indexOf(getBlock(a.defId).kind) - KIND_ORDER.indexOf(getBlock(b.defId).kind),
  );
}

export function blockSubtitle(inst: BlockInstance): string {
  const def = getBlock(inst.defId);
  if (def.kind !== "action" || !inst.permission) return def.subtitle;
  if (inst.permission === "ask") return "Asks me first · needs my signature";
  if (inst.permission === "off") return "Off";
  if (inst.permission === "remind") return "Only reminds me";
  return def.risk === "read" ? "Automatic · read only" : "Automatic";
}

export function isWarningSubtitle(inst: BlockInstance): boolean {
  return inst.permission === "ask";
}
