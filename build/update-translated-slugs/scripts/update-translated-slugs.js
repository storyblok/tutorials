// Import the Storyblok Management API client (node@>=22)
import { createManagementApiClient } from "@storyblok/management-api-client";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();


// Read Management API token, Space ID, and optional region from environment variables.
const SB_MANAGEMENT_API_TOKEN = process.env.SB_MANAGEMENT_API_TOKEN;
const SB_SPACE_ID = process.env.SB_SPACE_ID;
const SB_REGION = process.env.SB_REGION || "eu";

if (!SB_MANAGEMENT_API_TOKEN || !SB_SPACE_ID) {
 console.error("Missing SB_MANAGEMENT_API_TOKEN or SB_SPACE_ID in .env");
 process.exit(1);
}

// Read the path to the translations file and the optional --dry-run flag.
// Usage: node update-translated-slugs.js <translations.json> [--dry-run]
// With --dry-run, the script fetches each story and prints what it would add or update, without changing anything.
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const [INPUT_FILE] = args.filter((arg) => arg !== "--dry-run");

if (!INPUT_FILE) {
 console.error("Usage: node update-translated-slugs.js <translations.json> [--dry-run]");
 process.exit(1);
}

let translations;
try {
 translations = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
} catch (error) {
 console.error(`Failed to read or parse ${INPUT_FILE}: ${error.message}`);
 process.exit(1);
}

if (!Array.isArray(translations) || translations.length === 0) {
 console.error(`${INPUT_FILE} must be a non-empty JSON array of translations`);
 process.exit(1);
}


// Validate every entry before making any API calls, so nothing is written if the file has errors
const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

const invalid = translations
 .map((t, index) => {
   const problems = [];
   if (!t.storyId) problems.push("missing storyId");
   if (!t.lang) problems.push("missing lang");
   if (!t.name) problems.push("missing name");
   // Root stories (isStartpage: true) only get a translated name, so slug is optional
   if (!t.slug) {
     if (!t.isStartpage) problems.push("missing slug");
   } else if (!SLUG_PATTERN.test(t.slug)) problems.push(`invalid slug "${t.slug}" (use only letters, numbers, underscores, and hyphens)`);
   return { index, storyId: t.storyId, problems };
 })
 .filter((entry) => entry.problems.length > 0);

if (invalid.length > 0) {
 console.error(`Found ${invalid.length} invalid entries. No translated slugs were added:`);
 for (const { index, storyId, problems } of invalid) {
   console.error(`  [${index}] storyId ${storyId ?? "?"}: ${problems.join(", ")}`);
 }
 process.exit(1);
}


/** Initialize the client with the personal access token
* from my account area: https://app.storyblok.com/#/me/account?tab=token
* The client limits itself to 6 requests per second and retries 429 responses
*/
const client = createManagementApiClient({
 personalAccessToken: SB_MANAGEMENT_API_TOKEN,
 spaceId: SB_SPACE_ID,
 region: SB_REGION,
 throwOnError: true, // throw HTTP errors as ClientError, so failures land in the catch block below
});


// Fetch the story, and find the existing translated slug for this language, if there is one
// For a root story, only the translated name is sent, so the slug is ignored
async function findTranslatedSlug(storyId, lang) {
 const { data } = await client.stories.get(storyId);
 const story = data.story;
 return {
   existing: story.translated_slugs?.find((ts) => ts.lang === lang),
   isStartpage: story.is_startpage === true, // root stories only get a translated name
 };
}


// Add a new translated slug to a story. For a root story, only the translated name is sent.
async function addTranslatedSlug({ storyId, lang, slug, name }, isStartpage = false) {
 await client.stories.update(storyId, {
   body: {
     "story": {
       "translated_slugs_attributes": [
         {
           "lang": lang, // language code
           ...(isStartpage ? {} : { "slug": slug }), // translated slug
           "name": name, // translated name
         }
       ]
     }
   }
 });
}


// Update an existing translated slug, identified by its ID. For a root story, only the translated name is sent.
async function updateTranslatedSlug({ storyId, lang, slug, name }, translatedSlugId, isStartpage = false) {
 await client.stories.update(storyId, {
   body: {
     "story": {
       "translated_slugs_attributes": [
         {
           "id": translatedSlugId, // translated slug ID
           "lang": lang, // language code
           ...(isStartpage ? {} : { "slug": slug }), // translated slug
           "name": name, // translated name
         }
       ]
     }
   }
 });
}


const failed = [];
let added = 0;
let updated = 0;
let rootStories = 0;

for (const t of translations) {
 try {
   const { existing, isStartpage } = await findTranslatedSlug(t.storyId, t.lang);

   if (isStartpage) {
     // Root stories use the folder's path, so only the translated name is added or updated
     if (t.slug) console.warn(`! ${t.storyId} ${t.lang}: root story, ignoring slug "${t.slug}"`);
     if (existing) {
       if (!DRY_RUN) await updateTranslatedSlug(t, existing.id, true);
       updated++;
       console.log(`~ ${t.storyId} ${t.lang} [root] name "${existing.name ?? ""}" → "${t.name}"`);
     } else {
       if (!DRY_RUN) await addTranslatedSlug(t, true);
       added++;
       console.log(`+ ${t.storyId} ${t.lang} [root] name "${t.name}"`);
     }
     rootStories++;
   } else if (!t.slug) {
     throw new Error("slug required for non-root story");
   } else if (existing) {
     if (!DRY_RUN) await updateTranslatedSlug(t, existing.id);
     updated++;
     console.log(`~ ${t.storyId} ${t.lang} ${existing.slug} → ${t.slug}`);
   } else {
     if (!DRY_RUN) await addTranslatedSlug(t);
     added++;
     console.log(`+ ${t.storyId} ${t.lang} ${t.slug}`);
   }
 } catch (error) {
   failed.push(t.storyId);
   // ClientError puts the HTTP status and the API's error body (for example, a duplicate slug) in error.response
   const details = error.response ? ` ${error.response.status} ${JSON.stringify(error.response.data)}` : "";
   console.error(`✗ ${t.storyId} ${t.lang}: ${error.message}${details}`);
 }
}

const rootNote = rootStories > 0 ? ` (${rootStories} root stories, name only)` : "";
if (DRY_RUN) {
 console.log(`\nDry run: ${added} would be added, ${updated} would be updated, ${failed.length} failed${rootNote}. Nothing was changed.`);
} else {
 console.log(`\nDone: ${added} added, ${updated} updated, ${failed.length} failed${rootNote}.`);
}
if (failed.length > 0) {
 console.error(`Failed story IDs: ${failed.join(", ")}`);
 process.exit(1);
}
