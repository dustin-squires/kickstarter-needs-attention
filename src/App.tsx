import { useEffect, useMemo, useState } from "react";
import { actionLabels, buildAttentionQueue, getAttentionCounts } from "./domain/attention";
import type { AttentionItem, AttentionPriority, RecommendedAction } from "./domain/types";
import { backers } from "./data/backers";
import { project } from "./data/project";
import { AppShell } from "./components/AppShell";
import { AttentionSummary } from "./components/AttentionSummary";
import { AttentionFilters } from "./components/AttentionFilters";
import { BackerTable } from "./components/BackerTable";
import { BackerDetailDrawer } from "./components/BackerDetailDrawer";
import { Toast } from "./components/Toast";
import { Icon } from "./components/Icon";

type PriorityFilter = "all" | AttentionPriority;

export default function App() {
  const [selectedBackerId, setSelectedBackerId] = useState<string | null>(
    () => buildAttentionQueue(backers, project)[0]?.backer.id ?? null,
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeInformational, setIncludeInformational] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [snoozedBackerIds, setSnoozedBackerIds] = useState<string[]>([]);

  const fullQueue = useMemo(
    () => buildAttentionQueue(backers, project, { includeInformational: true }),
    [],
  );
  const defaultQueue = useMemo(() => buildAttentionQueue(backers, project), []);
  const activeQueue = useMemo(
    () => fullQueue.filter((item) => !snoozedBackerIds.includes(item.backer.id)),
    [fullQueue, snoozedBackerIds],
  );
  const activeDefaultCount = defaultQueue.filter(
    (item) => !snoozedBackerIds.includes(item.backer.id),
  ).length;
  const counts = useMemo(() => getAttentionCounts(activeQueue), [activeQueue]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return activeQueue.filter((item) => {
      const matchesPriority = priorityFilter === "all" || item.primaryReason.priority === priorityFilter;
      const allowedInformation = includeInformational || item.primaryReason.priority !== "informational";
      const matchesSearch = !normalizedQuery || item.backer.name.toLowerCase().includes(normalizedQuery) || item.backer.email.toLowerCase().includes(normalizedQuery);
      return matchesPriority && allowedInformation && matchesSearch;
    });
  }, [activeQueue, includeInformational, priorityFilter, searchQuery]);

  useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedBackerId(null);
      return;
    }
    if (
      selectedBackerId !== null &&
      !visibleItems.some((item) => item.backer.id === selectedBackerId)
    ) {
      setSelectedBackerId(visibleItems[0].backer.id);
    }
  }, [selectedBackerId, visibleItems]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const selectedItem = visibleItems.find((item) => item.backer.id === selectedBackerId) ?? null;

  const handleSummarySelect = (priority: PriorityFilter) => {
    if (priority === "informational") setIncludeInformational(true);
    setPriorityFilter(priority);
  };

  const handleAction = (item: AttentionItem, recommendedAction: RecommendedAction) => {
    const action = actionLabels[recommendedAction];
    setToastMessage(`${action} opened for ${item.backer.name}`);
  };

  const handleSnooze = (item: AttentionItem) => {
    setSnoozedBackerIds((ids) => [...ids, item.backer.id]);
    setToastMessage(`${item.backer.name} snoozed for 3 days`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setIncludeInformational(false);
  };

  return (
    <AppShell>
      <header className="project-header">
        <div className="project-identity">
          <div className="project-thumb" aria-hidden="true"><span>R</span></div>
          <div>
            <p className="project-kicker">Pledge Manager</p>
            <h1>{project.name}</h1>
            <p>Funded {project.fundedOn} <span>·</span> {project.totalBackers.toLocaleString()} backers <span>·</span> Pledge Manager active</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button">Export backers</button>
          <button className="primary-button" type="button">Send message <Icon name="chevron" size={16} /></button>
        </div>
      </header>

      <nav className="tabs" aria-label="Pledge Manager sections">
        {['Overview', 'Backers', 'Needs attention', 'Messages', 'Surveys', 'Shipping'].map((tab) => (
          <button className={tab === 'Needs attention' ? 'active' : ''} key={tab} type="button">
            {tab}
            {tab === 'Needs attention' && <span className="tab-count">{activeDefaultCount}</span>}
          </button>
        ))}
      </nav>

      <div className="content">
        <div className="page-intro">
          <div><h2>Needs attention</h2><p>Backers whose pledge state may need a next step.</p></div>
          <p className="updated"><span /> Updated just now</p>
        </div>
        <AttentionSummary
          activePriority={priorityFilter}
          counts={counts}
          onSelect={handleSummarySelect}
          total={activeDefaultCount}
        />
        <AttentionFilters
          includeInformational={includeInformational}
          onInformationalChange={(checked) => {
            setIncludeInformational(checked);
            if (!checked && priorityFilter === "informational") setPriorityFilter("all");
          }}
          onPriorityChange={handleSummarySelect}
          onQueryChange={setSearchQuery}
          priority={priorityFilter}
          query={searchQuery}
          snoozedCount={snoozedBackerIds.length}
          onRestoreSnoozed={() => {
            setSnoozedBackerIds([]);
            setToastMessage("Snoozed backers restored");
          }}
        />
        <div className={`queue-layout ${selectedItem ? "has-drawer" : ""}`}>
          <BackerTable
            items={visibleItems}
            onAction={handleAction}
            onClearFilters={clearFilters}
            onSelect={setSelectedBackerId}
            selectedId={selectedBackerId}
          />
          <BackerDetailDrawer
            item={selectedItem}
            onAction={handleAction}
            onClose={() => setSelectedBackerId(null)}
            onSnooze={handleSnooze}
          />
        </div>
      </div>
      <Toast message={toastMessage} />
    </AppShell>
  );
}
