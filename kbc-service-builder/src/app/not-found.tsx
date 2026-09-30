import { PhoneShell } from "@/layouts/PhoneShell";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Shown for any route the prototype doesn't cover, instead of a bare 404. */
export default function NotFound() {
  return (
    <PhoneShell
      title="End of the mockup"
      footer={<LinkButton href="/">Back to the start</LinkButton>}
    >
      <section className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-okbg text-ok">
          <Icon name="check" size={30} strokeWidth={2.6} />
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight">That&apos;s the end of the mockup</h2>
        <p className="text-sm leading-relaxed text-body">
          Thanks for trying the KBC Service Builder prototype. This screen isn&apos;t part of the demo yet.
        </p>
      </section>
    </PhoneShell>
  );
}
