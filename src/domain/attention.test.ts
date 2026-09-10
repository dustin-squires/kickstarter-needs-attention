import { describe, expect, it } from "vitest";
import { buildAttentionQueue, deriveAttentionReasons } from "./attention";
import type { Backer, ProjectContext } from "./types";

const project: ProjectContext = {
  name: "Test project",
  fundedOn: "March 14, 2026",
  totalBackers: 100,
  fulfillmentStartsInDays: 12,
  pledgeManagerClosesInDays: 8,
  addressesLockInDays: 4,
};

const healthyBacker: Backer = {
  id: "healthy",
  name: "Healthy Backer",
  email: "healthy@example.com",
  initials: "HB",
  avatarColor: "#555555",
  location: "New York, NY",
  countryCode: "US",
  reward: "Standard Edition",
  pledgeAmountCents: 8900,
  paymentStatus: "paid",
  pledgeManagerStatus: "complete",
  surveyStatus: "complete",
  missingSurveyFields: [],
  addressStatus: "valid",
  pledgeOverTimeStatus: "none",
  lastActivityDaysAgo: 2,
};

const withState = (state: Partial<Backer>): Backer => ({
  ...healthyBacker,
  ...state,
  id: state.id ?? Math.random().toString(),
});

describe("deriveAttentionReasons", () => {
  it("turns a failed payment into a creator action", () => {
    const [reason] = deriveAttentionReasons(
      withState({ paymentStatus: "failed" }),
      project,
    );

    expect(reason).toMatchObject({
      code: "PAYMENT_FAILED",
      priority: "action",
      recommendedAction: "VIEW_PLEDGE",
    });
  });

  it("blocks fulfillment when a required survey response is missing near fulfillment", () => {
    const [reason] = deriveAttentionReasons(
      withState({
        surveyStatus: "missing",
        missingSurveyFields: ["shirt size", "color"],
      }),
      project,
    );

    expect(reason.priority).toBe("blocking");
    expect(reason.explanation).toContain("shirt size and color");
    expect(reason.explanation).toContain("12 days");
  });

  it("downgrades a missing survey response when fulfillment is farther away", () => {
    const [reason] = deriveAttentionReasons(
      withState({ surveyStatus: "missing", missingSurveyFields: ["size"] }),
      { ...project, fulfillmentStartsInDays: 15 },
    );

    expect(reason.priority).toBe("waiting");
  });

  it("returns no reasons for a fully complete backer", () => {
    expect(deriveAttentionReasons(healthyBacker, project)).toEqual([]);
  });

  it("scores an address issue higher as the address lock approaches", () => {
    const backer = withState({ addressStatus: "needs_review" });
    const far = deriveAttentionReasons(backer, {
      ...project,
      addressesLockInDays: 12,
    })[0];
    const near = deriveAttentionReasons(backer, {
      ...project,
      addressesLockInDays: 2,
    })[0];

    expect(near.sortScore).toBeGreaterThan(far.sortScore);
    expect(near.explanation).toContain("2 days");
  });

  it("treats an incomplete Pledge Manager as waiting on the backer", () => {
    const [reason] = deriveAttentionReasons(
      withState({ pledgeManagerStatus: "not_started" }),
      project,
    );

    expect(reason).toMatchObject({
      code: "PLEDGE_MANAGER_INCOMPLETE",
      priority: "waiting",
      recommendedAction: "SEND_REMINDER",
    });
  });

  it("treats an active installment as informational rather than failed", () => {
    const reasons = deriveAttentionReasons(
      withState({
        paymentStatus: "pending",
        pledgeManagerStatus: "blocked",
        pledgeOverTimeStatus: "active",
      }),
      project,
    );

    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toMatchObject({
      code: "POT_PENDING",
      priority: "informational",
      recommendedAction: "NO_ACTION",
    });
  });

  it("keeps multiple reasons and makes the blocking reason primary", () => {
    const reasons = deriveAttentionReasons(
      withState({
        paymentStatus: "failed",
        surveyStatus: "missing",
        missingSurveyFields: ["color"],
      }),
      project,
    );

    expect(reasons).toHaveLength(2);
    expect(reasons[0].priority).toBe("blocking");
    expect(reasons.map((reason) => reason.code)).toContain("PAYMENT_FAILED");
  });
});

describe("buildAttentionQueue", () => {
  it("sorts priority bands deterministically", () => {
    const waiting = withState({
      id: "waiting",
      name: "Waiting",
      pledgeManagerStatus: "not_started",
    });
    const action = withState({
      id: "action",
      name: "Action",
      paymentStatus: "failed",
    });
    const blocking = withState({
      id: "blocking",
      name: "Blocking",
      surveyStatus: "missing",
      missingSurveyFields: ["size"],
    });

    const queue = buildAttentionQueue([waiting, action, blocking], project);

    expect(queue.map((item) => item.primaryReason.priority)).toEqual([
      "blocking",
      "action",
      "waiting",
    ]);
  });

  it("hides informational-only items unless they are requested", () => {
    const installment = withState({
      paymentStatus: "pending",
      pledgeManagerStatus: "blocked",
      pledgeOverTimeStatus: "active",
    });

    expect(buildAttentionQueue([installment], project)).toEqual([]);
    expect(
      buildAttentionQueue([installment], project, {
        includeInformational: true,
      }),
    ).toHaveLength(1);
  });
});
