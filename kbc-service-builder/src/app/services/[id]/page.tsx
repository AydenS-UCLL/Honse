"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { BlockChain } from "@/components/blocks/BlockCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Sheet } from "@/components/ui/Sheet";
import { Toggle } from "@/components/ui/Toggle";
import type { Service } from "@/types";

function downloadLog(service: Service) {
  const rows = [["date", "event", "detail", "status"], ...service.log.map((l) => [l.date, l.text, l.detail, l.status])];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${service.id}-activity-log.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { services, approvals, toggleService, editService, deleteService } = useServices();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);

  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <PhoneShell title="Service" backHref="/">
        <p className="rounded-2xl bg-white p-4 text-sm">This service doesn&apos;t exist anymore.</p>
        <LinkButton href="/" variant="secondary" size="md">Back to my services</LinkButton>
      </PhoneShell>
    );
  }

  const waiting = approvals.filter((a) => a.serviceId === service.id).length;
  const stats = [
    { n: service.runs, label: service.runs === 1 ? "time it ran" : "times it ran" },
    { n: service.tasksDone, label: "tasks done" },
    { n: waiting, label: "waiting for you" },
  ];

  return (
    <PhoneShell
      title="Service"
      backHref="/"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              editService(service.id);
              router.push("/services/new/build");
            }}
          >
            Edit blocks
          </Button>
          <Button variant="danger" size="md" onClick={() => setConfirmDelete(true)}>
            Delete service
          </Button>
        </>
      }
      overlay={
        <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this service?">
          <p className="text-sm leading-relaxed text-body">
            “{service.name}” stops right away. Your activity log stays available in Documents for 12 months.
          </p>
          <Button
            onClick={() => {
              deleteService(service.id);
              router.push("/");
            }}
          >
            Delete service
          </Button>
          <Button variant="secondary" size="md" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
        </Sheet>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">{service.name}</h2>
          <div className="text-[13px] text-muted">
            {service.status === "active" ? `Active since ${service.since}` : `Paused since ${service.since}`} · {service.blocks.length} blocks
          </div>
        </div>
        <Toggle
          checked={service.status === "active"}
          onChange={() => toggleService(service.id)}
          label={`${service.name} ${service.status === "active" ? "on" : "off"}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-3">
            <div className="text-[22px] font-extrabold">{s.n}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {waiting > 0 && (
        <LinkButton href={`/approvals/${approvals.find((a) => a.serviceId === service.id)!.id}`} size="md">
          Review what&apos;s waiting
        </LinkButton>
      )}

      <button
        type="button"
        onClick={() => setShowBlocks((v) => !v)}
        aria-expanded={showBlocks}
        className="flex h-11 items-center justify-between rounded-xl bg-white px-4 text-[15px] font-bold"
      >
        How it works
        <Icon name="chevron" size={18} className={`text-muted transition-transform ${showBlocks ? "rotate-90" : ""}`} />
      </button>
      {showBlocks && <BlockChain blocks={service.blocks} />}

      <div className="flex items-center justify-between">
        <SectionTitle>Activity log</SectionTitle>
        <button
          type="button"
          onClick={() => downloadLog(service)}
          className="flex h-11 items-center gap-1.5 px-2 text-sm font-bold text-navy"
        >
          <Icon name="download" size={18} />
          CSV
        </button>
      </div>
      <ol className="flex flex-col rounded-2xl bg-white px-4">
        {service.log.map((l, i) => (
          <li key={l.id} className={`flex gap-3 py-3 ${i < service.log.length - 1 ? "border-b border-hair" : ""}`}>
            <span className="w-12 shrink-0 text-xs font-bold text-muted">{l.date}</span>
            <span className="flex-1">
              <span className="block text-sm font-semibold leading-snug">{l.text}</span>
              <span className="flex items-center gap-2 pt-1 text-xs text-muted">
                {l.status === "waiting" && <Pill tone="orange">Waiting</Pill>}
                {l.status === "done" && <Pill tone="green">Done</Pill>}
                {l.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </PhoneShell>
  );
}
