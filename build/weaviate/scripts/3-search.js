/**
 * Semantic search examples with Weaviate
 *
 * This script demonstrates various search capabilities:
 * - Basic semantic search
 * - Conceptual search (finding content without keyword matches)
 * - Filtered search (combining vectors with metadata)
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
  console.log('='.repeat(60));
  console.log('Example 1: Basic Semantic Search');
  console.log('Query: "storyblok in the php ecosystem"');
  console.log('='.repeat(60));

  const result1 = await articles.query.nearText('storyblok in the php ecosystem', {
    limit: 3,
    returnMetadata: ['distance'],
  });

  for (const item of result1.objects) {
    console.log(`\n  ${item.properties.title}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 2: Conceptual search
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('Example 2: Conceptual Search');
  console.log('Query: "making websites work in multiple languages"');
  console.log('(Notice: finds i18n content without using "i18n" or "multilingual")');
  console.log('='.repeat(60));

  const result2 = await articles.query.nearText(
    'making websites work in multiple languages',
    {
      limit: 3,
      returnMetadata: ['distance'],
    }
  );

  for (const item of result2.objects) {
    console.log(`\n  ${item.properties.title}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 3: Search with organization filter
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('Example 3: Semantic Search + Organization Filter');
  console.log('Query: "frontend development tips"');
  console.log('Filter: only Storyblok articles');
  console.log('='.repeat(60));

  const result3 = await articles.query.nearText('frontend development tips', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter.byProperty('organization').equal('Storyblok'),
  });

  for (const item of result3.objects) {
    console.log(`\n  ${item.properties.title}`);
    console.log(`   Organization: ${item.properties.organization}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 4: Search with tag filter
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('Example 4: Semantic Search + Tag Filter');
  console.log('Query: "building user interfaces"');
  console.log('Filter: articles tagged with "react"');
  console.log('='.repeat(60));

  const result4 = await articles.query.nearText('building user interfaces', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter.byProperty('tags').containsAny(['react']),
  });

  for (const item of result4.objects) {
    console.log(`\n  ${item.properties.title}`);
    console.log(`   Tags: ${item.properties.tags?.join(', ')}`);
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  // ============================================
  // Example 5: Search with date filter
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('Example 5: Semantic Search + Date Filter');
  console.log('Query: "developer productivity"');
  console.log('Filter: articles from 2025');
  console.log('='.repeat(60));

  const result5 = await articles.query.nearText('developer productivity', {
    limit: 3,
    returnMetadata: ['distance'],
    filters: articles.filter
      .byProperty('published_at')
      .greaterOrEqual(new Date('2025-01-01')),
  });

  for (const item of result5.objects) {
    console.log(`\n  ${item.properties.title}`);
    console.log(
      `   Published: ${new Date(item.properties.published_at).toLocaleDateString()}`
    );
    console.log(`   Distance: ${item.metadata.distance.toFixed(4)}`);
  }

  client.close();
  console.log('\n\nDone! Experiment with your own queries by editing this file.');
}

main().catch(console.error);
