"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SignSheet } from "@/components/ui/SignSheet";
import { dryRun, permissionsSummary } from "@/services/kate";

export default function DryRunPage() {
  const router = useRouter();
  const { draft, activateDraft } = useServices();
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!draft.templateId && !signing) router.replace("/services/new");
  }, [draft.templateId, signing, router]);

  const onSigned = useCallback(() => {
    const id = activateDraft();
    router.push(`/services/${id}`);
  }, [activateDraft, router]);

  if (!draft.templateId && !signing) return null;

  const items = dryRun(draft.blocks);
  const perms = permissionsSummary(draft.blocks);

  return (
    <PhoneShell
      title="Dry run"
      backHref="/services/new/build"
      footer={
        <>
          <Button onClick={() => setSigning(true)}>{draft.editingId ? "Sign to save changes" : "Sign to turn on"}</Button>
          <LinkButton href="/services/new/build" variant="secondary" size="md">
            Edit blocks
          </LinkButton>
        </>
      }
      overlay={
        <SignSheet
          open={signing}
          onClose={() => setSigning(false)}
          onSigned={onSigned}
          summary={`${draft.editingId ? "Save changes to" : "Turn on"} “${draft.name || "My service"}” with ${draft.blocks.length} blocks.`}
        />
      }
    >
      <div>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Here&apos;s what it would have done</h2>
        <p className="pt-1.5 text-sm leading-relaxed text-body">Tested on your last 3 months. Nothing was changed.</p>
      </div>

      <ol className="flex flex-col rounded-2xl bg-white px-4">
        {items.length === 0 && <li className="py-4 text-sm text-muted">Nothing would have happened. Try adding an action.</li>}
        {items.map((it, i) => (
          <li key={i} className={`flex gap-3 py-3 ${i < items.length - 1 ? "border-b border-hair" : ""}`}>
            <span className="w-12 shrink-0 text-[13px] font-bold text-muted">{it.date}</span>
            <span className="text-sm leading-snug">
              {it.text} {it.needsOk && <b className="text-warn">Needs your OK</b>}
            </span>
          </li>
        ))}
      </ol>

      <Card tone="ice">
        <div className="flex items-center gap-2 text-[15px] font-bold">
          <Icon name="shield" className="text-navy" />
          Permissions for this service
        </div>
        <p className="text-sm leading-relaxed">
          <b>Can:</b> {perms.can.join(", ")}.
        </p>
        <p className="text-sm leading-relaxed">
          <b>Can&apos;t:</b> {perms.cannot.join(", ")}.
        </p>
      </Card>
    </PhoneShell>
  );
}
