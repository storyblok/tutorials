/**
 * Semantic search examples with Weaviate
 * 
 * Run with: npm run search
 */

import weaviate from 'weaviate-client';

async function main() {
  console.log('Connecting to Weaviate...\n');
  const client = await weaviate.connectToLocal();
  const articles = client.collections.get('Article');

  // ============================================
  // Example 1: Basic semantic search
  // ============================================
  console.log('=' .repeat(60));
  console.log('Example 1: Basic Semantic Search');
  console.log('Query: "how to build modern web applications"');
  console.log('=' .repeat(60));

  const result1 = await articles.query.nearText('how to build modern web applications', {
    limit: 3,
    returnMetadata: ['distance']
  });

  for (const item of result1.objects) {
    console.log(`\n📄 ${item.properties.title}`);
    console.log(`   Author: ${item.properties.author}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
    console.log(`   Tags: ${item.properties.tags?.join(', ') || 'none'}`);
  }

  // ============================================
  // Example 2: Conceptual search (no exact keywords)
  // ============================================
  console.log('\n\n' + '=' .repeat(60));
  console.log('Example 2: Conceptual Search (no keyword matches)');
  console.log('Query: "making websites work in multiple languages"');
  console.log('=' .repeat(60));

  const result2 = await articles.query.nearText('making websites work in multiple languages', {
    limit: 3,
    returnMetadata: ['distance']
  });

  for (const item of result2.objects) {
    console.log(`\n📄 ${item.properties.title}`);
    console.log(`   Author: ${item.properties.author}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 3: Search with filtering by organization
  // ============================================
  console.log('\n\n' + '=' .repeat(60));
  console.log('Example 3: Semantic Search + Filter');
  console.log('Query: "frontend development tips"');
  console.log('Filter: only Storyblok articles');
  console.log('=' .repeat(60));

  const result3 = await articles.query.nearText('frontend development tips', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter.byProperty('organization').equal('Storyblok')
  });

  for (const item of result3.objects) {
    console.log(`\n📄 ${item.properties.title}`);
    console.log(`   Organization: ${item.properties.organization}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 4: Filter by tag
  // ============================================
  console.log('\n\n' + '=' .repeat(60));
  console.log('Example 4: Semantic Search + Tag Filter');
  console.log('Query: "building user interfaces"');
  console.log('Filter: articles tagged with "react"');
  console.log('=' .repeat(60));

  const result4 = await articles.query.nearText('building user interfaces', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter.byProperty('tags').containsAny(['react'])
  });

  for (const item of result4.objects) {
    console.log(`\n📄 ${item.properties.title}`);
    console.log(`   Tags: ${item.properties.tags?.join(', ')}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 5: Date range filter
  // ============================================
  console.log('\n\n' + '=' .repeat(60));
  console.log('Example 5: Semantic Search + Date Filter');
  console.log('Query: "developer productivity"');
  console.log('Filter: articles from 2025');
  console.log('=' .repeat(60));

  const result5 = await articles.query.nearText('developer productivity', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter.byProperty('published_at').greaterOrEqual(new Date('2025-01-01'))
  });

  for (const item of result5.objects) {
    console.log(`\n📄 ${item.properties.title}`);
    console.log(`   Published: ${new Date(item.properties.published_at).toLocaleDateString()}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  client.close();
  console.log('\n\nDone!');
}

main().catch(console.error);
