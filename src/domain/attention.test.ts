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

let fixtureSequence = 0;

const withState = (state: Partial<Backer>): Backer => ({
  ...healthyBacker,
  ...state,
  id: state.id ?? `fixture-${++fixtureSequence}`,
});

describe("deriveAttentionReasons", () => {
  it("treats a failed payment as waiting on the backer", () => {
    const [reason] = deriveAttentionReasons(
      withState({ paymentStatus: "failed" }),
      project,
    );

    expect(reason).toMatchObject({
      code: "PAYMENT_FAILED",
      priority: "waiting",
      recommendedActions: ["MESSAGE_BACKER", "VIEW_PLEDGE"],
    });
  });

  it("blocks fulfillment when a required survey response is missing near fulfillment", () => {
    const [reason] = deriveAttentionReasons(
      withState({
        surveyStatus: "missing",
        missingSurveyFields: [
          { label: "shirt size", requiredForFulfillment: true },
          { label: "color", requiredForFulfillment: true },
        ],
      }),
      project,
    );

    expect(reason.priority).toBe("blocking");
    expect(reason.explanation).toContain("shirt size and color");
    expect(reason.explanation).toContain("12 days");
  });

  it("downgrades a missing survey response when fulfillment is farther away", () => {
    const [reason] = deriveAttentionReasons(
      withState({ surveyStatus: "missing", missingSurveyFields: [{ label: "size", requiredForFulfillment: true }] }),
      { ...project, fulfillmentStartsInDays: 15 },
    );

    expect(reason.priority).toBe("waiting");
  });

  it("does not surface a missing survey field that fulfillment does not require", () => {
    const reasons = deriveAttentionReasons(
      withState({
        surveyStatus: "missing",
        missingSurveyFields: [{ label: "How did you hear about us?", requiredForFulfillment: false }],
      }),
      project,
    );

    expect(reasons).toEqual([]);
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

    expect(near.urgencyScore).toBeGreaterThan(far.urgencyScore);
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
      recommendedActions: ["SEND_REMINDER", "VIEW_PLEDGE"],
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
      recommendedActions: ["NO_ACTION"],
    });
  });

  it("keeps multiple reasons and makes the blocking reason primary", () => {
    const reasons = deriveAttentionReasons(
      withState({
        paymentStatus: "failed",
        surveyStatus: "missing",
        missingSurveyFields: [{ label: "color", requiredForFulfillment: true }],
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
      addressStatus: "needs_review",
    });
    const blocking = withState({
      id: "blocking",
      name: "Blocking",
      surveyStatus: "missing",
      missingSurveyFields: [{ label: "size", requiredForFulfillment: true }],
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
