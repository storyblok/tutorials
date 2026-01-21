/**
 * Ingest articles into Weaviate
 *
 * This script loads sample articles and imports them into Weaviate.
 * Weaviate automatically generates embeddings using the configured
 * text2vec-transformers module.
 *
 * Run with: npm run ingest
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

  // Load articles from JSON file
  const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

  console.log(`Found ${articles.length} articles to import.\n`);

  // Get the Article collection
  const articleCollection = client.collections.get('Article');

  // Prepare objects for batch import
  const objects = articles.map((article) => {
    // Convert comma-separated tags to array if needed
    const tags =
      typeof article.tags === 'string'
        ? article.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
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
        tags,
      },
    };
  });

  // Batch import
  console.log('Importing articles (this may take a moment)...');
  const result = await articleCollection.data.insertMany(objects);

  if (result.hasErrors) {
    console.error('Some imports failed:');
    console.error(JSON.stringify(result.errors, null, 2));
  } else {
    console.log('All articles imported successfully!');
  }

  // Verify by counting
  const count = await articleCollection.aggregate.overAll();
  console.log(`\nTotal articles in Weaviate: ${count.totalCount}`);
  console.log('\nNext step: Run "npm run search" to try semantic search.');

  client.close();
}

main().catch(console.error);
