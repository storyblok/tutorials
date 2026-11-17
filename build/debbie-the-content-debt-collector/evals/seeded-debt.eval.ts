import { defineEval } from "eve/evals";

// Checks that scan_space finds the problems seeded into the author's test
// space. It only passes against that space.
const SPACE_ID = "296484495414277";

type ScanOutput = {
  statement: {
    entries: Array<{
      finding: { term: string; slug?: string; detail: string };
    }>;
  };
};

type ScanFinding = ScanOutput["statement"]["entries"][number]["finding"];

const has = (
  out: ScanOutput,
  term: string,
  match: (finding: ScanFinding) => boolean,
) =>
  out.statement.entries.some(
    ({ finding }) => finding.term === term && match(finding),
  );

const EXPECTED: Array<[string, string, (finding: ScanFinding) => boolean]> = [
  [
    "bounced: link to nonexistent story",
    "Bounced",
    (finding) =>
      finding.slug === "home" &&
      finding.detail.includes("3f6c9a2e-7b1d-4e8a-9c5f-2d4b6e8a1c3f"),
  ],
  [
    "bounced: dead external URL",
    "Bounced",
    (finding) =>
      finding.slug === "home" && finding.detail.includes("john-texas.invalid"),
  ],
  [
    "bounced: unpublished target",
    "Bounced",
    (finding) =>
      finding.slug === "home" &&
      finding.detail.includes("tsunami-in-a-box-9000-water-cannon"),
  ],
  [
    "bounced: deleted target",
    "Bounced",
    (finding) =>
      finding.slug === "home" &&
      finding.detail.includes("ed2f82d3-7c3f-497f-ab53-43928eeb7427"),
  ],
  [
    "dormant: testimonial",
    "Dormant account",
    (finding) => finding.detail.includes("`testimonial`"),
  ],
  [
    "pending: canary",
    "Pending transaction",
    (finding) =>
      finding.slug === "shop/detection/sniffington-canary-classic-gas-detector",
  ],
];

export default defineEval({
  description: "scan_space finds every problem seeded into the test space.",
  timeoutMs: 300_000,
  async test(t) {
    await t.send(`audit space ${SPACE_ID}`);
    t.succeeded();
    t.calledTool("scan_space", { count: 1 });
    for (const [label, term, match] of EXPECTED) {
      t.log(`expect ${label}`);
      t.calledTool("scan_space", {
        output: (value) => has(value as unknown as ScanOutput, term, match),
      });
    }
  },
});
