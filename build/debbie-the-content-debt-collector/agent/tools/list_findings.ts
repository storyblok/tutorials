import { defineTool } from "eve/tools";
import { z } from "zod";
import { loadLatestAudit } from "../lib/store.ts";

export default defineTool({
  description:
    "Look up findings from the most recent stored audit of a space, optionally filtered by story slug. Returns each finding's `key`, which `dispute_finding` needs. Findings with `disputed: true` are left out of the balance. Fast; doesn't re-scan the space.",
  inputSchema: z.object({
    space_id: z.coerce.string().describe("Numeric Storyblok space ID."),
    slug: z
      .string()
      .optional()
      .describe(
        "Story full slug to filter by, e.g. `brands/`. Omit for all findings.",
      ),
  }),
  label: {
    start: ({ slug }) =>
      slug ? `Looking up findings for ${slug}` : "Looking up findings",
  },
  async execute({ space_id, slug }) {
    const audit = await loadLatestAudit(space_id);
    if (!audit) {
      return {
        error: "No stored audit for this space yet. Run scan_space first.",
      };
    }
    const wanted = slug?.replace(/^\//, "");
    const open = audit.entries.map(({ finding, owed }) => ({
      finding,
      owed,
      disputed: false,
    }));
    const disputed = audit.disputed.map((finding) => ({
      finding,
      owed: 0,
      disputed: true,
    }));
    const findings = [...open, ...disputed].filter(
      ({ finding }) => !wanted || finding.slug === wanted,
    );
    return { auditedAt: audit.auditedAt, findings };
  },
});
