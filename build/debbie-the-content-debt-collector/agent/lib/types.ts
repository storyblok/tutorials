// The project's core concepts as types and lookup tables

// Each kind of content debt with its collector term and its points per finding
// before interest
export const KINDS = {
  bounced: { term: "Bounced", points: 5 },
  overdue: { term: "Overdue", points: 2 },
  pending_transaction: { term: "Pending transaction", points: 2 },
  abandoned_property: { term: "Abandoned property", points: 2 },
  unclaimed_asset: { term: "Unclaimed asset", points: 1 },
  dormant_account: { term: "Dormant account", points: 1 },
};

export type DebtKind = keyof typeof KINDS;

export type Finding = {
  key: string; // Stable ID, used to match the same finding across audits
  readonly kind: DebtKind;
  term: string;
  points: number;
  slug?: string;
  storyId?: number;
  detail: string;
};

export type LedgerEntry = {
  finding: Finding;
  firstSeen: string; // ISO date
  streak: number; // consecutive audits that found this entry, including current
  owed: number; // Points, including interest
};

export type AuditRecord = {
  spaceId: string;
  auditedAt: string;
  entries: LedgerEntry[];
  disputed: Finding[];
};

export type Statement = {
  entries: LedgerEntry[];
  balance: number;
  opening: boolean;
  previousAuditAt?: string;
  newCharges: LedgerEntry[];
  paymentsReceived: Finding[];
  // Findings whose amount owed went up since the previous audit
  interest: Array<{ finding: Finding; from: number; to: number }>;
  finalNotices: LedgerEntry[];
};

// Disputes = findings a user says are false positives -> left out of audits
export type Dispute = {
  finding: Finding;
  reason?: string;
  by: string;
  at: string;
};
