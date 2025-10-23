import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create the MCP server
const server = new McpServer({
  name: "skeleton-manager",
  version: "1.0.0",
});

server.tool(
  "ping",
  "Ping the skeleton server to check if it is running",
  { message: z.string().describe("Your Message") },
  async ({ message }) => {
    try {
      return {
        content: [
          { type: "text", text: `Server was pinged with the following message => ${message}` },
        ],
      };
    } catch (error) {
      console.error("Error in ping tool:", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server is running");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
