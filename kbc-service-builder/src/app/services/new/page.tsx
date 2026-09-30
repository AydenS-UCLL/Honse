"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { TEMPLATE_LIST } from "@/services/kate";

export default function DescribePage() {
  const router = useRouter();
  const { draft, setPrompt, startDraft } = useServices();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setPrompt("Help me when I move, and warn me if something needs a document.");
      setListening(false);
    }, 1600);
    return () => clearTimeout(t);
  }, [listening, setPrompt]);

  const build = () => {
    startDraft(draft.prompt.trim());
    router.push("/services/new/clarify");
  };

  return (
    <PhoneShell
      title="New service"
      backHref="/"
      footer={
        <Button onClick={build} disabled={!draft.prompt.trim()}>
          Build it
        </Button>
      }
    >
      <h2 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight">What should your service do?</h2>
      <p className="text-sm leading-relaxed text-body">
        Say it in your own words. Kate picks the blocks, you stay in control.
      </p>

      <label className="flex flex-col gap-1.5 rounded-2xl border-2 border-navy bg-white p-3.5 focus-within:ring-2 focus-within:ring-sky">
        <span className="text-xs font-bold text-muted">Describe it</span>
        <textarea
          rows={3}
          value={listening ? "" : draft.prompt}
          placeholder={listening ? "Listening…" : "e.g. Help me when I move house"}
          onChange={(e) => setPrompt(e.target.value)}
          className="resize-none bg-transparent text-base leading-snug outline-none"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setListening(true)}
            aria-label={listening ? "Listening" : "Speak instead"}
            aria-pressed={listening}
            className={`flex h-11 w-11 items-center justify-center rounded-full ${listening ? "animate-pulse bg-navy text-white" : "bg-ice text-navy"}`}
          >
            <Icon name="mic" />
          </button>
        </div>
      </label>

      <SectionTitle>Or start from a template</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {TEMPLATE_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPrompt(t.prompt)}
            aria-pressed={draft.prompt === t.prompt}
            className={`flex min-h-[84px] flex-col gap-1 rounded-2xl border bg-white p-3 text-left transition-colors hover:border-navy ${
              draft.prompt === t.prompt ? "border-2 border-navy" : "border-line"
            }`}
          >
            <span className="text-sm font-bold">{t.name}</span>
            <span className="text-xs text-muted">{t.blurb}</span>
          </button>
        ))}
      </div>
    </PhoneShell>
  );
}
