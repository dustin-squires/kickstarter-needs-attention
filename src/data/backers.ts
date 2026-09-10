import type { Backer } from "../domain/types";

const base: Omit<Backer, "id" | "name" | "email" | "initials" | "avatarColor" | "location" | "countryCode" | "reward" | "pledgeAmountCents"> = {
  paymentStatus: "paid",
  pledgeManagerStatus: "complete",
  surveyStatus: "complete",
  missingSurveyFields: [],
  addressStatus: "valid",
  pledgeOverTimeStatus: "none",
  lastActivityDaysAgo: 2,
};

const makeBacker = (
  identity: Pick<Backer, "id" | "name" | "email" | "initials" | "avatarColor" | "location" | "countryCode" | "reward" | "pledgeAmountCents">,
  state: Partial<Backer> = {},
): Backer => ({ ...base, ...identity, ...state });

export const backers: Backer[] = [
  makeBacker(
    { id: "b-001", name: "James Park", email: "james.park@example.com", initials: "JP", avatarColor: "#42665b", location: "Seoul, South Korea", countryCode: "KR", reward: "Deluxe Edition", pledgeAmountCents: 12900 },
    { surveyStatus: "missing", missingSurveyFields: ["shirt size", "color"], lastActivityDaysAgo: 8 },
  ),
  makeBacker(
    { id: "b-002", name: "Alex Chen", email: "alex.chen@example.com", initials: "AC", avatarColor: "#8c5d40", location: "San Francisco, CA", countryCode: "US", reward: "Creator Edition", pledgeAmountCents: 14900 },
    { paymentStatus: "failed", lastActivityDaysAgo: 12 },
  ),
  makeBacker(
    { id: "b-003", name: "Sophie Dubois", email: "sophie.dubois@example.com", initials: "SD", avatarColor: "#9b5865", location: "Paris, France", countryCode: "FR", reward: "Deluxe Edition", pledgeAmountCents: 12900 },
    { addressStatus: "needs_review", lastActivityDaysAgo: 3 },
  ),
  makeBacker(
    { id: "b-004", name: "Maria Rossi", email: "maria.rossi@example.com", initials: "MR", avatarColor: "#6f624e", location: "Milan, Italy", countryCode: "IT", reward: "Standard Edition", pledgeAmountCents: 8900 },
    { pledgeManagerStatus: "not_started", lastActivityDaysAgo: 21 },
  ),
  makeBacker(
    { id: "b-005", name: "Daniel Kim", email: "daniel.kim@example.com", initials: "DK", avatarColor: "#496879", location: "Toronto, Canada", countryCode: "CA", reward: "Collector's Edition", pledgeAmountCents: 19900 },
    { paymentStatus: "pending", pledgeManagerStatus: "blocked", pledgeOverTimeStatus: "active", lastActivityDaysAgo: null },
  ),
  makeBacker(
    { id: "b-006", name: "Priya Shah", email: "priya.shah@example.com", initials: "PS", avatarColor: "#82577a", location: "London, UK", countryCode: "GB", reward: "Creator Edition", pledgeAmountCents: 14900 },
    { surveyStatus: "missing", missingSurveyFields: ["lens finish"], addressStatus: "needs_review", lastActivityDaysAgo: 10 },
  ),
  makeBacker(
    { id: "b-007", name: "Mateo García", email: "mateo.garcia@example.com", initials: "MG", avatarColor: "#9a6947", location: "Madrid, Spain", countryCode: "ES", reward: "Standard Edition", pledgeAmountCents: 8900 },
    { paymentStatus: "failed", pledgeManagerStatus: "in_progress", lastActivityDaysAgo: 16 },
  ),
  makeBacker(
    { id: "b-008", name: "Olivia Reed", email: "olivia.reed@example.com", initials: "OR", avatarColor: "#50705e", location: "Portland, OR", countryCode: "US", reward: "Deluxe Edition", pledgeAmountCents: 12900 },
    { pledgeManagerStatus: "in_progress", lastActivityDaysAgo: 6 },
  ),
  makeBacker(
    { id: "b-009", name: "Emi Tanaka", email: "emi.tanaka@example.com", initials: "ET", avatarColor: "#6b5f91", location: "Tokyo, Japan", countryCode: "JP", reward: "Creator Edition", pledgeAmountCents: 14900 },
    { addressStatus: "needs_review", lastActivityDaysAgo: 1 },
  ),
  makeBacker(
    { id: "b-010", name: "Noah Williams", email: "noah.williams@example.com", initials: "NW", avatarColor: "#835e49", location: "Austin, TX", countryCode: "US", reward: "Standard Edition", pledgeAmountCents: 8900 },
    { pledgeManagerStatus: "not_started", lastActivityDaysAgo: 13 },
  ),
  makeBacker(
    { id: "b-011", name: "Fatima Zahra", email: "fatima.zahra@example.com", initials: "FZ", avatarColor: "#84684b", location: "Casablanca, Morocco", countryCode: "MA", reward: "Deluxe Edition", pledgeAmountCents: 12900 },
    { paymentStatus: "pending", pledgeManagerStatus: "blocked", pledgeOverTimeStatus: "active", lastActivityDaysAgo: 4 },
  ),
  makeBacker(
    { id: "b-012", name: "Lena Hoffmann", email: "lena.hoffmann@example.com", initials: "LH", avatarColor: "#4e697e", location: "Berlin, Germany", countryCode: "DE", reward: "Standard Edition", pledgeAmountCents: 8900 },
  ),
  makeBacker(
    { id: "b-013", name: "Amara Okafor", email: "amara.okafor@example.com", initials: "AO", avatarColor: "#805a54", location: "Lagos, Nigeria", countryCode: "NG", reward: "Creator Edition", pledgeAmountCents: 14900 },
    { addressStatus: "recently_changed", lastActivityDaysAgo: 0 },
  ),
  makeBacker(
    { id: "b-014", name: "Theo Martin", email: "theo.martin@example.com", initials: "TM", avatarColor: "#5f6f52", location: "Lyon, France", countryCode: "FR", reward: "Collector's Edition", pledgeAmountCents: 19900 },
    { pledgeOverTimeStatus: "complete", lastActivityDaysAgo: 1 },
  ),
];
