import type { ReactElement, SVGProps } from "react";

export type IconName =
  | "back" | "chevron" | "lock" | "shield" | "kate" | "mic" | "search" | "plus" | "clock"
  | "alert" | "check" | "desktop" | "trash" | "download" | "close" | "info" | "phone";

const PATHS: Record<IconName, ReactElement> = {
  back: <path d="M15 6l-6 6 6 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  kate: <path d="M4 5h16v11H9l-5 4z" />,
  mic: (<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>),
  check: <path d="M5 12l5 5 9-10" />,
  desktop: (<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>),
  trash: (<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>),
  download: (<><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></>),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>),
  phone: (<><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
