"use client";

import { useMemo, useState } from "react";
import type { BlockInstance, BlockKind } from "@/types";
import { BLOCKS, KIND_LABEL, KIND_ORDER } from "@/services/blocks";
import { Icon } from "@/components/ui/Icon";
import { RiskPill } from "@/components/ui/Pill";

interface BlockLibraryProps {
  current: BlockInstance[];
  onAdd: (defId: string) => void;
  compact?: boolean;
}

type Tab = "all" | BlockKind;

export function BlockLibrary({ current, onAdd, compact = false }: BlockLibraryProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCKS.filter((b) => (tab === "all" || b.kind === tab) && (!q || b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)));
  }, [tab, query]);

  const inUse = new Set(current.map((c) => c.defId));
  const tabs: Tab[] = ["all", ...KIND_ORDER];

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5">
        <Icon name="search" size={18} className="text-muted" />
        <span className="sr-only">Search blocks</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks"
          className="flex-1 bg-transparent text-[15px] outline-none"
        />
      </label>

      {!compact && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Block type">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`h-9 shrink-0 rounded-full px-3 text-[13px] font-bold ${tab === t ? "bg-navy text-white" : "bg-hair text-ink"}`}
            >
              {t === "all" ? "All" : KIND_LABEL[t]}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">Adding a new trigger replaces the current one. Locked blocks can&apos;t be used in services.</p>

      <ul className="flex flex-col rounded-2xl bg-white px-4">
        {list.map((b, i) => {
          const added = inUse.has(b.id) && b.kind !== "trigger";
          return (
            <li
              key={b.id}
              className={`flex min-h-[60px] items-center gap-2.5 py-2 ${i < list.length - 1 ? "border-b border-hair" : ""}`}
            >
              <div className="flex-1">
                <div className={`text-[15px] font-semibold ${b.unavailable ? "text-muted" : ""}`}>{b.title}</div>
                <div className="text-xs text-muted">{b.unavailable ? b.subtitle : b.description}</div>
              </div>
              {b.unavailable ? (
                <Icon name="lock" size={18} className="text-muted" />
              ) : (
                <>
                  <RiskPill risk={b.risk} />
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => onAdd(b.id)}
                    aria-label={added ? `${b.title} already added` : `Add ${b.title}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-navy bg-white text-navy hover:bg-ice disabled:border-hair disabled:bg-hair disabled:text-muted"
                  >
                    <Icon name={added ? "check" : "plus"} size={18} strokeWidth={2.4} />
                  </button>
                </>
              )}
            </li>
          );
        })}
        {list.length === 0 && <li className="py-6 text-center text-sm text-muted">No blocks match “{query}”.</li>}
      </ul>
    </div>
  );
}
