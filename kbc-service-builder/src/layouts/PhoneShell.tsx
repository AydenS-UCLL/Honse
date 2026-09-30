import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface PhoneShellProps {
  title: string;
  backHref?: string;
  right?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
}

/** Fills the browser window at every size; content sits in a readable centred column. */
export function PhoneShell({ title, backHref, right, footer, overlay, children }: PhoneShellProps) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-ground text-ink">
      <header className="shrink-0 border-b border-line bg-white">
        <div className="mx-auto flex min-h-[60px] w-full max-w-2xl items-center gap-1 px-3 py-2">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-ice"
            >
              <Icon name="back" size={22} strokeWidth={2.2} />
            </Link>
          ) : (
            <span className="w-2" />
          )}
          <h1 className="flex-1 text-base font-bold md:text-lg">{title}</h1>
          {right}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 p-4 md:py-8">{children}</div>
      </main>
      {footer && (
        <div className="shrink-0 border-t border-line bg-ground">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pb-5 pt-3">{footer}</div>
        </div>
      )}
      {overlay}
    </div>
  );
}
