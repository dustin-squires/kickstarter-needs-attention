import type { AttentionPriority } from "../domain/types";
import { Icon } from "./Icon";

interface AttentionFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  priority: "all" | AttentionPriority;
  onPriorityChange: (value: "all" | AttentionPriority) => void;
  includeInformational: boolean;
  onInformationalChange: (value: boolean) => void;
}

export function AttentionFilters(props: AttentionFiltersProps) {
  return (
    <div className="filters">
      <label className="search-control">
        <span className="sr-only">Search backers</span>
        <Icon name="search" size={17} />
        <input
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Search by name or email"
          type="search"
          value={props.query}
        />
      </label>
      <label className="select-control">
        <span className="sr-only">Filter by priority</span>
        <select
          onChange={(event) => props.onPriorityChange(event.target.value as "all" | AttentionPriority)}
          value={props.priority}
        >
          <option value="all">All priorities</option>
          <option value="blocking">Blocking fulfillment</option>
          <option value="action">Needs creator action</option>
          <option value="waiting">Waiting on backer</option>
          <option value="informational">Informational</option>
        </select>
        <Icon name="chevron" size={16} />
      </label>
      <label className="toggle-control">
        <input
          checked={props.includeInformational}
          onChange={(event) => props.onInformationalChange(event.target.checked)}
          type="checkbox"
        />
        <span className="toggle" aria-hidden="true"><span /></span>
        Show informational
      </label>
      <div className="sort-control" aria-label="Sorted by priority">
        Sort: <strong>Priority</strong> <Icon name="chevron" size={15} />
      </div>
    </div>
  );
}
