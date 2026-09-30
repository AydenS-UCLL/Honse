"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useServices, withBlock } from "@/context/ServicesContext";
import { BlockChain } from "@/components/blocks/BlockCard";
import { BlockConfigForm } from "@/components/blocks/BlockConfigForm";
import { KateAvatar } from "@/components/kate/Chat";
import { Icon } from "@/components/ui/Icon";
import { Pill, RiskPill } from "@/components/ui/Pill";
import { BLOCKS, getBlock, KIND_LABEL, KIND_ORDER } from "@/services/blocks";
import { dryRun, hasTrigger, permissionsSummary } from "@/services/kate";
import type { BlockInstance } from "@/types";

export default function StudioPage() {
  const { services, updateServiceBlocks } = useServices();
  const [serviceId, setServiceId] = useState<string>(services.find((s) => s.id === "voucher-saver")?.id ?? services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId);

  const [blocks, setBlocks] = useState<BlockInstance[]>(service?.blocks ?? []);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showDryRun, setShowDryRun] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(service?.blocks ?? []);
    setSelectedUid(service?.blocks.find((b) => b.defId === "a_notify")?.uid ?? null);
    setShowDryRun(false);
    setSavedAt(null);
    // reset only when switching service
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const dirty = JSON.stringify(blocks) !== JSON.stringify(service?.blocks ?? []);
  const selected = blocks.find((b) => b.uid === selectedUid);
  const items = useMemo(() => dryRun(blocks), [blocks]);
  const perms = useMemo(() => permissionsSummary(blocks), [blocks]);

  const library = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCKS.filter((b) => !q || b.title.toLowerCase().includes(q));
  }, [query]);

  const add = (defId: string) => {
    const next = withBlock(blocks, defId);
    const added = next.find((b) => !blocks.some((o) => o.uid === b.uid));
    setBlocks(next);
    if (added) setSelectedUid(added.uid);
  };

  const inUse = new Set(blocks.map((b) => b.defId));

  const save = () => {
    if (!service) return;
    updateServiceBlocks(service.id, blocks);
    setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-6 py-3">
        <Link href="/" className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-navy hover:bg-ice">
          <Icon name="back" size={18} />
          My services
        </Link>
        <label className="flex items-center gap-2">
          <span className="sr-only">Service</span>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-11 rounded-lg border border-line bg-white px-3 text-lg font-extrabold"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {service && <Pill tone={service.status === "active" ? "green" : "grey"}>{service.status === "active" ? "Active" : "Paused"}</Pill>}
        {dirty && <Pill tone="orange">Unsaved changes</Pill>}
        {!dirty && savedAt && <span className="text-sm text-muted">Saved at {savedAt}</span>}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowDryRun((v) => !v)}
          aria-pressed={showDryRun}
          className="h-11 rounded-full border-2 border-navy px-5 text-[15px] font-bold text-navy hover:bg-ice"
        >
          {showDryRun ? "Hide dry run" : "Dry run"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || !hasTrigger(blocks)}
          className="h-11 rounded-full bg-navy px-5 text-[15px] font-bold text-white hover:bg-navydeep disabled:bg-connector"
        >
          Save changes
        </button>
      </header>

      <div className="flex flex-1 flex-wrap">
        {/* Library */}
        <aside className="flex max-w-full flex-[1_0_280px] flex-col gap-2 border-r border-line bg-white p-5">
          <h2 className="text-base font-extrabold">Blocks</h2>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-line px-2.5">
            <Icon name="search" size={16} className="text-muted" />
            <span className="sr-only">Search blocks</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="flex-1 text-sm outline-none" />
          </label>
          {KIND_ORDER.map((kind) => {
            const group = library.filter((b) => b.kind === kind);
            if (!group.length) return null;
            return (
              <div key={kind} className="flex flex-col gap-1.5 pt-2">
                <h3 className="text-xs font-bold text-muted">{KIND_LABEL[kind]}</h3>
                {group.map((b) => {
                  const added = inUse.has(b.id) && b.kind !== "trigger";
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={b.unavailable || added}
                      onClick={() => add(b.id)}
                      title={b.description}
                      className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2 text-left text-sm font-semibold hover:border-navy disabled:cursor-not-allowed disabled:bg-ground disabled:text-muted"
                    >
                      <span>{b.title}</span>
                      {b.unavailable ? <Icon name="lock" size={16} /> : added ? <Icon name="check" size={16} /> : <RiskPill risk={b.risk} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* Flow */}
        <section
          className="flex min-w-0 flex-[999_1_440px] flex-col items-center gap-5 px-6 py-8"
          style={{ backgroundImage: "radial-gradient(#C9D4DF 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        >
          {service && (
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-body">
              <KateAvatar />
              Built from “{service.prompt}”
            </div>
          )}
          <div className="w-full max-w-[440px]">
            <BlockChain blocks={blocks} size="lg" selectedUid={selectedUid} onSelect={setSelectedUid} />
          </div>
          {!hasTrigger(blocks) && <p className="text-sm font-semibold text-warn">Add a trigger from the left so the service knows when to start.</p>}

          {showDryRun && (
            <div className="flex w-full max-w-[440px] flex-col gap-3 rounded-2xl bg-white p-5 shadow-card">
              <h2 className="text-base font-extrabold">Dry run on the last 3 months</h2>
              <ol className="flex flex-col">
                {items.length === 0 && <li className="text-sm text-muted">Nothing would have happened.</li>}
                {items.map((it, i) => (
                  <li key={i} className={`flex gap-3 py-2.5 ${i < items.length - 1 ? "border-b border-hair" : ""}`}>
                    <span className="w-12 shrink-0 text-[13px] font-bold text-muted">{it.date}</span>
                    <span className="text-sm">
                      {it.text} {it.needsOk && <b className="text-warn">Needs your OK</b>}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="rounded-xl bg-ice p-3 text-[13px] leading-relaxed">
                <b>Can:</b> {perms.can.join(", ")}. <b>Can&apos;t:</b> {perms.cannot.join(", ")}.
              </p>
            </div>
          )}
        </section>

        {/* Inspector */}
        <aside className="flex max-w-full flex-[1_0_340px] flex-col gap-4 border-l border-line bg-white p-5">
          <h2 className="text-xs font-bold text-muted">Selected block</h2>
          {selected ? (
            <>
              <BlockConfigForm
                block={selected}
                onChange={(patch) => setBlocks((bs) => bs.map((b) => (b.uid === selected.uid ? { ...b, ...patch } : b)))}
                onRemove={() => {
                  setBlocks((bs) => bs.filter((b) => b.uid !== selected.uid));
                  setSelectedUid(null);
                }}
              />
              {getBlock(selected.defId).id === "a_notify" && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-sm font-bold">Preview</div>
                  <div className="flex gap-2.5 rounded-2xl bg-ground p-3">
                    <KateAvatar />
                    <div>
                      <div className="text-[13px] font-bold">
                        {service?.templateId === "vouchers" ? "€ 38.50 in vouchers expires on 31 Oct" : `${service?.name}: something needs your attention`}
                      </div>
                      <div className="pt-0.5 text-[13px] leading-snug text-body">
                        {service?.templateId === "vouchers"
                          ? "Your Tuesday shop at [SUPERMARKET] would use most of it."
                          : "Open the app to see what changed and what you can do."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Click a block in the flow to change what it does and what it may use.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
