import type { ReactNode } from "react";

interface IconProps {
  name:
    | "project"
    | "backers"
    | "message"
    | "survey"
    | "shipping"
    | "settings"
    | "search"
    | "chevron"
    | "close"
    | "more"
    | "check"
    | "arrow";
  size?: number;
}

const paths: Record<IconProps["name"], ReactNode> = {
  project: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="M9 12h6M12 9v6"/></>,
  backers: <><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-4 2-6 5.5-6s5 2 5.5 6"/><path d="M15 6.5a3 3 0 0 1 0 5.5M16 14c2.5.5 3.7 2 4 5"/></>,
  message: <path d="M4 5h16v11H9l-5 4z"/>,
  survey: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  shipping: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></>,
  chevron: <path d="m8 10 4 4 4-4"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  more: <><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
};

export function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        {paths[name]}
      </g>
    </svg>
  );
}
