import type {
  AttentionItem,
  AttentionPriority,
  AttentionReason,
  Backer,
  ProjectContext,
  QueueOptions,
  RecommendedAction,
} from "./types";

export const priorityLabels: Record<AttentionPriority, string> = {
  blocking: "Blocking fulfillment",
  action: "Needs creator action",
  waiting: "Waiting on backer",
  informational: "Informational",
};

export const actionLabels: Record<RecommendedAction, string> = {
  SEND_REMINDER: "Send reminder",
  MESSAGE_BACKER: "Message backer",
  VIEW_SURVEY: "View survey",
  EDIT_ADDRESS: "Edit address",
  VIEW_PLEDGE: "View pledge",
  NO_ACTION: "No action",
};

export const PRIORITY_RANK: Record<AttentionPriority, number> = {
  blocking: 4,
  action: 3,
  waiting: 2,
  informational: 1,
};

export const MAX_DEADLINE_PRESSURE_DAYS = 30;
export const MAX_INACTIVITY_PRESSURE_DAYS = 20;
export const FULFILLMENT_BLOCKING_WINDOW_DAYS = 14;
export const ADDRESS_LOCK_ACTION_WINDOW_DAYS = 7;
export const PLEDGE_MANAGER_REMINDER_WINDOW_DAYS = 14;

const deadlinePressure = (days: number) =>
  Math.max(0, MAX_DEADLINE_PRESSURE_DAYS - Math.min(days, MAX_DEADLINE_PRESSURE_DAYS));

const inactivityPressure = (days: number | null) =>
  Math.min(days ?? 0, MAX_INACTIVITY_PRESSURE_DAYS);

const pluralize = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? "" : "s"}`;

export function deriveAttentionReasons(
  backer: Backer,
  project: ProjectContext,
): AttentionReason[] {
  const reasons: AttentionReason[] = [];

  const fulfillmentFields = backer.missingSurveyFields
    .filter((field) => field.requiredForFulfillment)
    .map((field) => field.label);

  if (backer.surveyStatus === "missing" && fulfillmentFields.length > 0) {
    const fields = fulfillmentFields.join(" and ");
    const isNearFulfillment =
      project.fulfillmentStartsInDays <= FULFILLMENT_BLOCKING_WINDOW_DAYS;
    reasons.push({
      code: "SURVEY_REQUIRED_MISSING",
      priority: isNearFulfillment ? "blocking" : "waiting",
      title: "Missing required survey response",
      queueContext: isNearFulfillment
        ? `Fulfillment in ${pluralize(project.fulfillmentStartsInDays, "day")}`
        : `${fields} still missing`,
      explanation: isNearFulfillment
        ? `Fulfillment starts in ${pluralize(project.fulfillmentStartsInDays, "day")}, but ${fields} is still missing. This pledge cannot be prepared.`
        : `${fields} is still missing. There is time to follow up before fulfillment begins.`,
      recommendedActions: ["MESSAGE_BACKER", "VIEW_SURVEY"],
      urgencyScore: deadlinePressure(project.fulfillmentStartsInDays),
    });
  }

  if (backer.paymentStatus === "failed") {
    reasons.push({
      code: "PAYMENT_FAILED",
      priority: "waiting",
      title: "Payment failed",
      queueContext: backer.lastActivityDaysAgo === null
        ? "Waiting for payment update"
        : `No update in ${pluralize(backer.lastActivityDaysAgo, "day")}`,
      explanation:
        "The latest charge failed. This pledge is waiting for the backer to update their payment method; you can message them or review the pledge.",
      recommendedActions: ["MESSAGE_BACKER", "VIEW_PLEDGE"],
      urgencyScore: inactivityPressure(backer.lastActivityDaysAgo),
    });
  }

  if (backer.addressStatus === "needs_review") {
    const nearLock =
      project.addressesLockInDays <= ADDRESS_LOCK_ACTION_WINDOW_DAYS;
    reasons.push({
      code: "ADDRESS_NEEDS_REVIEW",
      priority: "action",
      title: "Shipping address needs review",
      queueContext: nearLock
        ? `Addresses lock in ${pluralize(project.addressesLockInDays, "day")}`
        : "Review before addresses lock",
      explanation: nearLock
        ? `This address may not be usable for fulfillment. Addresses lock in ${pluralize(project.addressesLockInDays, "day")}.`
        : "This address may not be usable for fulfillment and should be reviewed before addresses lock.",
      recommendedActions: ["EDIT_ADDRESS", "MESSAGE_BACKER"],
      urgencyScore: deadlinePressure(project.addressesLockInDays),
    });
  }

  const pledgeManagerIncomplete =
    backer.pledgeManagerStatus === "not_started" ||
    backer.pledgeManagerStatus === "in_progress";

  if (
    pledgeManagerIncomplete &&
    project.pledgeManagerClosesInDays <= PLEDGE_MANAGER_REMINDER_WINDOW_DAYS
  ) {
    reasons.push({
      code: "PLEDGE_MANAGER_INCOMPLETE",
      priority: "waiting",
      title: "Pledge Manager incomplete",
      queueContext: `Manager closes in ${pluralize(project.pledgeManagerClosesInDays, "day")}`,
      explanation: `This backer has not finished checkout. The Pledge Manager closes in ${pluralize(project.pledgeManagerClosesInDays, "day")}.`,
      recommendedActions: ["SEND_REMINDER", "VIEW_PLEDGE"],
      urgencyScore: deadlinePressure(project.pledgeManagerClosesInDays),
    });
  }

  if (
    backer.pledgeOverTimeStatus === "active" &&
    backer.paymentStatus === "pending"
  ) {
    reasons.push({
      code: "POT_PENDING",
      priority: "informational",
      title: "Waiting on final installment",
      queueContext: "Final installment pending",
      explanation:
        "No creator action is required. This backer can enter the Pledge Manager after their final installment completes.",
      recommendedActions: ["NO_ACTION"],
      urgencyScore: 0,
    });
  }

  return reasons.sort(
    (a, b) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
      b.urgencyScore - a.urgencyScore ||
      a.code.localeCompare(b.code),
  );
}

export function buildAttentionQueue(
  backers: Backer[],
  project: ProjectContext,
  options: QueueOptions = {},
): AttentionItem[] {
  return backers
    .map((backer) => {
      const reasons = deriveAttentionReasons(backer, project);
      if (reasons.length === 0) return null;
      return {
        backer,
        reasons,
        primaryReason: reasons[0],
      } satisfies AttentionItem;
    })
    .filter((item): item is AttentionItem => item !== null)
    .filter(
      (item) =>
        options.includeInformational ||
        item.primaryReason.priority !== "informational",
    )
    .sort(
      (a, b) =>
        PRIORITY_RANK[b.primaryReason.priority] -
          PRIORITY_RANK[a.primaryReason.priority] ||
        b.primaryReason.urgencyScore - a.primaryReason.urgencyScore ||
        a.backer.name.localeCompare(b.backer.name),
    );
}

export function getAttentionCounts(items: AttentionItem[]) {
  return items.reduce<Record<AttentionPriority, number>>(
    (counts, item) => {
      counts[item.primaryReason.priority] += 1;
      return counts;
    },
    { blocking: 0, action: 0, waiting: 0, informational: 0 },
  );
}
