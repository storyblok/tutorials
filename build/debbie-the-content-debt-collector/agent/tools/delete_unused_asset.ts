import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { assetPath } from "../lib/content.ts";
import { createClient } from "../lib/storyblok.ts";

export default defineTool({
  description:
    "Delete an unclaimed asset (one no story uses), after the requesting user approves it in Slack. The asset moves to Storyblok's asset trash, where it can be restored. Takes the asset ID and filename from an Unclaimed asset finding. One asset per call.",
  inputSchema: z.object({
    space_id: z.coerce.string().describe("Numeric Storyblok space ID."),
    asset_id: z.number().describe("The asset ID from the finding."),
    filename: z
      .string()
      .describe(
        "The asset's filename from the finding, shown to the approver.",
      ),
  }),
  approval: {
    request: always(),
    prompt: ({ input }) =>
      `Delete the unused asset \`${input.filename}\`? It moves to the asset trash, where it can be restored.`,
  },
  label: { start: ({ filename }) => `Deleting ${filename}` },
  async execute({ space_id, asset_id }) {
    const client = await createClient(space_id, "write");
    // The last audit may be days old; verify the asset is still unused
    const { data: asset } = await client.assets.get(asset_id);
    const { data } = await client.stories.list({
      query: { reference_search: assetPath(asset.filename), per_page: 5 },
    });
    const usedBy = (data.stories ?? []).map((story) => story.full_slug);
    if (usedBy.length) {
      return {
        deleted: false,
        reason: `The asset is in use again, by ${usedBy.join(", ")}.`,
      };
    }
    await client.assets.delete(asset_id);
    return { deleted: true };
  },
});
