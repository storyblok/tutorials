// ./scripts/2-ingest.js
import weaviate from "weaviate-client";
import { readFileSync } from "fs";

const client = await weaviate.connectToLocal();
const articles = client.collections.get("Article");

const data = JSON.parse(readFileSync("./data/articles.json", "utf-8"));

const objects = data.map((article) => ({
  properties: {
    title: article.title,
    description: article.description || "",
    body: article.body,
    url: article.url,
    author: article.author,
    organization: article.organization || "",
    published_at: article.published_at,
    tags: typeof article.tags === "string"
      ? article.tags.split(",").map((t) => t.trim())
      : article.tags,
  },
}));

const result = await articles.data.insertMany(objects);
console.log(`Ingested ${objects.length} articles`);

// Check for errors
const errors = Object.values(result.errors || {});
if (errors.length > 0) {
  console.error(`${errors.length} errors:`, errors.slice(0, 3));
} else {
  console.log("No errors");
}

client.close();
