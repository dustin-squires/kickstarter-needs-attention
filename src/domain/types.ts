export type AttentionPriority =
  | "blocking"
  | "action"
  | "waiting"
  | "informational";

export type AttentionReasonCode =
  | "PAYMENT_FAILED"
  | "SURVEY_REQUIRED_MISSING"
  | "ADDRESS_NEEDS_REVIEW"
  | "PLEDGE_MANAGER_INCOMPLETE"
  | "POT_PENDING";

export type RecommendedAction =
  | "SEND_REMINDER"
  | "VIEW_SURVEY"
  | "EDIT_ADDRESS"
  | "VIEW_PLEDGE"
  | "NO_ACTION";

export interface Backer {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  location: string;
  countryCode: string;
  reward: string;
  pledgeAmountCents: number;
  paymentStatus: "paid" | "failed" | "pending";
  pledgeManagerStatus: "not_started" | "in_progress" | "complete" | "blocked";
  surveyStatus: "not_required" | "missing" | "complete";
  missingSurveyFields: string[];
  addressStatus: "valid" | "needs_review" | "recently_changed";
  pledgeOverTimeStatus: "none" | "active" | "complete";
  lastActivityDaysAgo: number | null;
}

export interface ProjectContext {
  name: string;
  fundedOn: string;
  totalBackers: number;
  fulfillmentStartsInDays: number;
  pledgeManagerClosesInDays: number;
  addressesLockInDays: number;
}

export interface AttentionReason {
  code: AttentionReasonCode;
  priority: AttentionPriority;
  title: string;
  explanation: string;
  recommendedAction: RecommendedAction;
  sortScore: number;
}

export interface AttentionItem {
  backer: Backer;
  reasons: AttentionReason[];
  primaryReason: AttentionReason;
  sortScore: number;
}

export interface QueueOptions {
  includeInformational?: boolean;
}
