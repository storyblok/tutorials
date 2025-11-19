import { Storyblok } from "../../lib/storyblokClient.js";
import storyblokConfig from "../../../storyblokConfig.json" with { type: "json" };

export default async function importContentTypes() {
   let importCount = 0;
  // define the components to be created in Storyblok
  const components = [
    {
      name: "author",
      display_name: "Author",
      is_nestable: true,
      schema: {
        name: { type: "text", pos: 0 },
        image: { type: "asset", pos: 1 },
        bio: { type: "richtext", pos: 2 },
        externalId: { type: "text", pos: 3 },
      },
    },
    {
      name: "category",
      display_name: "Category",
      is_nestable: true,
      schema: {
        name: { type: "text", pos: 0 },
        slug: { type: "text", pos: 1 },
        externalId: { type: "text", pos: 2 },
      },
    },
    {
      name: "article",
      display_name: "Article Page",
      is_nestable: false,
      schema: {
        title: { type: "text", pos: 0 },
        date: {
          type: "datetime",
          pos: 1
        },
        body: { type: "richtext", pos: 2 },
        authors: {
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["author"],
          pos: 3,
        },
        categories: {
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["category"],
          pos: 4,
        },
      },
    },
  ];
  // create each component in Storyblok
  console.log("Creating components...");
  for (const component of components) {
    const created = await createComponent(component);
    if (created) importCount++;
  }
  return importCount;
}

async function createComponent(component) {
  try {
    const response = await Storyblok.post(
      `/spaces/${storyblokConfig.storyblokSpaceId}/components/`,
      {
        component,
      }
    );
    console.log(`✅ Created component: ${component.name}`);
    return response.data;
  } catch (error) {
    if (
      error.response?.data?.message?.includes("Name has already been taken")
    ) {
      console.log(`⚠️ Component "${component.name}" already exists.`);
    } else {
      console.error(
        `❌ Error creating ${component.name}:`,
        error.response?.data || error.message
      );
    }
  }
}
