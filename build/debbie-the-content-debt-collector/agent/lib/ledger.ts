// Compares a new audit with the previous one: new charges, payments received,
// interest, final notices, and rates the balance.

import type { AuditRecord, Finding, LedgerEntry, Statement } from "./types.ts";

const MONTH = 30 * 24 * 60 * 60 * 1000;
const INTEREST_PER_MONTH = 0.1;
const FINAL_NOTICE_AFTER = 3; // Consecutive audits before a final notice

const round = (n: number) => Math.round(n * 10) / 10;

// isDisputed marks findings that were disputed since the previous audit, so
// they aren't reported as payments received.
export function buildStatement(
  findings: Finding[],
  previous: AuditRecord | null,
  now: Date,
  isDisputed: (finding: Finding) => boolean,
): Statement {
  const prev = new Map(
    (previous?.entries ?? []).map((entry) => [entry.finding.key, entry]),
  );
  const entries = findings.map((finding): LedgerEntry => {
    const before = prev.get(finding.key);
    const firstSeen = before?.firstSeen ?? now.toISOString();
    const months = Math.floor(
      (now.getTime() - new Date(firstSeen).getTime()) / MONTH,
    );
    return {
      finding,
      firstSeen,
      streak: (before?.streak ?? 0) + 1,
      owed: round(finding.points * (1 + INTEREST_PER_MONTH * months)),
    };
  });
  const currentKeys = new Set(entries.map((entry) => entry.finding.key));
  return {
    entries,
    balance: round(entries.reduce((sum, entry) => sum + entry.owed, 0)),
    opening: previous === null,
    previousAuditAt: previous?.auditedAt,
    newCharges: previous
      ? entries.filter((entry) => !prev.has(entry.finding.key))
      : [],
    paymentsReceived: previous
      ? previous.entries
          .map((entry) => entry.finding)
          .filter(
            (finding) => !currentKeys.has(finding.key) && !isDisputed(finding),
          )
      : [],
    interest: entries
      .filter(
        (entry) =>
          prev.has(entry.finding.key) &&
          entry.owed > prev.get(entry.finding.key)!.owed,
      )
      .map((entry) => ({
        finding: entry.finding,
        from: prev.get(entry.finding.key)!.owed,
        to: entry.owed,
      })),
    finalNotices: entries.filter((entry) => entry.streak >= FINAL_NOTICE_AFTER),
  };
}

export function creditRating(
  balance: number,
  storyCount: number,
): { per100: number; rating: string } {
  const per100 = storyCount ? round((balance / storyCount) * 100) : 0;
  switch (true) {
    case per100 < 5:
      return { per100, rating: "AAA" };
    case per100 < 10:
      return { per100, rating: "AA" };
    case per100 < 20:
      return { per100, rating: "A" };
    case per100 < 35:
      return { per100, rating: "BBB" };
    case per100 < 50:
      return { per100, rating: "BB" };
    case per100 < 75:
      return { per100, rating: "B" };
    case per100 < 100:
      return { per100, rating: "C" };
    default:
      return { per100, rating: "D" };
  }
}
