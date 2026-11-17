import { defineTool } from "eve/tools";
import { z } from "zod";
import { checkLinks } from "../lib/content.ts";
import { buildStatement, creditRating } from "../lib/ledger.ts";
import { audit } from "../lib/rules.ts";
import { loadDisputes, loadLatestAudit, saveAudit } from "../lib/store.ts";
import { fetchSpace } from "../lib/storyblok.ts";
import type { Finding } from "../lib/types.ts";

export default defineTool({
  description:
    "Audit a Storyblok space for content debt. Fetches every story, component and asset, and returns all findings (bounced links, overdue stories, pending transactions, abandoned property, unclaimed assets, dormant components) with the balance, credit rating, and changes since the previous audit. Read-only. Usually takes under a minute.",
  inputSchema: z.object({
    space_id: z.coerce.string().describe("Numeric Storyblok space ID."),
  }),
  label: { start: ({ space_id }) => `Auditing space ${space_id}` },
  async execute({ space_id: spaceId }) {
    const now = new Date();

    // 1. Fetch the whole space, then check its external links.
    const { name, stories, components, assets } = await fetchSpace(spaceId);
    const urlStatus = await checkLinks(stories);

    // 2. Apply the rules, leave out disputed findings, and compare with the
    // previous audit before saving this one
    const allFindings = audit({
      stories,
      components,
      assets,
      urlStatus,
      now,
    });
    const disputes = await loadDisputes(spaceId);
    const isDisputed = (finding: Finding) =>
      disputes.some((dispute) => dispute.finding.key === finding.key);
    const findings = allFindings.filter((finding) => !isDisputed(finding));
    const previous = await loadLatestAudit(spaceId);
    const statement = buildStatement(findings, previous, now, isDisputed);
    await saveAudit({
      spaceId,
      auditedAt: now.toISOString(),
      entries: statement.entries,
      disputed: allFindings.filter(isDisputed),
    });

    // 3. The full result
    const storyCount = stories.filter((story) => !story.is_folder).length;
    return {
      space: { id: spaceId, name },
      auditedAt: now.toISOString(),
      totals: {
        stories: storyCount,
        components: components.length,
        assets: assets.length,
      },
      ...creditRating(statement.balance, storyCount),
      statement,
      disputes,
    };
  },
  // 4. Determines which slices of the full result get passed to the model
  toModelOutput({
    space,
    auditedAt,
    totals,
    per100,
    rating,
    statement,
    disputes,
  }) {
    return {
      type: "json",
      value: {
        space,
        auditedAt,
        totals,
        balance: statement.balance,
        debtPer100Stories: per100,
        creditRating: rating,
        openingStatement: statement.opening,
        previousAuditAt: statement.previousAuditAt,
        newCharges: statement.newCharges.map((entry) => entry.finding),
        paymentsReceived: statement.paymentsReceived,
        interest: statement.interest,
        finalNotices: statement.finalNotices.map(({ finding, streak }) => ({
          finding,
          auditsInARow: streak,
        })),
        disputed: disputes,
        findings: statement.entries.map(({ finding, owed }) => ({
          ...finding,
          owed,
          editorUrl: finding.storyId
            ? `https://app.storyblok.com/#/me/spaces/${space.id}/stories/0/0/${finding.storyId}`
            : undefined,
        })),
      },
    };
  },
});
