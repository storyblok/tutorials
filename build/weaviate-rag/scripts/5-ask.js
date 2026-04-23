// ./scripts/5-ask.js
import weaviate from "weaviate-client";
import ollama from "ollama";

const client = await weaviate.connectToLocal();
const collection = client.collections.get("Article");

// --- Step 1: Retrieve ---
async function retrieve(question, limit = 5, threshold = 0.3) {
  const results = await collection.query.hybrid(question, {
    limit,
    alpha: 0.75,
    returnMetadata: ["score"],
    returnProperties: ["title", "body", "description"],
  });

  const relevant = results.objects.filter(
    (obj) => obj.metadata.score >= threshold
  );

  if (relevant.length === 0) return null;
  return relevant;
}

// --- Step 2: Build prompt ---
function buildPrompt(question, sources) {
  const context = sources
    .map(
      (source, i) =>
        `[Source ${i + 1}: ${source.properties.title}]\n${source.properties.body.slice(0, 2000)}`
    )
    .join("\n\n---\n\n");

  return {
    system: `You are a helpful assistant that answers questions based ONLY on the provided context.
If the context does not contain enough information to answer the question, say so clearly.
When you use information from a source, cite it by number (e.g., [Source 1]).
Keep answers concise and practical.`,
    user: `Context:\n${context}\n\nQuestion: ${question}`,
  };
}

// --- Step 3: Generate (streaming) ---
async function generateStream(prompt, model = "qwen3.5:4b") {
  const stream = await ollama.chat({
    model,
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: "/no_think " + prompt.user },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.message.content);
  }
  console.log();
}

// --- Step 4: Ask ---
async function askQuestion(question, model) {
  console.log(`\n🔍 Searching for: "${question}"\n`);

  const sources = await retrieve(question, 5);

  if (!sources) {
    console.log("I don't have enough information to answer that question.");
    client.close();
    return;
  }

  console.log(
    `📚 Found ${sources.length} sources:`,
    sources.map((s) => s.properties.title)
  );

  const prompt = buildPrompt(question, sources);

  console.log(`\n💬 Answer (${model}):\n`);
  await generateStream(prompt, model);
}

// --- Main ---
const question = process.argv[2] || "How do I set up Storyblok with Next.js?";
const model = process.argv[3] || "qwen3.5:4b";

await askQuestion(question, model);
client.close();
