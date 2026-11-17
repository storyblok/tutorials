import assert from "node:assert/strict";
import { test } from "node:test";
import { buildStatement, creditRating } from "../agent/lib/ledger.ts";
import type { AuditRecord, Finding } from "../agent/lib/types.ts";

const makeFinding = (key: string, points = 5): Finding => ({
  key,
  kind: "bounced",
  term: "Bounced",
  points,
  slug: key,
  detail: key,
});
const noDisputes = () => false;
const day = (offset: number) =>
  new Date(Date.UTC(2026, 0, 1) + offset * 24 * 60 * 60 * 1000);

test("opening statement has no comparisons", () => {
  const statement = buildStatement(
    [makeFinding("a"), makeFinding("b")],
    null,
    day(0),
    noDisputes,
  );
  assert.equal(statement.opening, true);
  assert.equal(statement.balance, 10);
  assert.deepEqual(
    [
      statement.newCharges,
      statement.paymentsReceived,
      statement.interest,
      statement.finalNotices,
    ],
    [[], [], [], []],
  );
});

test("new charges and payments received", () => {
  const first = buildStatement(
    [makeFinding("a"), makeFinding("b")],
    null,
    day(0),
    noDisputes,
  );
  const prev = {
    spaceId: "1",
    auditedAt: day(0).toISOString(),
    entries: first.entries,
    disputed: [],
  };
  const statement = buildStatement(
    [makeFinding("b"), makeFinding("c")],
    prev,
    day(7),
    noDisputes,
  );
  assert.equal(statement.opening, false);
  assert.deepEqual(
    statement.newCharges.map((entry) => entry.finding.key),
    ["c"],
  );
  assert.deepEqual(
    statement.paymentsReceived.map((entry) => entry.key),
    ["a"],
  );
});

test("interest: +10% per full month since first seen", () => {
  const first = buildStatement([makeFinding("a")], null, day(0), noDisputes);
  const prev = {
    spaceId: "1",
    auditedAt: day(0).toISOString(),
    entries: first.entries,
    disputed: [],
  };
  const after29 = buildStatement([makeFinding("a")], prev, day(29), noDisputes);
  assert.equal(after29.entries[0].owed, 5);
  assert.deepEqual(after29.interest, []);
  const after61 = buildStatement([makeFinding("a")], prev, day(61), noDisputes);
  assert.equal(after61.entries[0].owed, 6);
  assert.deepEqual(
    after61.interest.map((change) => [change.from, change.to]),
    [[5, 6]],
  );
  assert.equal(after61.entries[0].firstSeen, day(0).toISOString());
});

test("final notice after three audits in a row", () => {
  let prev: AuditRecord | null = null;
  let statement = buildStatement([makeFinding("a")], prev, day(0), noDisputes);
  for (const dayNumber of [7, 14]) {
    prev = {
      spaceId: "1",
      auditedAt: day(dayNumber - 7).toISOString(),
      entries: statement.entries,
      disputed: [],
    };
    statement = buildStatement(
      [makeFinding("a")],
      prev,
      day(dayNumber),
      noDisputes,
    );
  }
  assert.deepEqual(
    statement.finalNotices.map((entry) => [entry.finding.key, entry.streak]),
    [["a", 3]],
  );
});

test("newly disputed findings are not payments received", () => {
  const first = buildStatement(
    [makeFinding("a"), makeFinding("b")],
    null,
    day(0),
    noDisputes,
  );
  const prev = {
    spaceId: "1",
    auditedAt: day(0).toISOString(),
    entries: first.entries,
    disputed: [],
  };
  const statement = buildStatement(
    [makeFinding("b")],
    prev,
    day(7),
    (finding) => finding.key === "a",
  );
  assert.deepEqual(statement.paymentsReceived, []);
});

test("credit rating bands", () => {
  assert.deepEqual(creditRating(0, 100), { per100: 0, rating: "AAA" });
  assert.deepEqual(creditRating(39, 134), { per100: 29.1, rating: "BBB" });
  assert.equal(creditRating(100, 100).rating, "D");
  assert.equal(creditRating(5, 0).rating, "AAA");
});
