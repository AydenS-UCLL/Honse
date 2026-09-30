import type { ReactNode } from "react";

type Tone = "white" | "ice" | "warn";

const TONES: Record<Tone, string> = {
  white: "bg-white",
  ice: "bg-ice",
  warn: "bg-warnbg text-warnink",
};

export function Card({
  tone = "white",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return <section className={`flex flex-col gap-2 rounded-2xl p-4 ${TONES[tone]} ${className}`}>{children}</section>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-1 text-[15px] font-bold">{children}</h2>;
}
