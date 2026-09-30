import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export function KateAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky text-navy"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon name="kate" size={size * 0.57} strokeWidth={2.2} />
    </span>
  );
}

export function KateBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <KateAvatar />
      <div className="max-w-[300px] rounded-[4px_18px_18px_18px] bg-white px-3.5 py-3 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function KateTyping() {
  return (
    <div className="flex items-center gap-2" aria-live="polite" aria-label="Kate is building your service">
      <KateAvatar />
      <div className="flex gap-1.5 rounded-[4px_18px_18px_18px] bg-white px-4 py-4">
        <span className="h-2 w-2 animate-blink rounded-full bg-muted" />
        <span className="h-2 w-2 animate-blink rounded-full bg-muted [animation-delay:200ms]" />
        <span className="h-2 w-2 animate-blink rounded-full bg-muted [animation-delay:400ms]" />
      </div>
    </div>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[290px] self-end rounded-[18px_18px_4px_18px] bg-navy px-3.5 py-3 text-sm leading-relaxed text-white">
      {children}
    </div>
  );
}

export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-10 rounded-full border-2 px-3.5 text-sm font-bold transition-colors ${
        selected ? "border-navy bg-navy text-white" : "border-connector bg-white text-navy hover:border-navy"
      }`}
    >
      {label}
    </button>
  );
}
