---
title: 
description: 
tags: 
---

# Story Version Caching: CV Handling Best Practice

This repository includes all the code necessary to follow our [Story Version Caching: CV Handling Best Practice](https://www.storyblok.com/tp/story-version-caching) tutorial.

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get started

Before you start, make sure you have a [Supabase](https://supabase.com/docs) account. This is where we store the `slug → cv` dictionary.


### Supabase configuration

Create a database table (default: `edge_cache`) with the following columns:

- `key` (text): unique/primary key  
- `value` (text): stores the `cv` number  
- `created_at` (timestamp): optional  

**No Storyblok account yet? [Sign up now](https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials) to experience a 14-day free trial of all features.**

### 1. Clone this project from the repository

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/seo-astro
git checkout && cd build/seo-astro

```

### 2. Install all dependencies

```sh
npm install
```

### 3. Authenticate

Rename the file `.env.example` to `.env` and provide your Storyblok access token (find it under **Settings → Access Tokens** in your Storyblok space):

```txt
STORYBLOK_DELIVERY_API_TOKEN=<REPLACE_WITH_YOUR_TOKEN>
```

## Set up the space

This tutorial uses [Storyblok's Nuxt Blueprint](https://www.storyblok.com/docs/concepts/blueprints).

To render a preview of the local project in the Visual Editor, follow these steps:

1. Navigate to **Settings → Visual Editor**.
2. Set the default environment to `https://localhost:3000/`.
3. Navigate to **Content** and open the `home` story.
4. Select **Config** and type `/` in the **Real path**.

### Webhook configuration

Finally, open **Settings → Webhooks** and create a webhook. The app uses the webhook to invalidate the cached `cv` of a story when its published. Define a shared token and include it in the webhook URL as a [query parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL).

Example webhook URL:

```text
https://your-domain.com/api/webhooks/storyblok?token=abc123
```

On publish, the webhook handler should delete the cache entry for `storyblok:slug:<full_slug>` so that the next request repopulates it.

## Run the project locally

Start the development server:

```sh
npm run dev
```

Happy building!
