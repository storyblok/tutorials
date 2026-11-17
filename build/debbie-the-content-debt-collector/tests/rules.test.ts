import assert from "node:assert/strict";
import { test } from "node:test";
import { audit } from "../agent/lib/rules.ts";
import {
  assets,
  components,
  NOW,
  stories,
  uuids,
  urlStatus,
} from "./fixtures.ts";

const run = () =>
  audit({ stories: stories(), components, assets, urlStatus, now: NOW });
const findingsOf = (kind: string) =>
  run().filter((finding) => finding.kind === kind);

test("bounced: missing story, unpublished story and dead URL", () => {
  const details = findingsOf("bounced").map((finding) => finding.detail);
  assert.equal(details.length, 3);
  assert.ok(details.some((detail) => detail.includes(uuids.missing)));
  assert.ok(
    details.some((detail) => detail.includes("unpublished story `draft`")),
  );
  assert.ok(details.some((detail) => detail.includes("https://dead.invalid/")));
});

test("overdue after 365 days", () => {
  assert.deepEqual(
    findingsOf("overdue")
      .map((finding) => finding.slug)
      .sort(),
    ["ancient", "old"],
  );
});

test("pending transaction: published with unpublished changes", () => {
  assert.deepEqual(
    findingsOf("pending_transaction").map((finding) => finding.slug),
    ["pending"],
  );
});

test("abandoned property: published stories nothing links to", () => {
  const slugs = findingsOf("abandoned_property")
    .map((finding) => finding.slug)
    .sort();
  // Not flagged: home (entry point), linked (linked from home), draft
  // (unpublished), docs/ (start page), docs/child (in a folder with a start
  // page).
  assert.deepEqual(slugs, [
    "ancient",
    "linked-too",
    "old",
    "orphan",
    "pending",
  ]);
});

test("unclaimed asset: unused and not deleted", () => {
  assert.deepEqual(
    findingsOf("unclaimed_asset").map((finding) => finding.key),
    ["asset|101"],
  );
});

test("dormant account: unused component", () => {
  assert.deepEqual(
    findingsOf("dormant_account").map((finding) => finding.key),
    ["component|unused_block"],
  );
});

test("keys are unique and stable across runs", () => {
  const firstRun = run().map((finding) => finding.key);
  const secondRun = run().map((finding) => finding.key);
  assert.equal(new Set(firstRun).size, firstRun.length);
  assert.deepEqual(firstRun, secondRun);
});

test("findings are sorted by severity", () => {
  const points = run().map((finding) => finding.points);
  assert.deepEqual(
    points,
    points.toSorted((x, y) => y - x),
  );
});

test("null publish state counts as unpublished", () => {
  const all = stories().map((story) => {
    const isUnpublished =
      story.uuid === uuids.draft || story.uuid === uuids.orphan;
    return isUnpublished
      ? { ...story, published: null, unpublished_changes: null }
      : story;
  });
  const found = audit({
    stories: all,
    components,
    assets,
    urlStatus,
    now: NOW,
  });
  assert.ok(
    found.some(
      (finding) => finding.key === `bounced|1|teaser.related|${uuids.draft}`,
    ),
    "link to it bounces",
  );
  assert.ok(
    !found.some((finding) => finding.key === "abandoned|4"),
    "not abandoned property",
  );
  assert.ok(
    !found.some(
      (finding) => finding.key.startsWith("pending|") && finding.storyId === 4,
    ),
    "no pending transaction",
  );
});
