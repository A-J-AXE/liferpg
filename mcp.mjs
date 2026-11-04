import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFile } from "node:fs/promises";
const server = new McpServer({ name: "lifeos-planner", version: "1.0.0" });
server.registerTool(
  "read_planner",
  {
    description:
      "Read the project names and scheduled tasks shared in LifeOS Settings.",
    inputSchema: {},
  },
  async () => {
    try {
      const data = await readFile(
        new URL("./.private/planner.json", import.meta.url),
        "utf8",
      );
      return { content: [{ type: "text", text: data }] };
    } catch {
      return {
        isError: true,
        content: [
          { type: "text", text: "Enable planner access in LifeOS Settings." },
        ],
      };
    }
  },
);
await server.connect(new StdioServerTransport());
