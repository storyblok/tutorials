import { defineTool } from "eve/tools";
import { z } from "zod";
import { addDispute, loadDisputes, loadLatestAudit } from "../lib/store.ts";

export default defineTool({
  description:
    "Record a dispute: the user says one specific finding is a false positive. The finding is left out of all future audits. Needs the finding's `key` from `list_findings` or `scan_space`; if a slug has several findings, ask the user which one first.",
  inputSchema: z.object({
    space_id: z.coerce.string().describe("Numeric Storyblok space ID."),
    key: z.string().describe("The finding's `key`."),
    reason: z
      .string()
      .optional()
      .describe("Why the user disputes it, in their words."),
  }),
  label: { start: () => "Recording a dispute" },
  async execute({ space_id: spaceId, key, reason }, ctx) {
    const audit = await loadLatestAudit(spaceId);
    const finding = [
      ...(audit?.entries ?? []).map((entry) => entry.finding),
      ...(audit?.disputed ?? []),
    ].find((candidate) => candidate.key === key);
    if (!finding) {
      return {
        error: `No finding with key ${key} in the latest audit. Use list_findings to look it up.`,
      };
    }
    const disputes = await loadDisputes(spaceId);
    const alreadyDisputed = disputes.some(
      (existing) => existing.finding.key === key,
    );
    if (alreadyDisputed) {
      return { alreadyDisputed, finding };
    }
    const dispute = {
      finding,
      reason,
      by: recordedBy(
        ctx.session.auth.current?.principalId,
        ctx.channel.metadata.channelId,
      ),
      at: new Date().toISOString(),
    };
    await addDispute(spaceId, dispute);
    return { recorded: dispute };
  },
});

// Describes who recorded a dispute for the audit trail. For Slack callers
// (principal `slack:<team>:<user>`) this uses Slack markup, which Slack renders
// as "@username" and "#channel-name": "<@U…> on Slack in <#C…>".
function recordedBy(principal: string | undefined, channelId: unknown): string {
  const slackUser = /^slack:[^:]+:([A-Z0-9]+)$/.exec(principal ?? "")?.[1];
  if (!slackUser) {
    return principal || "unknown";
  }
  if (typeof channelId !== "string") {
    return `<@${slackUser}> on Slack`;
  }
  if (channelId.startsWith("D")) {
    return `<@${slackUser}> on Slack in a direct message`;
  }
  return `<@${slackUser}> on Slack in <#${channelId}>`;
}
