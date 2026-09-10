import { priorityLabels } from "../domain/attention";
import type { AttentionPriority } from "../domain/types";

export function PriorityBadge({ priority }: { priority: AttentionPriority }) {
  return (
    <span className={`priority-badge priority-${priority}`}>
      <span className="badge-dot" aria-hidden="true" />
      {priorityLabels[priority]}
    </span>
  );
}
