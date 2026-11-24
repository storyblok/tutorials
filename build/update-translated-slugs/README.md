---
title: 
description: 
tags: 
---

# Update Translated Slugs Using Agents

This repository includes all the code necessary to follow our [Update Translated Slugs Using Agents](https://www.storyblok.com/tp/update-translated-slugs-with-agents) tutorial.

[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup?utm_source=docs)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

The project is an agent skill, `update-translated-slugs`, that adds or updates translated slugs and translated names for existing Storyblok stories and folders. A translated slug gives a story or folder its own URL segment in each language, for example `/de/nachrichten/` instead of `/de/news/`.

The skill uses the Storyblok Management API and the Translatable Slugs app. Because a translated slug changes a public URL, the agent shows you every translation and a dry-run preview, and writes nothing until you approve.

## What it's for

Use this skill to:

- Add translated slugs and names to stories, folders, or both.
- Fix or rename existing translated slugs.
- Add translated names to root stories (folder start pages).

Don't use it to:

- Translate story content or fields.
- Create new stories.
- Work in spaces that use folder-level translation (a separate folder per language).

## Get started

Before you start, make sure you have the following:

- Node.js 22 or later.
- The [Translatable Slugs app](https://www.storyblok.com/apps/translatable-slugs) installed in your Storyblok space.
- The target language added to your space under **Settings > Internationalization**.
- A Storyblok [personal access token](https://app.storyblok.com/#/me/account?tab=token) with access to the space.

**No Storyblok account yet? [Sign up now](https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=tutorials) to experience a 45-day free trial of all features.**

### 1. Install the skill

Install the skill with the [skills](https://skills.sh) CLI:

```sh
npx skills add https://github.com/storyblok/tutorials/tree/main/build/update-translated-slugs
```

This installs the skill into your current project. Add `-g` to install it for all your projects instead.

Alternatively, clone this project from the repository:

```sh
git clone --no-checkout --depth 1 --filter=tree:0 https://github.com/storyblok/tutorials.git && cd tutorials
git sparse-checkout set --no-cone /build/update-translated-slugs
git checkout && cd build/update-translated-slugs

```

Then copy the `update-translated-slugs` folder to `.claude/skills/` in your project, or to `~/.claude/skills/` to use it in all your projects.

### 2. Authenticate

Go to the installed skill's `scripts/` folder. For Claude Code, that's `.claude/skills/update-translated-slugs/scripts/` in your project, or `~/.claude/skills/update-translated-slugs/scripts/` if you installed it globally.

Rename the file `.env.example` to `.env` and provide your space ID and personal access token (find the space ID under **Settings > Space** in your Storyblok space):

```txt
SB_SPACE_ID=<REPLACE_WITH_YOUR_SPACE_ID>
SB_MANAGEMENT_API_TOKEN=<REPLACE_WITH_YOUR_TOKEN>
# Optional. The space's region: eu, us, ap, ca, or cn. Defaults to eu.
SB_REGION=eu
```

Don't commit `.env`. It contains your token.

### 3. Install all dependencies

From the same `scripts/` folder, run:

```sh
npm install
```

The agent also installs the dependencies automatically on the first run if they're missing.

## Use the skill

Ask your agent in plain language, for example:

- "Add French translated slugs to everything in the `articles` folder."
- "Change the German slug of the `news` folder to `nachrichten`."
- "Translate the slugs of the stories in `blog/` into Spanish, but leave the folder itself as is."

The agent then:

1. Checks your `.env` file and confirms that the Translatable Slugs app is installed.
2. Lists the languages in your space and confirms the target language.
3. Fetches the stories and folders you named. If you name a folder, the agent asks whether you mean the folder, the stories in it, or both.
4. Translates the slugs and names and writes them to `scripts/translations.json` for you to review. You can reply with changes or edit the file directly.
5. Runs a dry run that shows which slugs will be added (`+`) and which will be overwritten (`~ old → new`).
6. Applies the changes only after you approve the dry run, then reports how many slugs were added, updated, and failed.

Updating a translated slug changes a public URL. Set up redirects for the old URLs, and publish the new translated slugs and activate the redirects at the same time.

### Folders and root stories

A folder's translated slug becomes part of the translated path of everything inside it:

| Translated   | Resulting path               |
| ------------ | ---------------------------- |
| Folder only  | `/fr/actualites/my-post`     |
| Stories only | `/fr/news/mon-article`       |
| Both         | `/fr/actualites/mon-article` |

Root stories (folder start pages) are served at the folder's own path, so they can't have a translated slug. The skill gives them a translated name only.

## Scripts

Run the scripts from the `scripts/` folder so they can read the `.env` file.

| Task                         | Command                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| List the space's languages   | `node fetch-languages.js`                                     |
| List all stories and folders | `node fetch-stories.js`                                       |
| List entries under a path    | `node fetch-stories.js --starts-with articles`                |
| List only root stories       | `node fetch-stories.js --startpages`                          |
| Preview changes              | `node update-translated-slugs.js translations.json --dry-run` |
| Apply changes                | `node update-translated-slugs.js translations.json`           |

`translations.json` is a JSON array with one entry per story:

```json
[
  {
    "storyId": 123456789,
    "lang": "fr",
    "originalSlug": "marketing",
    "originalName": "Marketing",
    "slug": "commercialisation",
    "name": "Commercialisation"
  },
  {
    "storyId": 987654321,
    "lang": "fr",
    "isStartpage": true,
    "originalName": "News Home",
    "name": "Accueil des actualités"
  }
]
```

- `storyId`, `lang`, `slug`, and `name` are required. For a root story, set `"isStartpage": true` and leave out `slug`.
- `lang` must match a language code from `fetch-languages.js`.
- Slugs can contain only `0–9`, `a–z`, `A–Z`, underscores (`_`), and hyphens (`-`).
- `originalSlug` and `originalName` are for review only. The script ignores them.

`update-translated-slugs.js` validates every entry first and changes nothing if any entry is invalid. It stays within the API rate limit and retries automatically on `429` errors. It exits with code `1` if any story fails.

## Project structure

```
update-translated-slugs/
├── SKILL.md                        # Instructions the agent follows
├── README.md                       # This file
├── references/
│   └── management-api.md           # API details for debugging failed requests
└── scripts/
    ├── .env.example                # Template for your credentials
    ├── package.json
    ├── fetch-languages.js          # Lists the space's languages
    ├── fetch-stories.js            # Lists stories and folders
    └── update-translated-slugs.js  # Previews and applies translated slugs
```

## Extend the skill

To support special characters in translated slugs, enable **Allow special characters in slugs** under **Settings > Space**, then update `SLUG_PATTERN` in `scripts/update-translated-slugs.js` and the slug rules in `SKILL.md`. Remember to URL encode the slugs.

Learn more in the [Translatable Slugs app documentation](https://www.storyblok.com/docs/apps/translatable-slugs) and the [Management API reference](https://www.storyblok.com/docs/api/management).

Happy building!
