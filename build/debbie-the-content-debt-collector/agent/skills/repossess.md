---
description: Use when the user wants to repossess or delete unused (unclaimed) assets.
---

Only Unclaimed asset findings can be repossessed. Other findings have to be fixed by an editor in Storyblok.

1. Take the asset's ID and filename from its finding ("Asset <id> (`<filename>`) …"). Use `list_findings` if the finding isn't in the conversation.
2. Call `delete_unused_asset` once per asset. Each call waits for the user to click Approve in Slack, so don't ask for confirmation in chat first.
3. Report what the tool returns. A denied call changed nothing.
