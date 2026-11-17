// Storyblok-specific features. Reads use STORYBLOK_PERSONAL_ACCESS_TOKEN, while
// writes use STORYBLOK_WRITE_TOKEN (only the approval-gated delete_unused_asset
// tool)

import type { Asset, Story } from "@storyblok/management-api-client";

export async function createClient(
  spaceId: string,
  kind: "read" | "write" = "read",
) {
  const [{ createManagementApiClient }, { getRegion }] = await Promise.all([
    import("@storyblok/management-api-client"),
    import("@storyblok/region-helper"),
  ]);
  const tokenEnv =
    kind === "write"
      ? "STORYBLOK_WRITE_TOKEN"
      : "STORYBLOK_PERSONAL_ACCESS_TOKEN";
  const token = process.env[tokenEnv];
  if (!token) {
    throw new Error(`${tokenEnv} is not set`);
  }
  const region = getRegion(spaceId);
  if (!region) {
    throw new Error(`Can't tell the Storyblok region of space ${spaceId}`);
  }
  return createManagementApiClient({
    personalAccessToken: token,
    spaceId: Number(spaceId),
    region,
    throwOnError: true,
  });
}

type Page<T> = { items: T[]; response: Response }; // as in "pagination"

// Since the client has no pagination helper, this reads the "total" header
async function getAll<T>(
  fetchPage: (page: number, perPage: number) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let total: number;
  do {
    const { items: batch, response } = await fetchPage(page, 100);
    items.push(...batch);
    total = Number(response.headers.get("total") ?? 0);
    page++;
  } while (items.length < total);
  return items;
}

// The requests keep running when the user cancels the turn. eve offers
// cancellation as `ctx.abortSignal` in the tool: pass it in here and give it to
// each client call as `signal`. Left out for brevity's sake.
export async function fetchSpace(spaceId: string) {
  const client = await createClient(spaceId);
  const [{ data: spaceData }, metas, { data: componentData }, assets] =
    await Promise.all([
      client.spaces.get(),
      getAll(async (page, per_page): Promise<Page<Story>> => {
        const { data, response } = await client.stories.list({
          query: { page, per_page },
        });
        return { items: data.stories ?? [], response };
      }),
      client.components.list(),
      getAll(async (page, per_page): Promise<Page<Asset>> => {
        const { data, response } = await client.assets.list({
          query: { page, per_page },
        });
        return { items: data.assets ?? [], response };
      }),
    ]);

  // Fetch content for non-folders
  const stories = await Promise.all(
    metas.map(async (meta) =>
      meta.is_folder
        ? meta
        : ((await client.stories.get(meta.id)).data.story ?? meta),
    ),
  );

  return {
    name: spaceData.space.name,
    stories,
    components: componentData.components,
    assets,
  };
}
