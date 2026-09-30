"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { KateAvatar } from "@/components/kate/Chat";
import { BlockChain } from "@/components/blocks/BlockCard";
import { BlockLibrary } from "@/components/blocks/BlockLibrary";
import { BlockConfigForm } from "@/components/blocks/BlockConfigForm";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { hasTrigger } from "@/services/kate";

type Panel = { type: "library" } | { type: "config"; uid: string } | null;

export default function BuildPage() {
  const router = useRouter();
  const { draft, setDraftName, addBlock, updateBlock, removeBlock } = useServices();
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    if (!draft.templateId) router.replace("/services/new");
  }, [draft.templateId, router]);

  if (!draft.templateId) return null;

  const selected = panel?.type === "config" ? draft.blocks.find((b) => b.uid === panel.uid) : undefined;
  const triggerOk = hasTrigger(draft.blocks);

  return (
    <PhoneShell
      title={draft.editingId ? "Edit service" : "Your service"}
      backHref={draft.editingId ? `/services/${draft.editingId}` : "/services/new/clarify"}
      footer={
        <>
          {!triggerOk && <p className="text-center text-[13px] font-semibold text-warn">Add a trigger so the service knows when to start.</p>}
          <Button onClick={() => router.push("/services/new/dry-run")} disabled={!triggerOk}>
            Try it on my last 3 months
          </Button>
        </>
      }
      overlay={
        <>
          <Sheet open={panel?.type === "library"} onClose={() => setPanel(null)} title="Add a block">
            <BlockLibrary
              current={draft.blocks}
              onAdd={(id) => {
                addBlock(id);
                setPanel(null);
              }}
            />
          </Sheet>
          <Sheet open={!!selected} onClose={() => setPanel(null)} title="Edit block">
            {selected && (
              <BlockConfigForm
                block={selected}
                onChange={(patch) => updateBlock(selected.uid, patch)}
                onRemove={() => {
                  removeBlock(selected.uid);
                  setPanel(null);
                }}
              />
            )}
          </Sheet>
        </>
      }
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-muted">Service name</span>
        <input
          value={draft.name}
          onChange={(e) => setDraftName(e.target.value)}
          className="h-11 rounded-lg border border-line bg-white px-3 text-[17px] font-bold outline-none focus:border-navy"
        />
      </label>

      <div className="flex items-center gap-2 text-[13px] font-semibold text-body">
        <KateAvatar />
        Built from {draft.blocks.length} blocks. Tap one to change it.
      </div>

      <BlockChain blocks={draft.blocks} onSelect={(uid) => setPanel({ type: "config", uid })} />

      <Button variant="dashed" size="md" onClick={() => setPanel({ type: "library" })}>
        Add a block
      </Button>
    </PhoneShell>
  );
}
