"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServices } from "@/context/ServicesContext";
import { PhoneShell } from "@/layouts/PhoneShell";
import { Chip, KateBubble, KateTyping, UserBubble } from "@/components/kate/Chat";
import { Button } from "@/components/ui/Button";
import { documentsNote, TEMPLATES } from "@/services/kate";

export default function ClarifyPage() {
  const router = useRouter();
  const { draft, setAnswer, composeDraft } = useServices();
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    if (!draft.templateId) router.replace("/services/new");
  }, [draft.templateId, router]);

  useEffect(() => {
    if (!building) return;
    const t = setTimeout(() => {
      composeDraft();
      router.push("/services/new/build");
    }, 900);
    return () => clearTimeout(t);
  }, [building, composeDraft, router]);

  if (!draft.templateId) return null;
  const template = TEMPLATES[draft.templateId];
  const note = documentsNote(draft.templateId, draft.answers);

  return (
    <PhoneShell
      title="Kate"
      backHref="/services/new"
      footer={
        <Button onClick={() => setBuilding(true)} disabled={building}>
          {building ? "Building…" : "Show my service"}
        </Button>
      }
    >
      <UserBubble>{draft.prompt}</UserBubble>
      <KateBubble>Got it. {template.questions.length} quick questions so I pick the right blocks.</KateBubble>

      {template.questions.map((q) => (
        <fieldset key={q.id} className="flex flex-col gap-2 pl-9">
          <legend className="pb-2 text-sm font-bold">{q.question}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => (
              <Chip key={o} label={o} selected={draft.answers[q.id] === o} onClick={() => setAnswer(q.id, o)} />
            ))}
          </div>
        </fieldset>
      ))}

      {note && <KateBubble>{note} You can change this later.</KateBubble>}
      {building && <KateTyping />}
    </PhoneShell>
  );
}
