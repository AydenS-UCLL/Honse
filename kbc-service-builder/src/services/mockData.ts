import type { Approval, Service } from "@/types";
import { newInstance } from "@/services/blocks";

export const INITIAL_SERVICES: Service[] = [
  {
    id: "moving-helper",
    name: "Moving helper",
    prompt: "Help me when I move, and warn me if something needs a document.",
    templateId: "moving",
    status: "active",
    blocks: [
      newInstance("t_address", "mh1"),
      newInstance("c_renting", "mh2"),
      newInstance("a_checklist", "mh3"),
      newInstance("a_insurance", "mh4"),
      newInstance("a_documents", "mh5"),
      newInstance("s_scam", "mh6"),
    ],
    runs: 4,
    tasksDone: 3,
    since: "30 Sep",
    log: [
      { id: "l1", date: "1 Oct", text: "Flagged: documents for city registration", detail: "Used: address_changed", status: "info" },
      { id: "l2", date: "30 Sep", text: "Asked to update car insurance address", detail: "Waiting · used: address_changed, my_kbc_policies", status: "waiting" },
      { id: "l3", date: "30 Sep", text: "Fire insurance address updated", detail: "You approved and signed at 18:42", status: "done" },
      { id: "l4", date: "30 Sep", text: "Checklist created, 7 tasks", detail: "Used: address_changed", status: "info" },
    ],
  },
  {
    id: "voucher-saver",
    name: "Voucher saver",
    prompt: "Don't let my meal vouchers expire.",
    templateId: "vouchers",
    status: "active",
    blocks: [
      newInstance("t_voucher", "vs1"),
      newInstance("c_amount", "vs2"),
      newInstance("a_spend", "vs3"),
      newInstance("a_notify", "vs4"),
      newInstance("s_quiet", "vs5"),
      newInstance("s_nopay", "vs6"),
    ],
    runs: 2,
    tasksDone: 2,
    since: "12 Aug",
    nextRun: "15 Oct",
    log: [
      { id: "v1", date: "17 Sep", text: "Suggested spending € 21.00 before it expired", detail: "Used: voucher_balance, merchant_names", status: "done" },
      { id: "v2", date: "12 Aug", text: "Service turned on", detail: "You signed at 12:10", status: "info" },
    ],
  },
  {
    id: "bill-watch",
    name: "Bill watch",
    prompt: "Tell me when one of my bills goes up.",
    templateId: "bills",
    status: "paused",
    blocks: [
      newInstance("t_bill", "bw1"),
      newInstance("a_notify", "bw2"),
      newInstance("a_summary", "bw3"),
      newInstance("s_ask", "bw4"),
    ],
    runs: 5,
    tasksDone: 5,
    since: "2 Sep",
    log: [
      { id: "b1", date: "2 Sep", text: "Service paused", detail: "By you", status: "info" },
      { id: "b2", date: "5 Aug", text: "Energy bill increase flagged", detail: "Used: recurring_payments", status: "done" },
    ],
  },
];

export const INITIAL_APPROVALS: Approval[] = [
  {
    id: "ap-car-address",
    serviceId: "moving-helper",
    title: "Update the address on your car insurance?",
    beforeLabel: "Current address",
    before: "[OLD ADDRESS], 3000 Leuven",
    afterLabel: "New address",
    after: "Overpoortstraat [NR], 9000 Gent",
    impactLabel: "Premium after change",
    impact: "[NEW PREMIUM] / month",
    reason: "Your service saw an address change on 30 Sep. Your postcode affects the premium, so you decide.",
    since: "30 Sep",
    signSummary: "Change the address on your car insurance to Overpoortstraat [NR], 9000 Gent.",
  },
];
