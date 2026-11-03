// @storyblok/management-api-client, node@>=22
import { createManagementApiClient } from "@storyblok/management-api-client";
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

const client = createManagementApiClient({
  personalAccessToken: SB_MANAGEMENT_API_TOKEN,
  spaceId: SB_SPACE_ID,
  region: SB_REGION,
  throwOnError: true, // throw HTTP errors as ClientError instead of returning them
});

try {
  const { data } = await client.spaces.get();
  const languages = data.space.options?.languages ?? [];

  // Print only the language codes and names configured in the space
  const output = {
    total: languages.length,
    languages: languages.map(({ code, name }) => ({ code, name })),
  };
  console.log(JSON.stringify(output, null, 2));
} catch (error) {
  // ClientError puts the HTTP status and the API's error body in error.response
  const details = error.response ? ` ${error.response.status} ${JSON.stringify(error.response.data)}` : "";
  console.error(`Error fetching languages: ${error.message}${details}`);
}
