import { defineSchedule } from "eve/schedules";
import slack from "../channels/slack.ts";

// Does not run in `eve dev`
export default defineSchedule({
  cron: "0 8 * * 1",
  async run({ to, waitUntil, appAuth }) {
    const spaceId = process.env.STORYBLOK_SPACE_ID;
    const channelId = process.env.SLACK_CHANNEL_ID;
    if (!spaceId || !channelId) {
      throw new Error(
        "Set STORYBLOK_SPACE_ID and SLACK_CHANNEL_ID for the weekly audit.",
      );
    }
    waitUntil(
      to(slack, { channelId }).send(
        `Weekly collection run: audit space ${spaceId} and post the Statement of Account.`,
        {
          auth: appAuth,
        },
      ),
    );
  },
});
