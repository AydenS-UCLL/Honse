"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { KateAvatar } from "@/components/kate/Chat";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { TEMPLATES } from "@/services/kate";

export default function HubPage() {
  const router = useRouter();
  const { services, approvals, toggleService, startDraft } = useServices();
  const [showSuggestion, setShowSuggestion] = useState(true);

  const setUpSuggested = () => {
    startDraft(TEMPLATES.firstJob.prompt);
    router.push("/services/new/clarify");
  };

  return (
    <PhoneShell
      title="My services"
      right={
        <Link
          href="/studio"
          aria-label="Open desktop studio"
          className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-ice"
        >
          <Icon name="desktop" size={22} />
        </Link>
      }
      footer={<Button onClick={() => router.push("/services/new")}>Create a service</Button>}
    >
      {showSuggestion && (
        <section className="flex flex-col gap-2.5 rounded-2xl bg-ice p-4">
          <div className="flex items-center gap-2.5">
            <KateAvatar />
            <span className="text-xs font-bold text-navy">Suggested for you</span>
          </div>
          <p className="text-lg font-extrabold leading-snug">
            Your first salary from a new employer just arrived. Want help getting organised?
          </p>
          <div className="flex items-center gap-3">
            <Button full={false} size="md" onClick={setUpSuggested}>
              Set it up
            </Button>
            <button
              type="button"
              onClick={() => setShowSuggestion(false)}
              className="h-11 px-2 text-sm font-semibold text-navy underline-offset-2 hover:underline"
            >
              Not now
            </button>
          </div>
        </section>
      )}

      {approvals.map((a) => {
        const svc = services.find((s) => s.id === a.serviceId);
        return (
          <Link
            key={a.id}
            href={`/approvals/${a.id}`}
            className="flex items-center gap-3 rounded-2xl bg-warnbg px-4 py-3.5 text-warnink hover:ring-2 hover:ring-warnicon/40"
          >
            <Icon name="alert" size={22} className="shrink-0 text-warnicon" />
            <span className="flex-1">
              <span className="block text-[15px] font-bold">1 action waiting for your OK</span>
              <span className="block text-[13px]">
                {svc?.name} · {a.title.replace("?", "").toLowerCase()}
              </span>
            </span>
            <Icon name="chevron" size={18} />
          </Link>
        );
      })}

      <SectionTitle>Your services</SectionTitle>
      {services.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-muted">No services yet. Describe one below and Kate builds it.</p>
      ) : (
        <ul className="flex flex-col rounded-2xl bg-white px-4">
          {services.map((s, i) => {
            const waiting = approvals.filter((a) => a.serviceId === s.id).length;
            const status =
              s.status === "paused"
                ? `Paused since ${s.since}`
                : `Active · ran ${s.runs} ${s.runs === 1 ? "time" : "times"}${waiting ? ` · ${waiting} waiting` : ""}${s.nextRun ? ` · next check ${s.nextRun}` : ""}`;
            return (
              <li key={s.id} className={`flex min-h-[60px] items-center gap-3 ${i < services.length - 1 ? "border-b border-hair" : ""}`}>
                <Link href={`/services/${s.id}`} className="flex flex-1 items-center gap-2 py-3">
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">{s.name}</span>
                    <span className="block text-xs text-muted">{status}</span>
                  </span>
                  <Icon name="chevron" size={18} className="text-muted" />
                </Link>
                <Toggle
                  checked={s.status === "active"}
                  onChange={() => toggleService(s.id)}
                  label={`${s.name} ${s.status === "active" ? "on" : "off"}`}
                />
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center gap-2 text-[13px] text-muted">
        <Icon name="shield" size={18} className="shrink-0 text-navy" />
        Services suggest and ask. They never move money on their own.
      </p>
    </PhoneShell>
  );
}
