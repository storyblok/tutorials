# Build an MCP App with Storyblok

This repository contains the working example for the [Build an MCP App with Storyblok](https://storyblok.com/tp/build-mcp-app-with-storyblok) tutorial. The app exposes a `preview_storyblok_story` tool, fetches a Storyblok story, and renders the result as an MCP Apps view inside a compatible host.

The project uses the official [`@modelcontextprotocol/ext-apps`](https://github.com/modelcontextprotocol/ext-apps) package. Storyblok supplies the content; the MCP App supplies the interface shown in the conversation. The server renders Storyblok rich text into the preview, including headings, paragraphs, images, and a generic fallback for nested components.

## Prerequisites

- A supported Node.js LTS release, version 22.12 or newer.
- A [Storyblok Preview access token](https://www.storyblok.com/docs/concepts/access-tokens#content-delivery-api-access-tokens) to retrieve draft content.
- An MCP Apps-compatible host, or the official reference host for local testing.

## Run locally

Install the dependencies, copy the environment template, and build the app:

```sh
npm install
cp .env.example .env
npm run build
```

Set `STORYBLOK_DELIVERY_TOKEN` in `.env` to a Preview access token from **Settings** → **Access Tokens**. Use `draft` so the preview includes unpublished changes. `eu` is the default region; for a space in another region, set `STORYBLOK_REGION` to `us`, `ca`, `ap`, or `cn` as appropriate. Without a token, the server renders a representative fixture so you can test the protocol and UI first. `STORYBLOK_SPACE_ID` is optional and enables the link back to the story in Storyblok.

The server uses [`@storyblok/api-client`](https://www.storyblok.com/docs/libraries/js/content-delivery-api-client) to fetch the story. It excludes `alternates` and `translated_slugs`, which this view doesn't use, and maps the response to the fields displayed by the interface.

## Article content model

The example expects the following article fields:

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | Text | Article heading |
| `intro` | Textarea | Introduction |
| `author` | Text | Author name |
| `body` | Richtext | Article body |

Create a story with this content type at `articles/mcp-apps-preview`, or pass an existing article's full slug to the tool. Save the story as a draft. Update `normalizeStory()` when your space uses different field names. The example also accepts `headline`, `description`, `summary`, `author_name`, and a rich-text `content` field as fallbacks.

The rich-text renderer handles the example's `body` field. For nested blocks, adapt `renderEmbeddedComponent()` to the components your content model uses.

## Start the server

Start the Streamable HTTP server:

```sh
npm start
```

The MCP endpoint is available at `http://localhost:3001/mcp`.

To use the stdio transport with a desktop host, run:

```sh
npm run start:stdio
```

## Connect a host

### Claude Desktop

Add the compiled stdio entry point to Claude Desktop’s MCP configuration. Replace the path with the absolute path on your machine:

```json
{
  "mcpServers": {
    "storyblok-preview": {
      "command": "node",
      "args": ["/absolute/path/to/dist/main.js", "--stdio"],
      "env": {
        "STORYBLOK_DELIVERY_TOKEN": "your-preview-access-token",
        "STORYBLOK_VERSION": "draft",
        "STORYBLOK_REGION": "eu"
      }
    }
  }
}
```

Set `STORYBLOK_REGION` to your space’s region. The example uses `eu`; for a non-EU space, replace it with `us`, `ca`, `ap`, or `cn` as appropriate.

Restart Claude Desktop, then ask it to preview a full Storyblok slug such as `articles/mcp-apps-preview`.

### ChatGPT and remote hosts

Remote hosts need an HTTPS endpoint. Deploy the server or expose the local endpoint through a secure tunnel, then add the `/mcp` URL through the host’s MCP app or developer settings.

### Reference host

The [MCP Apps testing guide](https://modelcontextprotocol.io/extensions/apps/testing) explains how to run the reference host. Point it at the local endpoint:

```sh
SERVERS='["http://localhost:3001/mcp"]' npm run start
```

Select `preview_storyblok_story`, provide a full story slug, and inspect the rendered view.

### Find stories with Storyblok's MCP server

Also connect [Storyblok's MCP server](https://www.storyblok.com/docs/tooling/mcp-server/setup) to the same host to let the agent find stories by name. Storyblok's server uses the Management API; this preview app still uses its own Preview access token for Content Delivery API requests.

With both servers connected, try the following prompt:

```text
Find the article called “MCP Apps preview” in my Storyblok space and preview it with preview_storyblok_story.
```

## Verify the example

Run the build and integration tests:

```sh
npm test
```

The tests cover the compiled HTTP and stdio transports, tool and UI resource registration, fixture mode, and Content Delivery API requests with an intercepted upstream response. They check region selection, draft and published versions, field exclusions, rich-text output, and API errors. They use no live credentials and do not verify a particular host's account setup.

## Extend the example with an agent

The project is intentionally small so you can point a coding agent at it and ask for the next feature:

```text
Add a component-level preview to this MCP App. Keep the Storyblok token on the server, reuse the existing ui:// resource, and let the preview_storyblok_story tool accept an optional component path. Follow the existing conventions and verify the build.
```

Other useful extensions include viewport switching, revision comparisons, a link back to the story in Storyblok, and app-only refresh actions.

## Learn more

- [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview)
- [MCP Apps quickstart](https://modelcontextprotocol.io/extensions/apps/quickstart)
- [Storyblok Content Delivery API](https://www.storyblok.com/docs/api/content-delivery/v2)
- [Storyblok Visual Editor](https://www.storyblok.com/docs/concepts/visual-editor)
