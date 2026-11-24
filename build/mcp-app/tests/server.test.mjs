import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = fileURLToPath(new URL("../", import.meta.url));
const entry = path.join(root, "dist/main.js");
const preload = new URL("./storyblok-fetch-fixture.mjs", import.meta.url).href;
const token = "fixture-preview-token";
const resourceUri = "ui://storyblok/preview.html";
let workspace;
let upstream;
let upstreamUrl;
let requests = [];

const story = {
  id: 123,
  name: "Test article",
  full_slug: "articles/test-story",
  published_at: "2026-10-01T12:00:00Z",
  content: {
    component: "article",
    title: "Draft title <script>",
    intro: "Preview introduction",
    author: "Test author",
    body: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A heading" }] },
        { type: "paragraph", content: [{ type: "text", text: "Body text <script>alert(1)</script>" }] },
        { type: "blok", attrs: { body: [{ component: "feature", _uid: "fixture-block", headline: "<unsafe>" }] } },
      ],
    },
  },
};

before(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "storyblok-mcp-test-"));
  upstream = createServer((req, res) => {
    const url = new URL(req.headers["x-storyblok-test-url"]);
    requests.push(url);
    res.setHeader("Content-Type", "application/json");
    if (url.pathname.includes("missing")) {
      res.writeHead(404).end(JSON.stringify({ message: `Not found: ${token}` }));
      return;
    }
    res.end(JSON.stringify({ story, cv: 1, rels: [], links: [] }));
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  upstreamUrl = `http://127.0.0.1:${upstream.address().port}/`;
});

after(async () => {
  await new Promise(resolve => upstream.close(resolve));
  await rm(workspace, { recursive: true, force: true });
});

function environment(overrides) {
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => !key.startsWith("STORYBLOK_") && key !== "NODE_OPTIONS"));
  return {
    ...env,
    NODE_OPTIONS: `--import=${preload}`,
    STORYBLOK_TEST_UPSTREAM: upstreamUrl,
    ...overrides,
  };
}

async function withClient(overrides, action, transportKind = "http") {
  const client = new Client({ name: "example-verification", version: "1.0.0" });
  let child;
  try {
    if (transportKind === "stdio") {
      await client.connect(new StdioClientTransport({
        command: process.execPath,
        args: [entry, "--stdio"],
        cwd: workspace,
        env: environment(overrides),
        stderr: "pipe",
      }));
    } else {
      const listener = createServer();
      listener.listen(0, "127.0.0.1");
      await once(listener, "listening");
      const port = listener.address().port;
      await new Promise(resolve => listener.close(resolve));
      child = spawn(process.execPath, [entry], {
        cwd: workspace,
        env: environment({ PORT: String(port), ...overrides }),
        stdio: ["ignore", "pipe", "pipe"],
      });
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("MCP server did not start")), 10_000);
        child.once("error", error => { clearTimeout(timer); reject(error); });
        child.once("exit", code => { clearTimeout(timer); reject(new Error(`MCP server exited: ${code}`)); });
        child.stdout.on("data", data => {
          if (data.toString().includes("Storyblok Preview MCP App:")) {
            clearTimeout(timer);
            resolve();
          }
        });
      });
      await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    }
    await action(client);
  } finally {
    await client.close();
    if (child && child.exitCode === null) {
      child.kill("SIGTERM");
      await once(child, "exit");
    }
  }
}

async function preview(client, slug = "articles/test-story") {
  return client.callTool({ name: "preview_storyblok_story", arguments: { slug } });
}

test("compiled HTTP server registers the tool and bundled UI and supports fixture mode", async () => {
  requests = [];
  await withClient({}, async client => {
    const { tools } = await client.listTools();
    assert.equal(tools[0].name, "preview_storyblok_story");
    assert.equal(tools[0]._meta.ui.resourceUri, resourceUri);
    const { contents } = await client.readResource({ uri: resourceUri });
    assert.match(contents[0].mimeType, /^text\/html/);
    assert.match(contents[0].text, /id="story-body"/);
    assert.ok(contents[0].text.includes("<script"));
    assert.ok(!contents[0].text.includes(token));
    const result = await preview(client);
    assert.equal(result.isError, undefined);
    assert.equal(result.structuredContent.story.slug, "articles/test-story");
    assert.match(result.structuredContent.story.bodyHtml, /<h2>/);
  });
  assert.equal(requests.length, 0);
});

test("official client fetches draft article fields and renders the rich-text body", async () => {
  requests = [];
  await withClient({ STORYBLOK_DELIVERY_TOKEN: token, STORYBLOK_SPACE_ID: "456" }, async client => {
    const result = await preview(client);
    assert.equal(result.isError, undefined);
    const content = result.structuredContent.story;
    assert.equal(content.title, story.content.title);
    assert.equal(content.intro, story.content.intro);
    assert.equal(content.author, story.content.author);
    assert.match(content.bodyHtml, /<h2>A heading<\/h2>/);
    assert.match(content.bodyHtml, /&lt;script&gt;/);
    assert.match(content.bodyHtml, /&lt;unsafe&gt;/);
    assert.deepEqual(content.toc, ["A heading"]);
    assert.match(content.editUrl, /spaces\/456\/stories\/0\/0\/123$/);
    assert.ok(!JSON.stringify(result).includes(token));
  });
  assert.equal(requests.length, 1);
  const [url] = requests;
  assert.equal(url.hostname, "api.storyblok.com");
  assert.equal(decodeURIComponent(url.pathname), "/v2/cdn/stories/articles/test-story");
  assert.equal(url.searchParams.get("token"), token);
  assert.equal(url.searchParams.get("version"), "draft");
  assert.equal(url.searchParams.get("excluding_story_fields"), "alternates,translated_slugs");
  assert.equal(url.searchParams.has("excluding_fields"), false, "The article body must remain available");
});

test("non-EU spaces select the correct endpoint and published version", async () => {
  for (const [region, hostname] of [
    ["us", "api-us.storyblok.com"],
    ["ca", "api-ca.storyblok.com"],
    ["ap", "api-ap.storyblok.com"],
    ["cn", "app.storyblokchina.cn"],
  ]) {
    requests = [];
    await withClient({ STORYBLOK_DELIVERY_TOKEN: token, STORYBLOK_REGION: region, STORYBLOK_VERSION: "published" }, async client => {
      assert.equal((await preview(client)).isError, undefined);
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].hostname, hostname);
    assert.equal(requests[0].searchParams.get("version"), "published");
  }
});

test("API errors stay tool errors and do not expose the delivery token", async () => {
  await withClient({ STORYBLOK_DELIVERY_TOKEN: token }, async client => {
    const result = await preview(client, "articles/missing");
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /404/);
    assert.ok(!JSON.stringify(result).includes(token));
  });
});

test("invalid region configuration fails instead of silently selecting EU", async () => {
  requests = [];
  await withClient({ STORYBLOK_DELIVERY_TOKEN: token, STORYBLOK_REGION: "invalid" }, async client => {
    assert.equal((await preview(client)).isError, true);
  });
  assert.equal(requests.length, 0);
});

test("compiled stdio entry point returns the story and UI resource", async () => {
  await withClient({ STORYBLOK_DELIVERY_TOKEN: token }, async client => {
    assert.equal((await preview(client)).structuredContent.story.title, story.content.title);
    const result = await client.readResource({ uri: resourceUri });
    assert.match(result.contents[0].text, /id="story-title"/);
  }, "stdio");
});
