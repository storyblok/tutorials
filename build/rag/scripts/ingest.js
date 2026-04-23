/**
 * Ingest articles into Weaviate
 * 
 * This script:
 * 1. Connects to local Weaviate instance
 * 2. Creates the Article collection (schema)
 * 3. Imports articles with automatic vectorization
 */

import weaviate from 'weaviate-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Connect to local Weaviate
  console.log('Connecting to Weaviate...');
  const client = await weaviate.connectToLocal();
  
  // Check if collection exists and delete it (for clean re-runs)
  const collections = await client.collections.listAll();
  if (collections.some(c => c.name === 'Article')) {
    console.log('Deleting existing Article collection...');
    await client.collections.delete('Article');
  }

  // Create the Article collection
  console.log('Creating Article collection...');
  const articleCollection = await client.collections.create({
    name: 'Article',
    description: 'Blog articles for semantic search',
    
    // Properties define the structure of our data
    properties: [
      { name: 'title', dataType: 'text' },
      { name: 'description', dataType: 'text' },
      { name: 'body', dataType: 'text' },
      { name: 'url', dataType: 'text' },
      { name: 'author', dataType: 'text' },
      { name: 'organization', dataType: 'text' },
      { name: 'published_at', dataType: 'date' },
      { name: 'reading_time_minutes', dataType: 'int' },
      { name: 'tags', dataType: 'text[]' },
    ],
    
    // Use the local transformer for vectorization
    vectorizers: weaviate.configure.vectorizer.text2VecTransformers({
      // Only vectorize title and body (not URL, author, etc.)
      sourceProperties: ['title', 'body']
    }),
  });

  console.log('Collection created!\n');

  // Load articles from JSON
  const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  
  console.log(`Importing ${articles.length} articles...`);
  
  // Batch import articles
  const articleCol = client.collections.get('Article');
  
  // Prepare objects for batch insert
  const objects = articles.map(article => {
    // Tags come as comma-separated string from DEV.to, convert to array
    const tags = typeof article.tags === 'string' 
      ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
      : article.tags || [];
    
    return {
      properties: {
        title: article.title,
        description: article.description,
        body: article.body,
        url: article.url,
        author: article.author,
        organization: article.organization || '',
        published_at: new Date(article.published_at).toISOString(),
        reading_time_minutes: article.reading_time_minutes,
        tags,
      }
    };
  });

  // Insert in batch
  const result = await articleCol.data.insertMany(objects);
  
  if (result.hasErrors) {
    console.error('Some imports failed:');
    console.error('Errors:', JSON.stringify(result.errors, null, 2));
  } else {
    console.log('\nAll articles imported successfully!');
  }
  
  // Verify by counting
  const count = await articleCol.aggregate.overAll();
  console.log(`Total articles in Weaviate: ${count.totalCount}`);
  
  client.close();
}

main().catch(console.error);
