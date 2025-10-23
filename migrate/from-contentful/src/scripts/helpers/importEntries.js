import { convertContentfulRT } from "../../utils/richTextConverter.js";
import { generateSlugFromName } from "../../utils/urlGeneration.js";
import { convertContentfulDate } from "../../utils/date.js";
import { Storyblok } from "../../lib/storyblokClient.js";
import storyblokConfig from "../../../storyblokConfig.json" with { type: "json" };

// Using the Universal JavaScript Client:
// https://github.com/storyblok/storyblok-js-client

// We need to group the entries so that we can create the stories in the correct order
// articles are dependent on authors and categories, so we need to create them first
function groupEntries(entries) {
  const grouped = { category: [], author: [], article: [] };

  for (const entry of entries ?? []) {
    const type = entry.sys.contentType.sys.id;
    if (type === "category") grouped.category.push(entry);
    else if (type === "author") grouped.author.push(entry);
    else if (type === "blogPage") grouped.article.push(entry);
  }

  return grouped;
}

async function mapAuthorEntry(entry, assets, locale, parentFolder) {
  let image = null;
  try {
    const asset = assets?.find(
      (asset) => asset.sys.id === entry.fields?.image?.[locale]?.sys?.id
    );
    const sbImage = await Storyblok.get(
      `spaces/${storyblokConfig.storyblokSpaceId}/assets/`,
      {
        search: asset?.fields?.file?.[locale]?.fileName,
      }
    );
    image = sbImage.data?.assets?.[0];
  } catch (error) {
    console.error(
      `Error fetching image for author entry: ${entry.fields?.internalName?.[locale]}`,
      error
    );
  }
  return {
    name: entry.fields?.internalName?.[locale],
    slug: generateSlugFromName(entry.fields?.internalName?.[locale]),
    content: {
      name:
        entry.fields?.title?.[locale] || entry.fields?.internalName?.[locale],
      externalId: entry.sys.id, // used to find the value and assign it to the correct blog - temporary field
      bio: entry.fields?.bio?.[locale] ? convertContentfulRT(entry.fields?.bio?.[locale]) : null,
      image: {
        ...image,
        fieldtype: "asset",
        is_external_url: false,
      },
      component: "author",
    },
    is_folder: false,
    parent_id: parentFolder, // ID of the parent folder "authors"
    is_startpage: false,
  };
}

function mapCategoryEntry(entry, locale, parentFolder) {
  return {
    name: entry.fields?.name?.[locale],
    slug: entry.fields?.slug?.[locale],
    content: {
      name: entry.fields?.name?.[locale],
      component: "category",
      externalId: entry.sys.id, // used to find the value and assign it to the correct blog - temporary field
    },
    is_folder: false,
    parent_id: parentFolder, // ID of the parent folder "categories"
    is_startpage: false,
  };
}

async function mapArticleEntry(entry, locale, parentFolder) {
  const authors = await Storyblok.get(
    `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
    {
      component: "author",
      filter_query: {
        externalId: {
          in: entry.fields?.authors?.[locale]
            ?.map((author) => author.sys.id)
            .join(","),
        },
      },
    }
  );
  const categories = await Storyblok.get(
    `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
    {
      component: "category",
      filter_query: {
        externalId: {
          in: entry.fields?.categories?.[locale]
            ?.map((author) => author.sys.id)
            .join(","),
        },
      },
    }
  );

  return {
    name: entry.fields?.internalName?.[locale],
    slug: entry.fields?.slug?.[locale],
    content: {
      title:
        entry.fields?.title?.[locale] || entry.fields?.internalName?.[locale],
      body: entry.fields?.body?.[locale] ? convertContentfulRT(entry.fields?.body?.[locale]) : null,
      date: entry.fields?.date?.[locale] ? convertContentfulDate(entry.fields?.date?.[locale]) : null,
      authors: authors.data.stories.map((author) => author.uuid),
      categories: categories.data.stories.map((category) => category.uuid),
      component: "article",
    },
    is_folder: false,
    parent_id: parentFolder, // ID of the parent folder "blogs"
    is_startpage: false,
  };
}

async function createStoryFolder(name, slug, parentId = 0) {
  return Storyblok.post(`/spaces/${storyblokConfig.storyblokSpaceId}/stories`, {
    story: {
      name: name,
      slug: slug,
      is_folder: true,
      parent_id: parentId,      
    }
  })
}

async function createStoriesSequentially(groupedEntries, assets, locale) {
  // Create the parent folders first
  const blogFolder = await createStoryFolder("Blog", "blogs");
  const categoryFolder = await createStoryFolder("Categories", "categories"); 
  const authorFolder = await createStoryFolder("Authors", "authors");

  let importCount = 0;
  // Create stories for each group sequentially
  for (const [group, entries] of Object.entries(groupedEntries)) {
    for (const entry of entries) {
      try {
        let mapped = null;
        switch (group) {
          case "author":
            mapped = await mapAuthorEntry(entry, assets, locale, authorFolder.data.story.id);
            break;
          case "category":
            mapped = mapCategoryEntry(entry, locale, categoryFolder.data.story.id);
            break;
          case "article":
            mapped = await mapArticleEntry(entry, locale, blogFolder.data.story.id);
            break;
        }

        if (mapped) {
          await Storyblok.post(
            `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
            {
              story: mapped,
            }
          );
          console.log(`✅ Created ${group}: ${mapped.name}`);
          importCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to create ${group}:`, error);
      }
    }
  }
  return importCount;
}

export default async function importEntries(entries, assets, locale = "en-US") {
  console.log("Importing entries...");
  const grouped = groupEntries(entries);
  const count = await createStoriesSequentially(grouped, assets, locale);
  console.log("✅ Entries imported successfully.");
  return count;
}
