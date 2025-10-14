import { storyblokApi } from '@storyblok/astro/client';
import { extractStoryMeta } from '../utils/extractStoryMeta';

export const GET = async () => {
	try {
		const stories = await storyblokApi.getAll('cdn/stories', {
			sort_by: 'name:asc', // You can do all sorts of sorting. Learn more here: https://www.storyblok.com/docs/api/content-delivery/v2/stories/examples/sorting-by-story-object-property
			version: 'draft',
		});

		// Filters all stories not in folders, such as Home and About
		const mainStories = stories.filter((story) => !story.parent_id);

		// Filters all stories in folders, such as articles/ or posts/
		const childStories = stories.filter((story) => story.parent_id);

		const mainExtract = mainStories.map((story) => extractStoryMeta(story));
		const childExtract = childStories.map((story) =>
			extractStoryMeta(story, {
				folder: story.full_slug
					.split('/')[0]
					.replace(/^./, (firstLetter) => firstLetter.toUpperCase()),
			}),
		);
		const body = `# Feeding the bots with Storyblok

> A tutorial for developers interested in generating an \`llms.txt\` file using a combination of Storyblok and Astro.

This file contains a list of links to all relevant sections of the tutorial, serving as sitemap for LLMs.

***

${mainExtract
	.map(
		(story) =>
			`- [${story.headline}](https://example.com/${story.slug}): ${story.summary}`,
	)
	.join('\n')}
${childExtract
	.map(
		(story) =>
			`\n## ${story.folder}\n\n- [${story.headline}](https://example.com/${story.slug}): ${story.summary}`,
	)
	.join('\n')}

## Optional

- [Homepage](https://example.com)
`;
		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	} catch (error) {
		return new Response(`Failed to generate llms.txt \n\n${error}`, {
			status: 500,
		});
	}
};
