import type { PropsWithChildren } from "react";
import { Icon } from "./Icon";

const nav = [
  ["Project", "project"],
  ["Backer report", "backers"],
  ["Messages", "message"],
  ["Surveys", "survey"],
  ["Rewards", "project"],
  ["Shipping", "shipping"],
  ["Settings", "settings"],
] as const;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Creator tools">
        <a className="wordmark" href="#top" aria-label="Kickstarter home">
          KICKSTARTER
        </a>
        <nav className="side-nav">
          {nav.map(([label, icon]) => (
            <button className={label === "Backer report" ? "active" : ""} key={label} type="button">
              <Icon name={icon} size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="view-project" type="button">
          View project <Icon name="arrow" size={15} />
        </button>
      </aside>
      <main className="workspace" id="top">{children}</main>
    </div>
  );
}
