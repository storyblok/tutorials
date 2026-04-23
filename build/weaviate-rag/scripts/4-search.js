// ./scripts/4-search.js
import weaviate from "weaviate-client";

const client = await weaviate.connectToLocal();
const collection = client.collections.get("Article");

const query = process.argv[2] || "How do I set up Storyblok with Next.js?";

console.log(`\n--- nearText (pure vector) ---`);
console.log(`Query: "${query}"\n`);

const vectorResults = await collection.query.nearText(query, {
  limit: 3,
  returnMetadata: ["distance"],
  returnProperties: ["title"],
});

for (const obj of vectorResults.objects) {
  console.log(`  📄 ${obj.properties.title}`);
  console.log(`     Distance: ${obj.metadata.distance.toFixed(4)}`);
}

console.log(`\n--- hybrid (vector + BM25) ---`);
console.log(`Query: "${query}"\n`);

const hybridResults = await collection.query.hybrid(query, {
  limit: 3,
  alpha: 0.75,
  returnMetadata: ["score"],
  returnProperties: ["title"],
});

for (const obj of hybridResults.objects) {
  console.log(`  📄 ${obj.properties.title}`);
  console.log(`     Score: ${obj.metadata.score.toFixed(4)}`);
}

client.close();
