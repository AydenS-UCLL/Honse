"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Approval, BlockInstance, Draft, LogEntry, Service } from "@/types";
import { INITIAL_APPROVALS, INITIAL_SERVICES } from "@/services/mockData";
import { composeBlocks, defaultAnswers, detectTemplate, TEMPLATES } from "@/services/kate";
import { getBlock, newInstance, sortBlocks } from "@/services/blocks";

const EMPTY_DRAFT: Draft = {
  prompt: "",
  templateId: null,
  answers: {},
  name: "",
  blocks: [],
  editingId: null,
};

interface ServicesContextValue {
  services: Service[];
  approvals: Approval[];
  draft: Draft;
  setPrompt: (prompt: string) => void;
  startDraft: (prompt: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  composeDraft: () => void;
  setDraftName: (name: string) => void;
  addBlock: (defId: string) => void;
  updateBlock: (uid: string, patch: Partial<BlockInstance>) => void;
  removeBlock: (uid: string) => void;
  activateDraft: () => string;
  editService: (id: string) => void;
  toggleService: (id: string) => void;
  deleteService: (id: string) => void;
  updateServiceBlocks: (id: string, blocks: BlockInstance[]) => void;
  resolveApproval: (id: string, outcome: "approve" | "never") => void;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

function today(): string {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Adds a block, keeping WHEN → IF → THEN → GUARD order. A new trigger replaces the old one. */
function withBlock(blocks: BlockInstance[], defId: string): BlockInstance[] {
  const def = getBlock(defId);
  const base = def.kind === "trigger" ? blocks.filter((b) => getBlock(b.defId).kind !== "trigger") : blocks;
  return sortBlocks([...base, newInstance(defId)]);
}

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const setPrompt = useCallback((prompt: string) => setDraft((d) => ({ ...d, prompt })), []);

  const startDraft = useCallback((prompt: string) => {
    const templateId = detectTemplate(prompt);
    setDraft({
      prompt,
      templateId,
      answers: defaultAnswers(templateId),
      name: TEMPLATES[templateId].name,
      blocks: [],
      editingId: null,
    });
  }, []);

  const setAnswer = useCallback(
    (questionId: string, answer: string) =>
      setDraft((d) => ({ ...d, answers: { ...d.answers, [questionId]: answer } })),
    [],
  );

  const composeDraft = useCallback(
    () =>
      setDraft((d) => (d.templateId ? { ...d, blocks: composeBlocks(d.templateId, d.answers) } : d)),
    [],
  );

  const setDraftName = useCallback((name: string) => setDraft((d) => ({ ...d, name })), []);

  const addBlock = useCallback(
    (defId: string) => setDraft((d) => ({ ...d, blocks: withBlock(d.blocks, defId) })),
    [],
  );

  const updateBlock = useCallback(
    (uid: string, patch: Partial<BlockInstance>) =>
      setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (b.uid === uid ? { ...b, ...patch } : b)) })),
    [],
  );

  const removeBlock = useCallback(
    (uid: string) =>
      setDraft((d) => ({
        ...d,
        blocks: d.blocks.filter((b) => b.uid !== uid || getBlock(b.defId).locked),
      })),
    [],
  );

  const activateDraft = useCallback((): string => {
    const d = draft;
    const name = d.name.trim() || "My service";
    const entry: LogEntry = {
      id: `log-${Date.now()}`,
      date: today(),
      text: d.editingId ? "Blocks changed" : "Service turned on",
      detail: `You signed at ${nowTime()}`,
      status: "info",
    };
    if (d.editingId) {
      const id = d.editingId;
      setServices((list) =>
        list.map((s) =>
          s.id === id ? { ...s, name, blocks: d.blocks, status: "active", log: [entry, ...s.log] } : s,
        ),
      );
      setDraft(EMPTY_DRAFT);
      return id;
    }
    const id = slugify(name);
    const service: Service = {
      id,
      name,
      prompt: d.prompt,
      templateId: d.templateId ?? "moving",
      status: "active",
      blocks: d.blocks,
      runs: 0,
      tasksDone: 0,
      since: today(),
      log: [entry],
    };
    setServices((list) => [service, ...list]);
    setDraft(EMPTY_DRAFT);
    return id;
  }, [draft]);

  const editService = useCallback(
    (id: string) => {
      const s = services.find((x) => x.id === id);
      if (!s) return;
      setDraft({
        prompt: s.prompt,
        templateId: s.templateId,
        answers: defaultAnswers(s.templateId),
        name: s.name,
        blocks: s.blocks.map((b) => ({ ...b, options: { ...b.options } })),
        editingId: s.id,
      });
    },
    [services],
  );

  const toggleService = useCallback(
    (id: string) =>
      setServices((list) =>
        list.map((s) =>
          s.id === id
            ? {
                ...s,
                status: s.status === "active" ? "paused" : "active",
                since: s.status === "active" ? today() : s.since,
                log: [
                  {
                    id: `log-${Date.now()}`,
                    date: today(),
                    text: s.status === "active" ? "Service paused" : "Service resumed",
                    detail: "By you",
                    status: "info",
                  },
                  ...s.log,
                ],
              }
            : s,
        ),
      ),
    [],
  );

  const deleteService = useCallback((id: string) => {
    setServices((list) => list.filter((s) => s.id !== id));
    setApprovals((list) => list.filter((a) => a.serviceId !== id));
  }, []);

  const updateServiceBlocks = useCallback(
    (id: string, blocks: BlockInstance[]) =>
      setServices((list) =>
        list.map((s) =>
          s.id === id
            ? {
                ...s,
                blocks,
                log: [
                  { id: `log-${Date.now()}`, date: today(), text: "Blocks changed in the studio", detail: `Saved at ${nowTime()}`, status: "info" },
                  ...s.log,
                ],
              }
            : s,
        ),
      ),
    [],
  );

  const resolveApproval = useCallback(
    (id: string, outcome: "approve" | "never") => {
      const approval = approvals.find((a) => a.id === id);
      if (!approval) return;
      const entry: LogEntry = {
        id: `log-${Date.now()}`,
        date: today(),
        text: outcome === "approve" ? "Car insurance address updated" : "You chose: never ask for this again",
        detail: outcome === "approve" ? `You approved and signed at ${nowTime()}` : "This step is now off",
        status: outcome === "approve" ? "done" : "info",
      };
      setServices((svc) =>
        svc.map((s) =>
          s.id === approval.serviceId
            ? {
                ...s,
                tasksDone: outcome === "approve" ? s.tasksDone + 1 : s.tasksDone,
                log: [
                  entry,
                  ...s.log.map((l) =>
                    l.status === "waiting"
                      ? { ...l, status: "info" as const, detail: l.detail.replace("Waiting · ", "") }
                      : l,
                  ),
                ],
              }
            : s,
        ),
      );
      setApprovals((list) => list.filter((a) => a.id !== id));
    },
    [approvals],
  );

  const value = useMemo<ServicesContextValue>(
    () => ({
      services,
      approvals,
      draft,
      setPrompt,
      startDraft,
      setAnswer,
      composeDraft,
      setDraftName,
      addBlock,
      updateBlock,
      removeBlock,
      activateDraft,
      editService,
      toggleService,
      deleteService,
      updateServiceBlocks,
      resolveApproval,
    }),
    [services, approvals, draft, setPrompt, startDraft, setAnswer, composeDraft, setDraftName, addBlock, updateBlock, removeBlock, activateDraft, editService, toggleService, deleteService, updateServiceBlocks, resolveApproval],
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): ServicesContextValue {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used inside ServicesProvider");
  return ctx;
}

export { withBlock };
