/**
 * Create the Article collection in Weaviate
 *
 * This script sets up the schema for storing blog articles
 * with automatic vectorization of title and body content.
 *
 * Run with: npm run create-collection
 */

import weaviate from 'weaviate-client';

async function main() {
  // Connect to local Weaviate
  console.log('Connecting to Weaviate...');
  const client = await weaviate.connectToLocal();

  // Check if collection already exists
  const collections = await client.collections.listAll();
  if (collections.some((c) => c.name === 'Article')) {
    console.log('Article collection already exists. Deleting...');
    await client.collections.delete('Article');
  }

  // Create the Article collection
  console.log('Creating Article collection...');

  await client.collections.create({
    name: 'Article',
    description: 'Blog articles for semantic search',

    // Define the structure of our data
    properties: [
      { name: 'title', dataType: 'text' },
      { name: 'description', dataType: 'text' },
      { name: 'body', dataType: 'text' },
      { name: 'url', dataType: 'text' },
      { name: 'author', dataType: 'text' },
      { name: 'organization', dataType: 'text' },
      { name: 'published_at', dataType: 'date' },
      { name: 'tags', dataType: 'text[]' },
    ],

    // Configure automatic vectorization
    // Only title and body are embedded - not URLs, dates, etc.
    vectorizers: weaviate.configure.vectorizer.text2VecTransformers({
      sourceProperties: ['title', 'body'],
    }),
  });

  console.log('Article collection created successfully!');
  console.log('\nNext step: Run "npm run ingest" to import articles.');

  client.close();
}

main().catch(console.error);
