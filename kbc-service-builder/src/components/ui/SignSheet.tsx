"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface SignSheetProps {
  open: boolean;
  onClose: () => void;
  onSigned: () => void;
  summary: string;
}

type Step = "review" | "waiting" | "done";

/** Simulated strong customer authentication (e.g. itsme / KBC signing). */
export function SignSheet({ open, onClose, onSigned, summary }: SignSheetProps) {
  const [step, setStep] = useState<Step>("review");

  useEffect(() => {
    if (open) setStep("review");
  }, [open]);

  useEffect(() => {
    if (step === "waiting") {
      const t = setTimeout(() => setStep("done"), 1400);
      return () => clearTimeout(t);
    }
    if (step === "done") {
      const t = setTimeout(onSigned, 700);
      return () => clearTimeout(t);
    }
  }, [step, onSigned]);

  return (
    <Sheet open={open} onClose={step === "review" ? onClose : () => undefined} title="Confirm and sign">
      <div className="rounded-2xl bg-white p-4 text-[15px] leading-relaxed">
        <div className="text-xs font-bold text-muted">You are signing</div>
        <div className="pt-1 font-semibold">{summary}</div>
      </div>

      {step === "review" && (
        <>
          <div className="flex items-start gap-2 rounded-2xl bg-ice p-4 text-sm leading-relaxed">
            <Icon name="shield" className="mt-0.5 shrink-0 text-navy" />
            <span>KBC will never call you to ask you to sign this. If someone is on the phone telling you to, stop here.</span>
          </div>
          <Button onClick={() => setStep("waiting")}>Confirm with itsme</Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </>
      )}

      {step === "waiting" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center" aria-live="polite">
          <Icon name="phone" size={32} className="text-navy" />
          <div className="font-bold">Open itsme on your phone</div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 animate-blink rounded-full bg-navy" />
            <span className="h-2 w-2 animate-blink rounded-full bg-navy [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-blink rounded-full bg-navy [animation-delay:400ms]" />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-okbg p-6 text-center text-ok" aria-live="polite">
          <Icon name="check" size={32} strokeWidth={2.6} />
          <div className="font-bold">Signed</div>
        </div>
      )}
    </Sheet>
  );
}
