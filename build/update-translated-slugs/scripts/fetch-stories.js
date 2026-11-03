// @storyblok/management-api-client, node@>=22
import { createManagementApiClient } from "@storyblok/management-api-client";

import dotenv from "dotenv";
dotenv.config();

const SB_MANAGEMENT_API_TOKEN = process.env.SB_MANAGEMENT_API_TOKEN;
const SB_SPACE_ID = process.env.SB_SPACE_ID;
const SB_REGION = process.env.SB_REGION || "eu";

if (!SB_MANAGEMENT_API_TOKEN || !SB_SPACE_ID) {
 console.error("Missing SB_MANAGEMENT_API_TOKEN or SB_SPACE_ID in .env");
 process.exit(1);
}

// Usage: node fetch-stories.js [--starts-with <full_slug>] [--startpages]
// With --starts-with, fetch only entries whose full_slug starts with the value, without a leading or trailing slash
// (for example, articles fetches the articles folder and everything in it)

const args = process.argv.slice(2);
const STARTPAGES_ONLY = args.includes("--startpages");

const startsWithIndex = args.indexOf("--starts-with");
const STARTS_WITH = startsWithIndex === -1 ? undefined : args[startsWithIndex + 1];

if (
  startsWithIndex !== -1 &&
  (!STARTS_WITH || STARTS_WITH.startsWith("--") || STARTS_WITH.startsWith("/") || STARTS_WITH.endsWith("/"))
) {
 console.error("Usage: node fetch-stories.js [--starts-with <full_slug>] [--startpages]");
 console.error("Pass the full_slug without a leading or trailing slash, for example articles");
 process.exit(1);
}

const PER_PAGE = 100;

// The client limits itself to 6 requests per second and retries 429 responses
const client = createManagementApiClient({
  personalAccessToken: SB_MANAGEMENT_API_TOKEN,
  spaceId: SB_SPACE_ID,
  region: SB_REGION,
  throwOnError: true, // throw HTTP errors as ClientError instead of returning them
});

// Fetch a single page of stories
async function fetchStoriesPage(page) {
  try {
    const { data, response } = await client.stories.list({
      query: {
        per_page: PER_PAGE,
        page,
        // The API matches the start of full_slug
        ...(STARTS_WITH && { starts_with: STARTS_WITH }),
      },
    });
    // The total number of stories is only sent in the Total response header
    const totalHeader = response.headers.get("total");
    return {
      stories: data.stories ?? [],
      total: totalHeader === null ? undefined : Number(totalHeader),
    };
  } catch (error) {
    // ClientError puts the HTTP status and the API's error body in error.response
    const details = error.response ? ` ${error.response.status} ${JSON.stringify(error.response.data)}` : "";
    console.error(`Error fetching page #${page}: ${error.message}${details}`);
    throw error;
  }
}

try {
  const stories = [];
  let page = 1;
  let hasMore = true;

  // Fetch all pages of stories
  while (hasMore) {
    const result = await fetchStoriesPage(page);
    stories.push(...result.stories);

    // Without a Total header, keep going until a page comes back less than full
    hasMore =
      result.stories.length > 0 &&
      (result.total === undefined ? result.stories.length === PER_PAGE : stories.length < result.total);
    page++;
  }

  // Keep only folder root stories (start pages) when --startpages is set
  // Without --startpages, all stories and folders are returned
  const selected = STARTPAGES_ONLY ? stories.filter((story) => story.is_startpage) : stories;

  // Print only the fields needed to translate slugs
  const output = {
    total: selected.length,
    stories: selected.map(({ id, name, slug, full_slug, is_folder, is_startpage, parent_id }) => ({
      id,
      name,
      slug,
      full_slug,
      is_folder, // true for folders
      is_startpage, // true for a folder's root story, which only gets a translated name
      parent_id, // ID of the folder that contains this story or folder
    })),
  };
  console.log(JSON.stringify(output, null, 2));
} catch (error) {
  console.error("Error fetching stories:", error.message);
  process.exit(1);
}
