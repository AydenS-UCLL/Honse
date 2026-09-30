import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "dashed" | "danger";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navydeep disabled:bg-connector",
  secondary: "border-2 border-navy text-navy bg-transparent hover:bg-ice",
  dashed: "border-2 border-dashed border-muted text-navy bg-white hover:bg-ice",
  danger: "text-warn bg-transparent hover:bg-warnbg",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-6 text-base",
};

function classes(variant: Variant, size: Size, full: boolean, extra = "") {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
    "disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    full ? "w-full" : "",
    extra,
  ].join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function Button({ variant = "primary", size = "lg", full = true, className, ...rest }: ButtonProps) {
  return <button type="button" className={classes(variant, size, full, className)} {...rest} />;
}

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
}

export function LinkButton({ href, children, variant = "primary", size = "lg", full = true, className }: LinkButtonProps) {
  return (
    <Link href={href} className={classes(variant, size, full, className)}>
      {children}
    </Link>
  );
}
