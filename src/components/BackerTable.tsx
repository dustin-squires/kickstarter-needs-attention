import { actionLabels } from "../domain/attention";
import type { AttentionItem, RecommendedAction } from "../domain/types";
import { Icon } from "./Icon";
import { PriorityBadge } from "./PriorityBadge";

interface BackerTableProps {
  items: AttentionItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (item: AttentionItem, action: RecommendedAction) => void;
  onClearFilters: () => void;
}

const flags: Record<string, string> = {
  US: "🇺🇸", KR: "🇰🇷", FR: "🇫🇷", IT: "🇮🇹", CA: "🇨🇦", GB: "🇬🇧",
  ES: "🇪🇸", JP: "🇯🇵", MA: "🇲🇦", DE: "🇩🇪", NG: "🇳🇬",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function BackerTable({ items, selectedId, onSelect, onAction, onClearFilters }: BackerTableProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-check"><Icon name="check" size={22} /></span>
        <h3>No backers match these filters</h3>
        <p>Try another priority or clear your search.</p>
        <button className="secondary-button" onClick={onClearFilters} type="button">Clear filters</button>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="backer-table">
        <thead>
          <tr>
            <th>Backer</th>
            <th>Priority</th>
            <th>Issue</th>
            <th>Reward</th>
            <th>Location</th>
            <th>Last activity</th>
            <th><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const { backer, primaryReason } = item;
            const isSelected = backer.id === selectedId;
            return (
              <tr
                aria-selected={isSelected}
                className={isSelected ? "selected" : ""}
                key={backer.id}
                onClick={() => onSelect(backer.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(backer.id);
                  }
                }}
                tabIndex={0}
              >
                <td>
                  <div className="backer-cell">
                    <span className="avatar" style={{ background: backer.avatarColor }}>{backer.initials}</span>
                    <span><strong>{backer.name}</strong><small>{backer.email}</small></span>
                  </div>
                </td>
                <td><PriorityBadge priority={primaryReason.priority} /></td>
                <td>
                  <div className="issue-cell">
                    <strong>{primaryReason.title}</strong>
                    <small>{primaryReason.queueContext}</small>
                    {item.reasons.length > 1 && <em>{item.reasons.length} issues</em>}
                  </div>
                </td>
                <td><span className="cell-main">{backer.reward}</span><small>{money.format(backer.pledgeAmountCents / 100)}</small></td>
                <td><span className="location"><span>{flags[backer.countryCode]}</span>{backer.location}</span></td>
                <td>{backer.lastActivityDaysAgo === null ? "—" : backer.lastActivityDaysAgo === 0 ? "Today" : `${backer.lastActivityDaysAgo}d ago`}</td>
                <td>
                  {primaryReason.recommendedActions[0] !== "NO_ACTION" ? (
                    <button
                      className="row-action"
                      onClick={(event) => { event.stopPropagation(); onAction(item, primaryReason.recommendedActions[0]); }}
                      type="button"
                    >
                      {actionLabels[primaryReason.recommendedActions[0]]}
                    </button>
                  ) : <span className="no-action">No action</span>}
                  <button className="more-button" onClick={(event) => event.stopPropagation()} type="button" aria-label={`More options for ${backer.name}`}>
                    <Icon name="more" size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
