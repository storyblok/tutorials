---
name: update-translated-slugs
description: Adds or updates translated slugs (the
  per-language URL segment) and translated names for existing Storyblok stories and folders, using the Management API and the Translatable Slugs app. Use this whenever the user wants localized, language-specific URLs or wants to fix, rename or change existing translated slug. Not for translating story content or fields, or for creating new stories or for spaces that use folder-level translation (a separate folder per language).
---

## Overview

Translated slugs give an existing story or folder its own URL segment in each language, for example `/de/nachrichten/` instead of `/de/news/`. This skill adds or updates them, along with translated names, using the bundled scripts, which call the Management API. A translated slug changes a public URL, so the user reviews every translation and a dry-run preview before anything is written.


## Typical Workflow

1. Check the `.env` file for the environment variables and ensure that the Management API token and Space ID are set correctly. `SB_REGION` is optional and defaults to `eu`. Set it to `us`, `ap`, `ca`, or `cn` if the space is in another region. 

2. Ask the user whether Translatable Slugs app is installed in their Storyblok space. If they answer yes, proceed. If they answer no, stop and tell them to install the app before continuing, because translated slugs require it.

3. Change to the `scripts/` folder in this skill's base directory, and run every command in this workflow from there. The scripts read `.env` from the current folder, so they fail with a missing-token error if run from anywhere else. If `node_modules` doesn't exist in that folder yet, install the dependencies once:

   ```sh
   npm install --silent --no-audit --no-fund
   ```

4. Run `node fetch-languages.js` to list the languages configured in the space. Ask the user which language to translate slugs into, unless they already said so in their request. Use the matching `code` from the output as the language code (for example, `fr` or `de-at`). If the requested language isn't in the list, stop and tell the user to add it in their space under **Settings > Internationalization** before continuing. If the list is empty, the space has no languages besides the default, so there's nothing to translate slugs into.

5. Fetch stories with `fetch-stories.js` and find the ones the user asked for. If the user names a folder or path, pass its exact `full_slug` with `--starts-with` without a leading or trailing slash (for example, `node fetch-stories.js --starts-with articles`). This fetches the folder itself and everything in it. Run it without `--starts-with` only when you don't know where the stories are, because in a large space the full list has thousands of entries.

   Entries with `is_folder: true` are folders. To find what's inside a folder, match `parent_id` to the folder's `id` for its direct children, or match the start of `full_slug` (for example, `blog/`) for everything nested under it.

   If the user names a folder, ask whether they mean the folder only, the stories in it, or both. They get different results: the folder's translated slug becomes part of the translated path of everything inside it. If only the folder is translated, the paths look like `/fr/actualites/my-post`. If only its stories are translated, they look like `/fr/news/mon-article`.

   Entries with `is_startpage: true` are root stories: a folder's start page, which is served at the folder's own path (`/news/`). Root stories can't have a translated slug, only a translated name. Their path changes only when the folder's slug is translated. To list only root stories, run `node fetch-stories.js --startpages`.

6. Translate slugs and names to the target language. For root stories, translate only the name. Slugs contain only the characters 0–9, a–z, A–Z, underscores (`_`), and hyphens (`-`).

7. Write the translations to `translations.json` in the `scripts/` folder (see [Translations file](#translations-file)), setting `lang` on every entry to the language code from step 4. Show the user each original and translated slug and name, and ask them to review. They can reply with changes or edit the file directly.

8. When the user is happy with the translations, re-read `translations.json` before proceeding because the user may have edited it directly. Then run `node update-translated-slugs.js translations.json --dry-run` and show the user the output. It lists which translated slugs will be added (`+`) and which existing ones will be overwritten (`~ old → new`). Ask the user to approve the changes before you apply them.

9. Only after the user explicitly approves the dry run, run `node update-translated-slugs.js translations.json` to add or update all translated slugs in one run. Report the summary, including how many were added, updated, and failed.

## Scripts

All scripts are in the `scripts/` folder. Run them from that folder so they can read the `.env` file. The Management API token and Space ID come from `.env`. The language code comes from `fetch-languages.js` output, confirmed with the user (step 4). Pass translations in `translations.json`.

`update-translated-slugs.js` builds the API requests for you, including finding the ID of an existing translated slug, so you don't need the API details for the normal workflow. If a request fails or you need to call the API directly, read [references/management-api.md](references/management-api.md).

| Script | Usage |
|---|---|
| Fetch configured languages | `node fetch-languages.js` |
| Fetch all stories | `node fetch-stories.js` |
| Fetch only stories whose `full_slug` starts with a value | `node fetch-stories.js --starts-with articles` |
| Fetch only root stories (folder start pages) | `node fetch-stories.js --startpages` |
| Preview changes without updating | `node update-translated-slugs.js <translations.json> --dry-run` |
| Add or update translated slugs | `node update-translated-slugs.js <translations.json>` |

`update-translated-slugs.js` validates every entry before calling the API. If any entry is invalid, it lists the errors and changes nothing. It processes stories one at a time. The API client limits itself to 6 requests per second and retries automatically when the API returns a rate-limit error (429). For each story, it makes two requests: one to fetch the story and one to add or update the translated slug. It prints `+` for each added slug, `~` with the old and new slug for each updated slug, and `✗` for each failure. A `✗` line includes the HTTP status and the API's error message, for example `✗ 123456789 fr: Unprocessable Entity 422 {"error":"..."}`. Root stories print `[root] name` lines with the translated name instead of the slug. If a root entry includes a slug, the script prints `!` and ignores the slug. A non-root entry without a slug fails with `✗`. It then prints a summary of added, updated, and failed stories, and exits with code 1 if any story fails. With `--dry-run`, it makes only the fetch request for each story, prints the same `+` / `~` / `✗` lines, and changes nothing.

To change a single story's translated slug, use a `translations.json` with one entry.

`fetch-stories.js` fetches every page of stories and folders (100 per page). The API client handles rate limiting. It prints the `id`, `name`, `slug`, `full_slug`, `is_folder`, `is_startpage`, and `parent_id` of each entry, but not `translated_slugs`. 

With `--starts-with <full_slug>`, the value is passed to the API's `starts_with` parameter, so it fetches every entry whose `full_slug` starts with it. The script exits with an error if the value starts or ends with a slash. With `--startpages`, only root stories are printed. The two options can be combined, for example `node fetch-stories.js --starts-with articles --startpages`. 

### Translations file

`translations.json` is a JSON array with one object per story:

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

- `storyId`, `lang`, `slug`, and `name` are required, except for root stories. For a root story, set `"isStartpage": true` and leave out `slug`. Only `storyId`, `lang`, and `name` are required. 
- `lang` is the language code from step 4. It must match a `code` returned by `fetch-languages.js`.
- `originalSlug` and `originalName` help the user review the file. The script ignores them.


