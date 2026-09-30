import type { ReactNode } from "react";
import type { Risk } from "@/types";
import { RISK_LABEL } from "@/services/blocks";

type Tone = "blue" | "orange" | "grey" | "green";

const TONES: Record<Tone, string> = {
  blue: "bg-ice text-navy",
  orange: "bg-warnbg text-warn",
  grey: "bg-hair text-body",
  green: "bg-okbg text-ok",
};

export function Pill({ tone = "blue", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-md px-[7px] py-[3px] text-[11px] font-bold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

const RISK_TONE: Record<Risk, Tone> = {
  read: "blue",
  change: "orange",
  partner: "grey",
  logic: "grey",
  safeguard: "green",
};

export function RiskPill({ risk }: { risk: Risk }) {
  return <Pill tone={RISK_TONE[risk]}>{RISK_LABEL[risk]}</Pill>;
}
