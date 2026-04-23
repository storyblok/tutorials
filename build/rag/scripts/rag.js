/**
 * RAG (Retrieval-Augmented Generation) example
 * 
 * This script:
 * 1. RETRIEVE - Searches Weaviate for relevant articles
 * 2. AUGMENT - Builds a prompt with the retrieved context
 * 3. GENERATE - Sends the prompt to Ollama for a grounded response
 * 
 * Run with: npm run rag
 */

import weaviate from 'weaviate-client';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'deepseek-r1:1.5b';

// NOTE: We're using a very small model (1.5B parameters) for this demo.
// Small models may produce inaccurate or hallucinated responses.
// For production, use a larger model (7B+) or a cloud API like OpenAI/Anthropic.

// Distance threshold: only use articles below this distance
// Lower distance = more relevant. This prevents off-topic content from polluting the answer.
const DISTANCE_THRESHOLD = 0.30;

// The question we want to answer
// We ask something specific that can ONLY be answered from our retrieved articles,
// not from the model's pre-trained knowledge.
const USER_QUESTION = "What new features were announced in Storyblok's React SDK v4?";

async function retrieve(articles, question) {
  console.log('📚 RETRIEVE: Searching for relevant articles...\n');
  
  const result = await articles.query.nearText(question, {
    limit: 5,  // Fetch more, then filter by threshold
    returnMetadata: ['distance']
  });

  console.log(`Found ${result.objects.length} articles. Filtering by distance < ${DISTANCE_THRESHOLD}:\n`);
  
  // Filter by distance threshold - only keep truly relevant articles
  const relevantArticles = result.objects.filter(
    item => item.metadata.distance < DISTANCE_THRESHOLD
  );

  for (const item of result.objects) {
    const included = item.metadata.distance < DISTANCE_THRESHOLD;
    const icon = included ? '✅' : '❌';
    console.log(`  ${icon} ${item.properties.title}`);
    console.log(`     Distance: ${item.metadata.distance.toFixed(4)} ${included ? '(included)' : '(filtered out)'}\n`);
  }

  console.log(`Using ${relevantArticles.length} article(s) for context.\n`);

  return relevantArticles;
}

function augment(retrievedArticles, question) {
  console.log('🔧 AUGMENT: Building prompt with context...\n');

  // Build context from retrieved articles
  const context = retrievedArticles.map(article => {
    return `Title: ${article.properties.title}\n${article.properties.body}`;
  }).join('\n\n---\n\n');

  // Build the prompt
  const prompt = `Answer the question using ONLY the information in the article below. Do not use any prior knowledge. Only state facts that appear in the article.

ARTICLE:
${context}

QUESTION: ${question}

ANSWER (using only facts from the article above):`;

  console.log(`Prompt built (${prompt.length} characters)\n`);
  
  return prompt;
}

async function generate(prompt) {
  console.log('🤖 GENERATE: Sending to Ollama...\n');

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

async function main() {
  console.log('='.repeat(60));
  console.log('RAG Demo: Retrieval-Augmented Generation');
  console.log('='.repeat(60));
  console.log(`\nQuestion: "${USER_QUESTION}"\n`);
  console.log('-'.repeat(60) + '\n');

  // Connect to Weaviate
  const client = await weaviate.connectToLocal();
  const articles = client.collections.get('Article');

  // 1. RETRIEVE
  const retrievedArticles = await retrieve(articles, USER_QUESTION);

  // 2. AUGMENT
  const prompt = augment(retrievedArticles, USER_QUESTION);

  // 3. GENERATE
  const answer = await generate(prompt);

  console.log('-'.repeat(60));
  console.log('\n✅ ANSWER:\n');
  console.log(answer);
  console.log('\n' + '='.repeat(60));

  client.close();
}

main().catch(console.error);
