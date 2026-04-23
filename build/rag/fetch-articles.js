/**
 * Fetch articles from DEV.to API and save them locally
 * This is a one-time script to prepare our demo data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STORYBLOK_ARTICLES_COUNT = 10;
const OTHER_ARTICLES_COUNT = 10;

async function fetchArticleDetails(articleId) {
  const response = await fetch(`https://dev.to/api/articles/${articleId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article ${articleId}`);
  }
  return response.json();
}

async function fetchArticlesList(params) {
  const url = new URL('https://dev.to/api/articles');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch articles list`);
  }
  return response.json();
}

async function main() {
  const articles = [];
  
  console.log('Fetching Storyblok articles...');
  const storyblokList = await fetchArticlesList({
    username: 'storyblok',
    per_page: STORYBLOK_ARTICLES_COUNT
  });
  
  for (const article of storyblokList) {
    console.log(`  Fetching: ${article.title}`);
    const details = await fetchArticleDetails(article.id);
    articles.push({
      id: details.id,
      title: details.title,
      description: details.description,
      body: details.body_markdown,
      url: details.url,
      published_at: details.published_at,
      tags: details.tag_list,
      reading_time_minutes: details.reading_time_minutes,
      author: details.user.name,
      organization: details.organization?.name || null
    });
    // Be nice to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\nFetching articles on related topics...');
  // Fetch articles about headless CMS, web development, etc.
  const topicsList = await fetchArticlesList({
    tag: 'webdev',
    per_page: OTHER_ARTICLES_COUNT,
    top: 30 // Top articles from last 30 days
  });
  
  for (const article of topicsList) {
    console.log(`  Fetching: ${article.title}`);
    const details = await fetchArticleDetails(article.id);
    articles.push({
      id: details.id,
      title: details.title,
      description: details.description,
      body: details.body_markdown,
      url: details.url,
      published_at: details.published_at,
      tags: details.tag_list,
      reading_time_minutes: details.reading_time_minutes,
      author: details.user.name,
      organization: details.organization?.name || null
    });
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Save to file
  const outputPath = path.join(__dirname, 'data', 'articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
  
  console.log(`\nSaved ${articles.length} articles to ${outputPath}`);
}

main().catch(console.error);
