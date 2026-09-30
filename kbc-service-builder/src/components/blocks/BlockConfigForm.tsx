"use client";

import type { BlockInstance } from "@/types";
import { DATA_LABEL, getBlock, PERMISSION_HINT, PERMISSION_LABEL } from "@/services/blocks";
import { Icon } from "@/components/ui/Icon";
import { RiskPill } from "@/components/ui/Pill";
import { KindTag } from "@/components/blocks/BlockCard";

interface BlockConfigFormProps {
  block: BlockInstance;
  onChange: (patch: Partial<BlockInstance>) => void;
  onRemove?: () => void;
}

export function BlockConfigForm({ block, onChange, onRemove }: BlockConfigFormProps) {
  const def = getBlock(block.defId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <KindTag kind={def.kind} />
        <RiskPill risk={def.risk} />
      </div>
      <div>
        <div className="text-xl font-extrabold">{def.title}</div>
        <p className="pt-1 text-sm leading-relaxed text-body">{def.description}</p>
      </div>

      {def.options && (
        <fieldset className="rounded-2xl bg-white px-4 py-3">
          <legend className="sr-only">{def.optionsLabel}</legend>
          <div className="pb-1 text-sm font-bold" aria-hidden="true">{def.optionsLabel}</div>
          {def.options.map((o) => (
            <label key={o.id} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={!!block.options[o.id]}
                onChange={(e) => onChange({ options: { ...block.options, [o.id]: e.target.checked } })}
                className="h-[22px] w-[22px] accent-navy"
              />
              <span className="text-[15px]">{o.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {def.permissions && (
        <fieldset className="rounded-2xl bg-white px-4 py-3">
          <legend className="sr-only">Permission</legend>
          <div className="pb-1 text-sm font-bold" aria-hidden="true">Permission</div>
          {def.permissions.map((p, i) => {
            const blocked = def.blockedPermissions?.includes(p);
            return (
              <label
                key={p}
                className={`flex items-start gap-3 py-2.5 ${i < def.permissions!.length - 1 ? "border-b border-hair" : ""} ${blocked ? "opacity-55" : "cursor-pointer"}`}
              >
                <input
                  type="radio"
                  name={`perm-${block.uid}`}
                  checked={block.permission === p}
                  disabled={blocked}
                  onChange={() => onChange({ permission: p })}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
                />
                <span>
                  <span className="block text-[15px] font-bold">{PERMISSION_LABEL[p]}</span>
                  <span className="block pt-0.5 text-xs text-muted">{blocked ? def.blockedReason : PERMISSION_HINT[p]}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-ice p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="shield" size={18} className="text-navy" />
          Data this block uses
        </div>
        {def.dataUsed.length ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {def.dataUsed.map((d) => (
                <code key={d} className="rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-semibold">
                  {d}
                </code>
              ))}
            </div>
            <p className="text-[13px] text-body">It can {def.dataUsed.map((d) => DATA_LABEL[d] ?? d).join(", ")}.</p>
          </>
        ) : (
          <p className="text-[13px] text-body">No personal data. It only works with what earlier blocks pass on.</p>
        )}
      </div>

      {onRemove && !def.locked && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-11 items-center justify-center gap-2 rounded-full text-[15px] font-bold text-warn hover:bg-warnbg"
        >
          <Icon name="trash" size={18} />
          Remove block
        </button>
      )}
    </div>
  );
}
