## Story Version Caching

Storyblok provides a cache version (`cv`) that changes whenever **anything** is published in a space. If your app always uses the latest space `cv` for every request, you end up forcing new cache keys constantly, which reduces CDN cache hits.

**Story Version Caching** improves this by treating `cv` as a **per-story detail**: we store the last successful `cv` for each story slug and reuse it for future requests. When a story is published, we invalidate only that story’s stored `cv`, so the next request refreshes it.

### Parts involved

- **Storyblok / CDN** — Request published content by slug, optionally including a `cv` value (`/stories/<slug>?cv=<number>`).
- **Supabase** — Stores the dictionary of `slug → cv` (lightweight key/value storage, not full story JSON).
- **Webhook (hosted by the frontend/app)** — Called by Storyblok when a story is published; used to invalidate the cached `cv` for that slug.

### Setup

#### Required runtime config values

**Storyblok**
- `public.storyblokToken` — Storyblok Content Delivery API token (published content)

**Supabase**
- `supabaseUrl` — Supabase project URL (REST base)
- `supabaseKey` — Supabase API key used for REST calls
- `supabaseCacheTable` (optional) — defaults to `edge_cache`

#### Supabase table

Create a table (default: `edge_cache`) with:

- `key` (text) — unique / primary key  
- `value` (text) — stores the `cv` number  
- `created_at` (timestamp) — optional  

#### Webhook configuration

This project exposes two Storyblok webhook routes:

- `POST /api/webhooks/storyblok/invalidate/:token`  
  Invalidation endpoint. Storyblok should call this on publish events. The `:token` path segment is validated against `storyblokWebhookToken` from runtime config.

The webhook is used to invalidate the cached `cv` for a story when content is published. Define a shared token and include it in the webhook URL as a **query parameter**.

Example webhook URL:

```text
https://your-domain.com/api/webhooks/storyblok?token=abc123
```

On publish, the webhook handler should delete the cache entry for `storyblok:slug:<full_slug>` so the next request repopulates it.

### What’s included (files)

- `build/story-version-caching/server/caching/StoryVersionCachingService.ts`  
  Fetch wrapper that reads a cached `cv` for a slug, tries Storyblok with that `cv`, falls back to a normal fetch, then stores the returned `cv`.

- `build/story-version-caching/server/caching/StoryblokClient.ts`  
  Storyblok CDN client for published stories by slug, with optional `cv`. Returns `{ story, cv }`.

- `build/story-version-caching/server/caching/SupabaseClient.ts`  
  Supabase REST key/value store used for the `slug → cv` dictionary.

- 'build/story-version-caching/server/api/webhooks/storyblok/invalidate/[token].post.ts'
Webhook invalidation route (POST /api/webhooks/storyblok/invalidate/:token), removes the cached entry for full_slug.

- `build/story-version-caching/test-webhook.http`  
  Example HTTP requests for testing webhook endpoints locally and remotely.


# Storyblok Core Space Blueprint: Nuxt

Integrate [Nuxt](https://nuxt.com/) with [Storyblok](http://www.storyblok.com) as a headless CMS.

This blueprint is ideal for kickstarting new Storyblok and Next.js projects. What's inside:
- Pre-configured default blocks: `page`, `teaser`, `grid`, and `feature`.
- Support for the Visual Editor's live preview.
- Dynamic routing to fetch and render new stories automatically.
- Minimal styling.

> [!TIP]
> Follow our [Nuxt guide](LINK) for a step-by-step walkthrough and learn more about Storyblok's range of features, including rich text rendering, custom content modeling, and internationalization. See the [@storyblok/nuxt package reference](https://storyblok.com/docs/packages/storyblok-nuxt) for further information.

***

[![Open in GitHub Codespaces](https://img.shields.io/badge/Open%20in%20GitHub%20Codespaces-dad4ff.svg?style=for-the-badge&logo=GitHub&logoColor=181717&labelColor=ffffff&color=dad4ff)](https://github.com/codespaces/new?skip_quickstart=true&machine=basicLinux32gb&repo=962644002&ref=main&geo=EuropeWest)
[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get Started

**No Storyblok account yet? [Sign up now](https://app.storyblok.com/#/signup?utm_source=docs) to experience a 14-day free trial of all features and enjoy our completely free Starter plan.**

1. Create an empty new Storyblok space
2. Create a new repository based on this template
3. Open the project on your device
4. Install dependencies

```sh
npm install
```

### Authentication

In the root of the project, create a `.env` file to store the access token of your space:

```sh
STORYBLOK_DELIVERY_API_TOKEN=<REPLACE_WITH_YOUR_TOKEN>
```

> [!TIP]
> Copy your space's preview access token from **Settings** > **Access Tokens**.
> Learn more about Storyblok [access tokens](https://www.storyblok.com/docs/concepts/access-tokens).

### Connect the Visual Editor

To render a preview of the local project in the Visual Editor, follow these steps:

1. In your space, navigate to **Settings > Visual Editor**.
2. Set the default environment to `https://localhost:3000/`.
3. Save.
4. Open the `home` story.
5. Click **Config**.
6. Type `/` in the **Real path**.

Run the development server:
```sh
npm run dev
```

> [!IMPORTANT]
> To connect the Storyblok Visual Editor, the local project must run over HTTPS. Learn more in the [Visual Editor concept](https://www.storyblok.com/docs/concepts/visual-editor#local-development-via-https). See the [Visual Preview part of the Nuxt guide](https://storyblok.com/docs/guides/nuxt/visual-preview) for detailed instructions.

Back in Storyblok, open the **Home** story to start editing.

Happy building!

## Resources

- To learn more about what you can do with Storyblok, visit [our documentation and learning hub](https://www.storyblok.com/docs).
- To learn more about the integration between Storyblok and Nuxt, check our [dedicated developer tutorials](https://www.storyblok.com/tutorials?technologies=nuxt).
- To learn more about Nuxt, check the [official documentation](https://nuxt.com/docs).

### Support

- Have questions, need help, want to chat with other users? [Join our Discord community](https://storyblok.com/join-discord).
- Visit the Storyblok [Help Center](https://support.storyblok.com/hc/en-us).
