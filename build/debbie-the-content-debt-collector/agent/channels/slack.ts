import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

// eve receives Slack messages and posts the replies. Vercel Connect supplies
// the bot token and checks that requests come from Slack. No Slack secrets go
// into environment variables.
export default slackChannel({
  credentials: connectSlackCredentials("slack/content-debt-collector"),
});
