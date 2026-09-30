"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Bottom sheet that rises from the bottom of the screen, matching the content column width. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fadeIn bg-ink/40"
      />
      <div className="relative mx-auto flex max-h-[88%] w-full max-w-2xl animate-slideUp flex-col rounded-t-3xl bg-ground">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-ice"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
