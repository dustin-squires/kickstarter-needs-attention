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
  VIEW_SURVEY: "View survey",
  EDIT_ADDRESS: "Edit address",
  VIEW_PLEDGE: "View pledge",
  NO_ACTION: "No action",
};

const deadlinePressure = (days: number, ceiling: number) =>
  Math.max(0, Math.min(ceiling, ceiling - days));

const inactivityPressure = (days: number | null) =>
  Math.min(days ?? 0, 20);

const pluralize = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? "" : "s"}`;

export function deriveAttentionReasons(
  backer: Backer,
  project: ProjectContext,
): AttentionReason[] {
  const reasons: AttentionReason[] = [];

  if (backer.surveyStatus === "missing") {
    const fields = backer.missingSurveyFields.join(" and ") || "required reward details";
    const isNearFulfillment = project.fulfillmentStartsInDays <= 14;
    reasons.push({
      code: "SURVEY_REQUIRED_MISSING",
      priority: isNearFulfillment ? "blocking" : "waiting",
      title: "Required survey response missing",
      explanation: isNearFulfillment
        ? `Fulfillment starts in ${pluralize(project.fulfillmentStartsInDays, "day")}, but ${fields} is still missing. This pledge cannot be prepared.`
        : `${fields} is still missing. There is time to follow up before fulfillment begins.`,
      recommendedAction: "VIEW_SURVEY",
      sortScore: (isNearFulfillment ? 400 : 210) + deadlinePressure(project.fulfillmentStartsInDays, 30),
    });
  }

  if (backer.paymentStatus === "failed") {
    reasons.push({
      code: "PAYMENT_FAILED",
      priority: "action",
      title: "Payment failed",
      explanation:
        "The latest charge failed and this pledge cannot progress until the backer updates their payment method.",
      recommendedAction: "VIEW_PLEDGE",
      sortScore: 330 + inactivityPressure(backer.lastActivityDaysAgo),
    });
  }

  if (backer.addressStatus === "needs_review") {
    const nearLock = project.addressesLockInDays <= 7;
    reasons.push({
      code: "ADDRESS_NEEDS_REVIEW",
      priority: "action",
      title: "Shipping address needs review",
      explanation: nearLock
        ? `This address may not be usable for fulfillment. Addresses lock in ${pluralize(project.addressesLockInDays, "day")}.`
        : "This address may not be usable for fulfillment and should be reviewed before addresses lock.",
      recommendedAction: "EDIT_ADDRESS",
      sortScore: 320 + deadlinePressure(project.addressesLockInDays, 14),
    });
  }

  const pledgeManagerIncomplete =
    backer.pledgeManagerStatus === "not_started" ||
    backer.pledgeManagerStatus === "in_progress";

  if (pledgeManagerIncomplete && project.pledgeManagerClosesInDays <= 14) {
    reasons.push({
      code: "PLEDGE_MANAGER_INCOMPLETE",
      priority: "waiting",
      title: "Pledge Manager incomplete",
      explanation: `This backer has not finished checkout. The Pledge Manager closes in ${pluralize(project.pledgeManagerClosesInDays, "day")}.`,
      recommendedAction: "SEND_REMINDER",
      sortScore: 200 + deadlinePressure(project.pledgeManagerClosesInDays, 20),
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
      explanation:
        "No creator action is required. This backer can enter the Pledge Manager after their final installment completes.",
      recommendedAction: "NO_ACTION",
      sortScore: 100,
    });
  }

  return reasons.sort((a, b) => b.sortScore - a.sortScore || a.code.localeCompare(b.code));
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
        sortScore: reasons[0].sortScore,
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
        b.sortScore - a.sortScore ||
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
