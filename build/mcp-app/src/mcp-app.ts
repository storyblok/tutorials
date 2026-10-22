import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/client";
import "./style.css";

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

const shell = document.querySelector(".app-shell") as HTMLElement;
const loading = document.querySelector("#preview-loading") as HTMLElement;
const content = document.querySelector("#preview-content") as HTMLElement;
const error = document.querySelector("#preview-error") as HTMLElement;
const context = document.querySelector("#preview-context") as HTMLElement;
const title = document.querySelector("#story-title") as HTMLElement;
const intro = document.querySelector("#story-intro") as HTMLElement;
const author = document.querySelector("#story-author") as HTMLElement;
const updated = document.querySelector("#story-updated") as HTMLElement;
const body = document.querySelector("#story-body") as HTMLElement;
const toc = document.querySelector("#story-toc") as HTMLElement;
const slug = document.querySelector("#story-slug") as HTMLElement;
const openStory = document.querySelector("#open-story") as HTMLButtonElement;

let currentEditUrl: string | undefined;

function handleHostContext(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
  if (ctx.safeAreaInsets) {
    shell.style.padding = `${ctx.safeAreaInsets.top}px ${ctx.safeAreaInsets.right}px ${ctx.safeAreaInsets.bottom}px ${ctx.safeAreaInsets.left}px`;
  }
}

function renderStory(story: PreviewStory) {
  context.textContent = `Rendered from ${story.slug}`;
  title.textContent = story.title;
  intro.textContent = story.intro;
  author.textContent = story.author;
  updated.textContent = story.updatedAt;
  slug.textContent = `/${story.slug}`;
  if (story.bodyHtml) {
    // The server renders the Storyblok rich-text document. It escapes text and
    // attributes through the renderer before sending this HTML to the view.
    body.innerHTML = story.bodyHtml;
  } else body.replaceChildren();
  const tocList = toc.querySelector("ul") as HTMLUListElement;
  tocList.replaceChildren(...story.toc.map((heading) => {
    const item = document.createElement("li");
    item.textContent = heading;
    return item;
  }));
  toc.hidden = story.toc.length === 0;
  currentEditUrl = story.editUrl;
  openStory.hidden = !currentEditUrl;
  loading.hidden = true;
  error.hidden = true;
  content.hidden = false;
}

function extractStory(result: CallToolResult): PreviewStory | undefined {
  return (result.structuredContent as { story?: PreviewStory } | undefined)?.story;
}

const app = new App({ name: "Storyblok Preview", version: "0.1.0" });

app.ontoolinput = (params) => {
  context.textContent = `Loading ${String(params.arguments?.slug ?? "story")}…`;
  loading.hidden = false;
  content.hidden = true;
  error.hidden = true;
};

app.ontoolresult = (result) => {
  const story = extractStory(result);
  if (story) return renderStory(story);
  loading.hidden = true;
  error.hidden = false;
  error.textContent = "The preview did not return a story.";
};

app.ontoolcancelled = () => {
  loading.hidden = true;
  error.hidden = false;
  error.textContent = "The preview request was cancelled.";
};

app.onhostcontextchanged = handleHostContext;
app.onteardown = async () => ({});
app.onerror = console.error;

openStory.addEventListener("click", async () => {
  if (currentEditUrl) await app.openLink({ url: currentEditUrl });
});

await app.connect();
const hostContext = app.getHostContext();
if (hostContext) handleHostContext(hostContext);
