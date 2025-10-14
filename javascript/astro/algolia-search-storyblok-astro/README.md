# Integrate Algolia Search into Storyblok with Astro

This repository includes all the code necessary to follow our latest [Integrate Algolia Search into Storyblok with Astro](https://storyblok.com/tp/integrate-algolia-search-into-storyblok-with-astro) tutorial.

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get started

**No Storyblok account yet? [Sign up now](https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials) to experience a 14-day free trial of all features.**

### 1. Clone this repository

```sh
# git clone https://github.com/storyblok/tutorials/javascript/astro/algolia-search.git

git clone --no-checkout --depth 1 --sparse --filter=blob:none https://github.com/storyblok/tutorials.git
cd tutorials
git sparse-checkout set javascript/astro/algolia-search
git checkout

```

### 2. Install all dependencies

```sh
npm install
```

### 3. Authenticate

Rename the file `.env.example` to `.env` and provide your Storyblok access token (find it under **Settings > Access Tokens** in your Storyblok space):

```shell
STORYBLOK_DELIVERY_API_TOKEN="<REPLACE_WITH_YOUR_TOKEN>"
```

## Set up the space

Use [`storyblok CLI`](https://github.com/storyblok/storyblok-cli) to push the [schema](components.json) to your space.

Replace `SPACE_ID` with your space ID (find it under **Settings > Space**):

```shell
storyblok components push --space SPACE_ID
```

To render a preview of the local project in the Visual Editor, follow these steps:

1. Navigate to **Settings > Visual Editor**.
2. Set the default environment to `https://localhost:4321/`.
3. Navigate to **Content** and open the `home` story.
4. Select **Config** and type `/` in the **Real path**.

## Run the project locally

Start the development server:

```shell
npm run dev
```

Happy building!