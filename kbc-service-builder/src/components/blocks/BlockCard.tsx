import type { BlockInstance, BlockKind } from "@/types";
import { blockSubtitle, getBlock, isWarningSubtitle, KIND_TAG } from "@/services/blocks";
import { Icon } from "@/components/ui/Icon";

const TAG_STYLE: Record<BlockKind, string> = {
  trigger: "bg-navy text-white",
  condition: "bg-warnbg text-warn",
  action: "bg-ice text-navy",
  safeguard: "bg-hair text-ink",
};

export function KindTag({ kind }: { kind: BlockKind }) {
  return (
    <span
      className={`min-w-[44px] shrink-0 rounded-md px-[7px] py-[3px] text-center text-[11px] font-extrabold tracking-[0.6px] ${TAG_STYLE[kind]}`}
    >
      {KIND_TAG[kind]}
    </span>
  );
}

interface BlockCardProps {
  block: BlockInstance;
  onSelect?: () => void;
  selected?: boolean;
  size?: "sm" | "lg";
}

export function BlockCard({ block, onSelect, selected, size = "sm" }: BlockCardProps) {
  const def = getBlock(block.defId);
  const off = block.permission === "off";
  const content = (
    <>
      <KindTag kind={def.kind} />
      <span className="flex-1 text-left">
        <span className={`block font-bold ${size === "lg" ? "text-base" : "text-[15px]"} ${off ? "text-muted line-through" : ""}`}>
          {def.title}
        </span>
        <span className={`block text-xs font-semibold ${isWarningSubtitle(block) ? "text-warn" : "text-muted"}`}>
          {blockSubtitle(block)}
        </span>
      </span>
      {def.locked ? (
        <Icon name="lock" size={18} className="text-muted" />
      ) : onSelect ? (
        <Icon name="chevron" size={18} className="text-muted" />
      ) : null}
    </>
  );
  const base = `flex w-full items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 ${
    selected ? "ring-2 ring-sky" : "shadow-card"
  }`;
  if (!onSelect) return <div className={base}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`${base} transition-shadow hover:ring-2 hover:ring-sky/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky`}
    >
      {content}
    </button>
  );
}

interface BlockChainProps {
  blocks: BlockInstance[];
  onSelect?: (uid: string) => void;
  selectedUid?: string | null;
  size?: "sm" | "lg";
}

export function BlockChain({ blocks, onSelect, selectedUid, size = "sm" }: BlockChainProps) {
  return (
    <ol className="flex w-full flex-col" aria-label="Service blocks, in order">
      {blocks.map((b, i) => (
        <li key={b.uid} className="flex flex-col">
          {i > 0 && <span className={`w-0.5 bg-connector ${size === "lg" ? "ml-[36px] h-5" : "ml-8 h-2.5"}`} aria-hidden="true" />}
          <BlockCard
            block={b}
            size={size}
            selected={selectedUid === b.uid}
            onSelect={onSelect && !getBlock(b.defId).locked ? () => onSelect(b.uid) : undefined}
          />
        </li>
      ))}
    </ol>
  );
}
