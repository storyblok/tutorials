// ./scripts/1-create-collection.js
import weaviate from "weaviate-client";

const client = await weaviate.connectToLocal();

// Delete if exists (for clean re-runs)
try {
  await client.collections.delete("Article");
  console.log("Deleted existing Article collection");
} catch (e) {
  // Collection doesn't exist, that's fine
}

await client.collections.create({
  name: "Article",
  description: "Blog articles for semantic search",
  properties: [
    { name: "title", dataType: "text" },
    { name: "description", dataType: "text" },
    { name: "body", dataType: "text" },
    { name: "url", dataType: "text" },
    { name: "author", dataType: "text" },
    { name: "organization", dataType: "text" },
    { name: "published_at", dataType: "date" },
    { name: "tags", dataType: "text[]" },
  ],
  vectorizers: weaviate.configure.vectorizer.text2VecTransformers({
    sourceProperties: ["title", "body"],
  }),
});

console.log("Created Article collection");
client.close();
