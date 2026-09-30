import type { BlockInstance, DryRunItem, Template, TemplateId } from "@/types";
import { DATA_LABEL, getBlock, newInstance, sortBlocks } from "@/services/blocks";

/**
 * Mock "Kate" composer. In the real PoC this is where an LLM call would go:
 * it may only pick block IDs from the vetted catalog in blocks.ts, never invent new ones.
 */

export const TEMPLATES: Record<TemplateId, Template> = {
  moving: {
    id: "moving",
    name: "Moving helper",
    blurb: "Checklist, insurance, documents",
    prompt: "Help me when I move, and warn me if something needs a document.",
    questions: [
      {
        id: "housing",
        question: "Are you renting or buying?",
        options: ["Renting", "Buying", "Moving in with someone"],
        defaultAnswer: "Renting",
      },
      {
        id: "channel",
        question: "How should I reach you?",
        options: ["Push notification", "Email", "Only in the app"],
        defaultAnswer: "Push notification",
      },
    ],
  },
  vouchers: {
    id: "vouchers",
    name: "Voucher saver",
    blurb: "Use meal vouchers before they expire",
    prompt: "Don't let my meal vouchers expire.",
    questions: [
      {
        id: "threshold",
        question: "Should I ignore small leftovers?",
        options: ["Under € 5", "Under € 10", "Never ignore"],
        defaultAnswer: "Under € 5",
      },
      {
        id: "channel",
        question: "How should I reach you?",
        options: ["Push notification", "Email", "Only in the app"],
        defaultAnswer: "Push notification",
      },
    ],
  },
  bills: {
    id: "bills",
    name: "Bill watch",
    blurb: "Tell me when a bill goes up",
    prompt: "Tell me when one of my bills goes up.",
    questions: [
      {
        id: "which",
        question: "Which bills should I watch?",
        options: ["All recurring", "Energy only", "Subscriptions only"],
        defaultAnswer: "All recurring",
      },
      {
        id: "channel",
        question: "How should I reach you?",
        options: ["Push notification", "Email", "Only in the app"],
        defaultAnswer: "Push notification",
      },
    ],
  },
  firstJob: {
    id: "firstJob",
    name: "First job",
    blurb: "Salary, taxes, savings set-up",
    prompt: "I just started my first job, help me get my money organised.",
    questions: [
      {
        id: "savings",
        question: "Want a savings suggestion each month?",
        options: ["Yes", "No"],
        defaultAnswer: "Yes",
      },
      {
        id: "channel",
        question: "How should I reach you?",
        options: ["Push notification", "Email", "Only in the app"],
        defaultAnswer: "Push notification",
      },
    ],
  },
};

export const TEMPLATE_LIST: Template[] = Object.values(TEMPLATES);

const KEYWORDS: Record<TemplateId, string[]> = {
  moving: ["move", "moving", "address", "kot", "rent", "house", "verhuis", "déménag"],
  vouchers: ["voucher", "maaltijd", "meal", "cheque", "monizze", "pluxee"],
  bills: ["bill", "price", "increase", "subscription", "energy", "goes up", "factuur"],
  firstJob: ["job", "salary", "loon", "first pay", "employer", "werk"],
};

export function detectTemplate(prompt: string): TemplateId {
  const text = prompt.toLowerCase();
  let best: TemplateId = "moving";
  let bestScore = 0;
  (Object.keys(KEYWORDS) as TemplateId[]).forEach((id) => {
    const score = KEYWORDS[id].filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  });
  return best;
}

export function defaultAnswers(templateId: TemplateId): Record<string, string> {
  const answers: Record<string, string> = {};
  TEMPLATES[templateId].questions.forEach((q) => {
    answers[q.id] = q.defaultAnswer;
  });
  return answers;
}

export function documentsNote(templateId: TemplateId, answers: Record<string, string>): string | null {
  if (templateId === "moving") {
    return answers.housing === "Buying"
      ? "I'll watch for these documents: ID card, notary deed and home insurance certificate."
      : "I'll watch for these documents: ID card, rental contract and fire insurance certificate.";
  }
  if (templateId === "firstJob") return "I'll remind you about your employment contract and first payslip.";
  return null;
}

function channelOptions(answer: string | undefined): Record<string, boolean> {
  return {
    push: answer === "Push notification",
    email: answer === "Email",
    inapp: true,
  };
}

export function composeBlocks(templateId: TemplateId, answers: Record<string, string>): BlockInstance[] {
  const ids: string[] = [];
  switch (templateId) {
    case "moving":
      ids.push("t_address", answers.housing === "Buying" ? "c_buying" : "c_renting");
      ids.push("a_checklist", "a_insurance", "a_documents", "a_notify", "s_scam");
      break;
    case "vouchers":
      ids.push("t_voucher");
      if (answers.threshold !== "Never ignore") ids.push("c_amount");
      ids.push("a_spend", "a_notify", "s_quiet", "s_nopay");
      break;
    case "bills":
      ids.push("t_bill", "a_notify", "a_summary", "s_ask");
      break;
    case "firstJob":
      ids.push("t_salary", "a_checklist");
      if (answers.savings === "Yes") ids.push("a_savings");
      ids.push("a_notify", "s_nopay");
      break;
  }
  const blocks = ids.map((id) => newInstance(id));
  const notify = blocks.find((b) => b.defId === "a_notify");
  if (notify) notify.options = channelOptions(answers.channel);
  return sortBlocks(blocks);
}

export function dryRun(blocks: BlockInstance[]): DryRunItem[] {
  const items: DryRunItem[] = [];
  let lastDate = "";
  sortBlocks(blocks).forEach((inst) => {
    const def = getBlock(inst.defId);
    if (!def.dryRun) return;
    if (inst.permission === "off") return;
    let text = def.dryRun.text;
    let needsOk = def.dryRun.needsOk && inst.permission === "ask";
    if (def.id === "a_insurance") {
      const count = Object.values(inst.options).filter(Boolean).length;
      if (count === 0) return;
      text =
        inst.permission === "remind"
          ? `Would remind you to update ${count} insurance ${count === 1 ? "address" : "addresses"}.`
          : `Would ask you to update ${count} insurance ${count === 1 ? "address" : "addresses"}.`;
    }
    if (def.id === "a_checklist" && inst.permission === "remind") {
      text = "Would remind you to make a checklist.";
    }
    const date = def.dryRun.date || lastDate || "—";
    lastDate = date;
    items.push({ date, text, needsOk });
  });
  return items;
}

export function permissionsSummary(blocks: BlockInstance[]): { can: string[]; cannot: string[] } {
  const data = new Set<string>();
  blocks.forEach((b) => getBlock(b.defId).dataUsed.forEach((d) => data.add(d)));
  const can = Array.from(data).map((d) => DATA_LABEL[d] ?? d);
  return {
    can: can.length ? can : ["send you messages"],
    cannot: ["move money", "sign for you", "share data with partners without your OK"],
  };
}

export function hasTrigger(blocks: BlockInstance[]): boolean {
  return blocks.some((b) => getBlock(b.defId).kind === "trigger");
}
