---
title: 
description: 
tags: 
---

# Build an MCP App with Storyblok

This repository includes all the code necessary to follow our [Build an MCP App with Storyblok](https://www.storyblok.com/tp/build-mcp-app-with-storyblok) tutorial.

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get started

Before you start, make sure you have Node.js 22.12 or later and an [MCP Apps-compatible host](https://modelcontextprotocol.io/extensions/apps/overview).

### 1. Clone this project from the repository

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/mcp-app
git checkout && cd build/mcp-app

```

### 2. Install all dependencies

```sh
npm install
```

**No Storyblok account yet? [Sign up now](https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials) to experience a 45-day free trial of all features.**

### 3. Authenticate

Rename the file `.env.example` to `.env` and provide your Storyblok Preview access token (find it under **Settings → Access Tokens** in your Storyblok space):

```txt
STORYBLOK_DELIVERY_TOKEN=<REPLACE_WITH_YOUR_TOKEN>
```

## Set up the space

1. Create a content type with the fields `title` (Text), `intro` (Textarea), `author` (Text), and `body` (Richtext).
2. Navigate to **Content** and create a story with this content type at `articles/mcp-apps-preview`.
3. Save the story as a draft.

The app also reads the alternative field names `headline`, `description`, `summary`, `author_name`, and a rich-text `content` field. If your space uses other field names, update `normalizeStory()` in `server.ts`.

## Run the project locally

Build the project and start the server:

```sh
npm run build
npm start
```

The MCP endpoint is available at `http://localhost:3001/mcp`. For desktop hosts that use the stdio transport, run `npm run start:stdio` instead.

Remote hosts such as ChatGPT need a public HTTPS URL. Deploy the server or expose the local endpoint through a secure tunnel.

To test with the [MCP Apps reference host](https://modelcontextprotocol.io/extensions/apps/testing), point it at the local endpoint:

```sh
SERVERS='["http://localhost:3001/mcp"]' npm run start
```

Without `STORYBLOK_DELIVERY_TOKEN`, the server renders a sample story, so you can test the app before you connect a space. To run the integration tests, use:

```sh
npm test
```

## Extend the project

Point a coding agent at the project and ask for the next feature, for example:

```text
Add a component-level preview to this MCP App. Keep the Storyblok token on the server, reuse the existing ui:// resource, and let the preview_storyblok_story tool accept an optional component path. Follow the existing conventions and verify the build.
```

Learn more in the [MCP Apps quickstart](https://modelcontextprotocol.io/extensions/apps/quickstart) and the [Storyblok Visual Editor documentation](https://www.storyblok.com/docs/concepts/visual-editor).

Happy building!
