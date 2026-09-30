export type BlockKind = "trigger" | "condition" | "action" | "safeguard";

export type Risk = "read" | "change" | "partner" | "logic" | "safeguard";

export type Permission = "automatic" | "ask" | "remind" | "off";

export type TemplateId = "moving" | "vouchers" | "bills" | "firstJob";

export interface BlockOption {
  id: string;
  label: string;
  defaultOn: boolean;
}

export interface DryRunSpec {
  date: string;
  text: string;
  needsOk?: boolean;
}

export interface BlockDef {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle: string;
  description: string;
  risk: Risk;
  dataUsed: string[];
  permissions?: Permission[];
  defaultPermission?: Permission;
  blockedPermissions?: Permission[];
  blockedReason?: string;
  locked?: boolean;
  unavailable?: boolean;
  optionsLabel?: string;
  options?: BlockOption[];
  dryRun?: DryRunSpec;
}

export interface BlockInstance {
  uid: string;
  defId: string;
  permission?: Permission;
  options: Record<string, boolean>;
}

export type ServiceStatus = "active" | "paused";

export interface LogEntry {
  id: string;
  date: string;
  text: string;
  detail: string;
  status: "done" | "waiting" | "info";
}

export interface Service {
  id: string;
  name: string;
  prompt: string;
  templateId: TemplateId;
  status: ServiceStatus;
  blocks: BlockInstance[];
  runs: number;
  tasksDone: number;
  since: string;
  nextRun?: string;
  log: LogEntry[];
}

export interface Approval {
  id: string;
  serviceId: string;
  title: string;
  beforeLabel: string;
  before: string;
  afterLabel: string;
  after: string;
  impactLabel: string;
  impact: string;
  reason: string;
  since: string;
  signSummary: string;
}

export interface ClarifyQuestion {
  id: string;
  question: string;
  options: string[];
  defaultAnswer: string;
}

export interface Template {
  id: TemplateId;
  name: string;
  blurb: string;
  prompt: string;
  questions: ClarifyQuestion[];
}

export interface Draft {
  prompt: string;
  templateId: TemplateId | null;
  answers: Record<string, string>;
  name: string;
  blocks: BlockInstance[];
  editingId: string | null;
}

export interface DryRunItem {
  date: string;
  text: string;
  needsOk?: boolean;
}
