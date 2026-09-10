import { priorityLabels } from "../domain/attention";
import type { AttentionPriority } from "../domain/types";

interface AttentionSummaryProps {
  counts: Record<AttentionPriority, number>;
  total: number;
  activePriority: "all" | AttentionPriority;
  onSelect: (priority: "all" | AttentionPriority) => void;
}

const priorities: AttentionPriority[] = ["blocking", "action", "waiting", "informational"];

export function AttentionSummary({ counts, total, activePriority, onSelect }: AttentionSummaryProps) {
  return (
    <section className="attention-summary" aria-label="Attention summary">
      <button
        className={`summary-total ${activePriority === "all" ? "selected" : ""}`}
        onClick={() => onSelect("all")}
        type="button"
      >
        <span className="summary-icon">!</span>
        <span><strong>{total}</strong><small>need attention</small></span>
      </button>
      {priorities.map((priority) => (
        <button
          className={`summary-segment summary-${priority} ${activePriority === priority ? "selected" : ""}`}
          key={priority}
          onClick={() => onSelect(priority)}
          type="button"
        >
          <span className="summary-count">{counts[priority]}</span>
          <small>{priorityLabels[priority]}</small>
        </button>
      ))}
    </section>
  );
}
