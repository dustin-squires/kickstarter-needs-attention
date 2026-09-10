import { actionLabels } from "../domain/attention";
import type { AttentionItem, RecommendedAction } from "../domain/types";
import { Icon } from "./Icon";
import { PriorityBadge } from "./PriorityBadge";

interface BackerDetailDrawerProps {
  item: AttentionItem | null;
  onClose: () => void;
  onAction: (item: AttentionItem, action: RecommendedAction) => void;
  onSnooze: (item: AttentionItem) => void;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const statusLabel = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

export function BackerDetailDrawer({ item, onClose, onAction, onSnooze }: BackerDetailDrawerProps) {
  if (!item) return null;
  const { backer, primaryReason } = item;

  return (
    <aside className="detail-drawer" aria-label={`Attention details for ${backer.name}`}>
      <header className="drawer-header">
        <div className="drawer-person">
          <span className="avatar avatar-large" style={{ background: backer.avatarColor }}>{backer.initials}</span>
          <div><h2>{backer.name}</h2><a href={`mailto:${backer.email}`}>{backer.email}</a></div>
        </div>
        <button className="close-button" onClick={onClose} type="button" aria-label="Close details"><Icon name="close" /></button>
      </header>

      <div className="drawer-body">
        <PriorityBadge priority={primaryReason.priority} />
        <section className="drawer-section reason-overview">
          <span className={`reason-mark priority-${primaryReason.priority}`}>!</span>
          <div>
            <p className="eyebrow">Why this needs attention</p>
            <h3>{primaryReason.title}</h3>
            <p>{primaryReason.explanation}</p>
          </div>
        </section>

        {item.reasons.length > 1 && (
          <section className="drawer-section additional-reasons">
            <p className="eyebrow">Also affecting this pledge</p>
            {item.reasons.slice(1).map((reason) => (
              <div className="additional-reason" key={reason.code}>
                <span className={`small-dot priority-${reason.priority}`} />
                <div><strong>{reason.title}</strong><p>{reason.explanation}</p></div>
              </div>
            ))}
          </section>
        )}

        <section className="drawer-section">
          <p className="eyebrow">Backer context</p>
          <dl className="backer-facts">
            <div><dt>Reward</dt><dd>{backer.reward}</dd></div>
            <div><dt>Pledge</dt><dd>{money.format(backer.pledgeAmountCents / 100)}</dd></div>
            <div><dt>Location</dt><dd>{backer.location}</dd></div>
            <div><dt>Last activity</dt><dd>{backer.lastActivityDaysAgo === null ? "No recent activity" : backer.lastActivityDaysAgo === 0 ? "Today" : `${backer.lastActivityDaysAgo} days ago`}</dd></div>
          </dl>
        </section>

        <section className="drawer-section status-section">
          <p className="eyebrow">Relevant status</p>
          <div><span>Payment</span><strong>{statusLabel(backer.paymentStatus)}</strong></div>
          <div><span>Pledge Manager</span><strong>{statusLabel(backer.pledgeManagerStatus)}</strong></div>
          <div><span>Survey</span><strong>{statusLabel(backer.surveyStatus)}</strong></div>
          <div><span>Address</span><strong>{statusLabel(backer.addressStatus)}</strong></div>
        </section>
      </div>

      <footer className="drawer-footer">
        <p className="eyebrow">Suggested next step</p>
        {primaryReason.recommendedActions[0] === "NO_ACTION" ? (
          <div className="no-action-callout"><Icon name="check" size={18} /><span><strong>No action required</strong><small>We’ll keep tracking this pledge.</small></span></div>
        ) : (
          <div className="drawer-actions">
            {primaryReason.recommendedActions.map((action, index) => (
              <button
                className={index === 0 ? "primary-button" : "secondary-button"}
                key={action}
                onClick={() => onAction(item, action)}
                type="button"
              >
                {actionLabels[action]} {index === 0 && <Icon name="arrow" size={17} />}
              </button>
            ))}
            <button className="snooze-button" onClick={() => onSnooze(item)} type="button">
              Snooze for 3 days
            </button>
          </div>
        )}
      </footer>
    </aside>
  );
}
