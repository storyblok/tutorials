// eve connects to Storyblok's MCP server and offers its tools to the model.
// `tools.allow` keeps only the read-only tools.

import { defineMcpClientConnection } from "eve/connections";

// Authenticates with a Storyblok personal access token sent as a bearer
// header. Create the PAT with read-only permissions, scoped to audited spaces.
export default defineMcpClientConnection({
  url: "https://mcp.storyblok.com/mcp",
  description:
    "Storyblok Management API (read-only): spaces, stories, assets, components, datasources, releases and collaborators. Use it to inspect content when auditing for outdated, orphaned or broken content.",
  auth: {
    principalType: "app",
    getToken: async () => {
      const token = process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN;
      if (!token) {
        throw new Error("STORYBLOK_PERSONAL_ACCESS_TOKEN is not set");
      }
      return { token };
    },
  },
  tools: { allow: ["search", "describe", "execute_readonly"] },
});
