"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { SignSheet } from "@/components/ui/SignSheet";

export default function ApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { approvals, services, resolveApproval } = useServices();
  const [signing, setSigning] = useState(false);

  const approval = approvals.find((a) => a.id === id);
  const service = services.find((s) => s.id === approval?.serviceId);

  const onSigned = useCallback(() => {
    if (!approval) return;
    resolveApproval(approval.id, "approve");
    router.push(`/services/${approval.serviceId}`);
  }, [approval, resolveApproval, router]);

  if (!approval) {
    return (
      <PhoneShell title="Needs your OK" backHref="/">
        <p className="rounded-2xl bg-white p-4 text-sm">Nothing is waiting for you right now.</p>
        <LinkButton href="/" variant="secondary" size="md">Back to my services</LinkButton>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell
      title="Needs your OK"
      backHref="/"
      footer={
        <>
          <Button onClick={() => setSigning(true)}>Approve and sign</Button>
          <LinkButton href="/" variant="secondary" size="md">Not now</LinkButton>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              resolveApproval(approval.id, "never");
              router.push("/");
            }}
          >
            Never ask me this again
          </Button>
        </>
      }
      overlay={<SignSheet open={signing} onClose={() => setSigning(false)} onSigned={onSigned} summary={approval.signSummary} />}
    >
      <div className="flex items-center gap-2">
        <Pill>{service?.name}</Pill>
        <span className="text-xs text-muted">Waiting since {approval.since}</span>
      </div>
      <h2 className="text-2xl font-extrabold leading-tight">{approval.title}</h2>

      <Card>
        <div className="text-xs font-bold text-muted">{approval.beforeLabel}</div>
        <div className="text-[15px] text-muted line-through">{approval.before}</div>
        <div className="pt-1.5 text-xs font-bold text-muted">{approval.afterLabel}</div>
        <div className="text-[15px] font-bold">{approval.after}</div>
        <div className="my-1.5 h-px bg-hair" />
        <div className="flex justify-between text-sm">
          <span className="text-muted">{approval.impactLabel}</span>
          <span className="font-bold">{approval.impact}</span>
        </div>
      </Card>

      <Card tone="ice">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="info" className="text-navy" />
          Why now?
        </div>
        <p className="text-sm leading-relaxed">{approval.reason}</p>
      </Card>
    </PhoneShell>
  );
}
