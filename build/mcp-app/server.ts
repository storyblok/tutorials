import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import {
  McpServer,
  type CallToolResult,
  type ReadResourceResult,
} from "@modelcontextprotocol/server";
import { renderRichText } from "@storyblok/richtext";
import { createApiClient } from "@storyblok/api-client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

interface PreviewStory {
  name: string;
  slug: string;
  title: string;
  intro: string;
  author: string;
  updatedAt: string;
  editUrl?: string;
  bodyHtml: string;
  toc: string[];
}

const serverFile = fileURLToPath(import.meta.url);
const serverDir = path.dirname(serverFile);
const distDir = path.basename(serverDir) === "dist" ? serverDir : path.join(serverDir, "dist");
const resourceUri = "ui://storyblok/preview.html";

const fixture: PreviewStory = {
  name: "MCP Apps bring Storyblok previews into your AI workflow",
  slug: "articles/mcp-apps-preview",
  title: "Preview Storyblok content without leaving your AI conversation",
  intro: "Ask your agent to update a story, then review the result in the same conversation before it goes live.",
  author: "Christian",
  updatedAt: "Updated just now",
  bodyHtml: "<p>MCP Apps add interactive interfaces to the tools your agent already uses. For Storyblok, that means a content change can come back as a visual preview rather than another block of JSON.</p><h2>From content change to visual review</h2><p>The agent updates the story through the Storyblok MCP server and opens the resulting preview directly inside the chat.</p><blockquote>The preview stays next to the conversation that produced the change.</blockquote>",
  toc: ["From content change to visual review"],
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

interface RichTextNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
}

function plainText(nodes: RichTextNode[] | undefined): string {
  return (nodes ?? []).map((node) => node.text ?? plainText(node.content)).join("");
}

function collectHeadings(document: RichTextNode | undefined): string[] {
  return (document?.content ?? [])
    .filter((node) => node.type === "heading" && node.attrs?.level === 2)
    .map((node) => plainText(node.content));
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmbeddedComponent(blok: Record<string, unknown>): string {
  const component = escapeHtml(blok.component ?? "component");
  const fields = Object.entries(blok)
    .filter(([key]) => !["component", "_uid", "_editable"].includes(key))
    .map(([key, value]) => `<div><strong>${escapeHtml(key)}</strong>: ${escapeHtml(typeof value === "object" ? JSON.stringify(value) : value)}</div>`)
    .join("");
  return `<aside class="storyblok-component"><strong>${component}</strong>${fields}</aside>`;
}

function renderRichTextBody(document: RichTextNode): string {
  try {
    return renderRichText(document as never, {
      renderers: {
        blok: (node: { attrs?: { body?: unknown[] | null } }) =>
          (node.attrs?.body ?? [])
            .filter((blok): blok is Record<string, unknown> => typeof blok === "object" && blok !== null)
            .map(renderEmbeddedComponent)
            .join(""),
      },
    });
  } catch {
    return "";
  }
}

function normalizeStory(payload: unknown, fallbackSlug: string): PreviewStory {
  const story = asRecord(asRecord(payload).story);
  const content = asRecord(story.content);
  const title = String(content.title ?? content.headline ?? story.name ?? "Untitled story");
  const intro = String(content.intro ?? content.description ?? content.summary ?? "");
  const richText = content.body ?? content.content;
  const document = isRichTextDocument(richText) ? richText : undefined;
  const bodyHtml = document ? renderRichTextBody(document) : "";

  return {
    name: String(story.name ?? title),
    slug: String(story.full_slug ?? fallbackSlug),
    title,
    intro,
    author: String(content.author_name ?? content.author ?? "Storyblok"),
    updatedAt: formatUpdatedAt(story.published_at),
    editUrl: typeof story.id === "number" && process.env.STORYBLOK_SPACE_ID
      ? `https://app.storyblok.com/#/me/spaces/${process.env.STORYBLOK_SPACE_ID}/stories/0/0/${story.id}`
      : undefined,
    bodyHtml,
    toc: collectHeadings(document),
  };
}

function formatUpdatedAt(value: unknown): string {
  if (!value) return "Draft preview";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf())
    ? "Draft preview"
    : `Published ${date.toLocaleDateString("en", { dateStyle: "medium" })}`;
}

function isRichTextDocument(value: unknown): value is RichTextNode {
  return typeof value === "object" && value !== null && Array.isArray((value as RichTextNode).content);
}

async function fetchStory(slug: string): Promise<PreviewStory> {
  const token = process.env.STORYBLOK_DELIVERY_TOKEN;
  if (!token) return { ...fixture, slug };

  const client = createApiClient({
    accessToken: token,
    region: z.enum(["eu", "us", "ca", "ap", "cn"]).parse(process.env.STORYBLOK_REGION ?? "eu"),
  });
  const { data, error } = await client.stories.get(slug, {
    query: {
      version: z.enum(["draft", "published"]).parse(process.env.STORYBLOK_VERSION ?? "draft"),
      excluding_story_fields: ["alternates", "translated_slugs"],
    },
  });
  if (error) throw new Error(`Storyblok request failed (${error.response.status || "network error"}).`);
  if (!data?.story) throw new Error("Storyblok did not return a story.");
  return normalizeStory(data, slug);
}

export function createServer(): McpServer {
  const server = new McpServer({ name: "Storyblok Preview", version: "0.1.0" });

  registerAppTool(
    server,
    "preview_storyblok_story",
    {
      title: "Preview Storyblok story",
      description: "Render a visual preview of a Storyblok story by slug.",
      inputSchema: z.object({
        slug: z.string().describe("The full Storyblok story slug to preview"),
      }),
      outputSchema: z.object({
        story: z.object({
          name: z.string(), slug: z.string(), title: z.string(),
          intro: z.string(), author: z.string(), updatedAt: z.string(),
          editUrl: z.string().optional(),
          bodyHtml: z.string(),
          toc: z.array(z.string()),
        }),
      }),
      _meta: { ui: { resourceUri } },
    },
    async ({ slug }): Promise<CallToolResult> => {
      try {
        const story = await fetchStory(slug);
        return {
          content: [{ type: "text", text: `Rendered a preview of /${story.slug}.` }],
          structuredContent: { story },
        };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unknown Storyblok error";
        return {
          isError: true,
          content: [{ type: "text", text: `Could not preview /${slug}: ${message}` }],
        };
      }
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => ({
      contents: [{
        uri: resourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(distDir, "mcp-app.html"), "utf8"),
        _meta: {
          ui: {
            csp: {
              resourceDomains: ["https://a.storyblok.com"],
              connectDomains: ["https://a.storyblok.com"],
            },
          },
        },
      }],
    }),
  );

  return server;
}
