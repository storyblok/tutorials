// Reads Storyblok story content and checks if external links are reachable.

import type { Story } from "@storyblok/management-api-client";

type Ref = {
  kind: "story" | "url";
  target: string; // Story UUID or URL
  where: string; // Human-readable location, e.g. "promo_banner.button_link"
};

export type Walked = {
  refs: Ref[];
  components: string[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Collects links, story references and blocks from story content in schema-free
// fashion:
// - object with `linktype: "story"` or `"url"` is a link (link fields and
//   rich text links alike),
// - object with a `component` key is a block,
// - any other UUID-shaped string is a story reference, since fields that refer
//   to stories store UUIDs. `_uid` and `id` are IDs of blocks, not stories.
// `where` names the field, as "component.field", of the nearest enclosing
// block.
export function walkContent(content: unknown): Walked {
  const out: Walked = { refs: [], components: [] };
  const visit = (node: unknown, where: string, key: string): void => {
    if (typeof node === "string") {
      const isStoryUuid = key !== "_uid" && key !== "id" && UUID.test(node);
      if (isStoryUuid) {
        out.refs.push({ kind: "story", target: node, where });
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        visit(item, where, key);
      }
      return;
    }
    if (!node || typeof node !== "object") {
      return;
    }
    const obj = node as Record<string, any>;
    if (obj.linktype === "story") {
      // Link fields store the story as `id`, richtext links as `uuid`.
      const target = obj.id || obj.uuid;
      if (target) {
        out.refs.push({ kind: "story", target, where });
      }
      return;
    }
    if (obj.linktype === "url") {
      const url = obj.url || obj.href;
      if (url) {
        out.refs.push({ kind: "url", target: url, where });
      }
      return;
    }
    const component = typeof obj.component === "string" ? obj.component : null;
    if (component && !out.components.includes(component)) {
      out.components.push(component);
    }
    for (const [field, value] of Object.entries(obj)) {
      visit(value, component ? `${component}.${field}` : where, field);
    }
  };
  visit(content, "", "");
  return out;
}

// An asset URL without host and query, e.g. "/f/123/600x400/abc/cat.jpeg".
export const assetPath = (filename: string) =>
  filename.replace(/^https?:\/\/[^/]+/, "").split("?")[0];

// Checks external links in story content. Each URL is checked only once. The
// checks keep running when the user cancels the turn; to stop them, pass in the
// tool's `ctx.abortSignal` and combine it with the timeout via
// `AbortSignal.any`. Left out for brevity's sake.
export async function checkLinks(
  stories: Story[],
): Promise<Map<string, boolean>> {
  const urls = new Set<string>();
  for (const story of stories) {
    for (const ref of walkContent(story.content).refs) {
      const isExternal = ref.kind === "url" && /^https?:\/\//.test(ref.target);
      if (isExternal) {
        urls.add(ref.target);
      }
    }
  }
  return new Map(
    await Promise.all(
      Array.from(urls, async (url) => [url, await isReachable(url)] as const),
    ),
  );
}

// Network errors and 4xx/5xx count as unreachable. Some servers reject HEAD and
// receive a GET in return
async function isReachable(url: string): Promise<boolean> {
  const status = async (method: "HEAD" | "GET"): Promise<number> => {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    await response.body?.cancel(); // Only the status matters, not the content
    return response.status;
  };
  try {
    let code = await status("HEAD");
    const rejectsHead = code === 405 || code === 403;
    if (rejectsHead) {
      code = await status("GET");
    }
    return code < 400;
  } catch {
    return false;
  }
}
