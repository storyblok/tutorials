// ./scripts/6-compare-chunking.js
// Compare whole-article RAG vs chunked RAG on the same question
import weaviate from "weaviate-client";
import ollama from "ollama";

const client = await weaviate.connectToLocal();
const articles = client.collections.get("Article");
const chunks = client.collections.get("ArticleChunk");

const question = process.argv[2] || "What command design pattern does the Storyblok CLI v4 use?";

function buildPrompt(question, sources) {
  const context = sources
    .map(
      (s, i) =>
        `[Source ${i + 1}: ${s.properties.title}]\n${s.properties.body.slice(0, 2000)}`
    )
    .join("\n\n---\n\n");

  return {
    system: `You are a helpful assistant that answers questions based ONLY on the provided context.
If the context does not contain enough information to answer the question, say so clearly.
When you use information from a source, cite it by number. Keep answers concise.`,
    user: `/no_think Context:\n${context}\n\nQuestion: ${question}`,
  };
}

async function generate(prompt) {
  const stream = await ollama.chat({
    model: "qwen3.5:4b",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.message.content);
  }
  console.log();
}

// --- Whole article retrieval ---
console.log(`\n${"=".repeat(60)}`);
console.log(`WHOLE ARTICLES`);
console.log(`${"=".repeat(60)}`);
console.log(`Question: "${question}"\n`);

const articleResults = await articles.query.hybrid(question, {
  limit: 3,
  alpha: 0.75,
  returnMetadata: ["score"],
  returnProperties: ["title", "body"],
});

console.log("Sources:", articleResults.objects.map((o) => o.properties.title));
console.log();
const articlePrompt = buildPrompt(question, articleResults.objects);
await generate(articlePrompt);

// --- Chunked retrieval ---
console.log(`\n${"=".repeat(60)}`);
console.log(`CHUNKED ARTICLES`);
console.log(`${"=".repeat(60)}`);
console.log(`Question: "${question}"\n`);

const chunkResults = await chunks.query.hybrid(question, {
  limit: 5,
  alpha: 0.75,
  returnMetadata: ["score"],
  returnProperties: ["title", "body"],
});

console.log(
  "Sources:",
  chunkResults.objects.map(
    (o) => `${o.properties.title} (chunk)`
  )
);
console.log();
const chunkPrompt = buildPrompt(question, chunkResults.objects);
await generate(chunkPrompt);

client.close();
