// ./scripts/3-ingest-chunks.js
import weaviate from "weaviate-client";
import { readFileSync } from "fs";

const client = await weaviate.connectToLocal();

// --- Chunking function ---
function chunkByHeaders(article) {
  const sections = article.body.split(/(?=^#{2,3}\s)/m);

  return sections
    .filter((section) => section.trim().length > 50)
    .map((section, i) => ({
      title: article.title,
      chunkIndex: i,
      body: section.trim(),
      originalUrl: article.url,
      author: article.author,
    }));
}

// --- Create ArticleChunk collection ---
try {
  await client.collections.delete("ArticleChunk");
  console.log("Deleted existing ArticleChunk collection");
} catch (e) {
  // doesn't exist
}

await client.collections.create({
  name: "ArticleChunk",
  description: "Chunked blog articles for RAG",
  properties: [
    { name: "title", dataType: "text" },
    { name: "chunkIndex", dataType: "int" },
    { name: "body", dataType: "text" },
    { name: "originalUrl", dataType: "text" },
    { name: "author", dataType: "text" },
  ],
  vectorizers: weaviate.configure.vectorizer.text2VecTransformers({
    sourceProperties: ["title", "body"],
  }),
});

console.log("Created ArticleChunk collection");

// --- Chunk and ingest ---
const data = JSON.parse(readFileSync("./data/articles.json", "utf-8"));
const chunks = data.flatMap(chunkByHeaders);

console.log(`Chunked ${data.length} articles into ${chunks.length} chunks`);

const objects = chunks.map((chunk) => ({
  properties: {
    title: chunk.title,
    chunkIndex: chunk.chunkIndex,
    body: chunk.body,
    originalUrl: chunk.originalUrl,
    author: chunk.author,
  },
}));

// Batch insert
const batchSize = 20;
let inserted = 0;
for (let i = 0; i < objects.length; i += batchSize) {
  const batch = objects.slice(i, i + batchSize);
  const result = await client.collections
    .get("ArticleChunk")
    .data.insertMany(batch);
  const errors = Object.values(result.errors || {});
  if (errors.length > 0) {
    console.error(`Batch ${i} errors:`, errors.slice(0, 2));
  }
  inserted += batch.length;
}

console.log(`Ingested ${inserted} chunks`);
client.close();
