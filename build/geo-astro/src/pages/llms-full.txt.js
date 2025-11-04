import { storyblokApi } from '@storyblok/astro/client';
import { extractStoryMeta } from '../utils/extractStoryMeta';
import { convertedMarkdown } from '../utils/html2md';

export const GET = async () => {
	try {
		const stories = await storyblokApi.getAll('cdn/stories', {
			sort_by: 'name:asc', // You can do all sorts of sorting. Learn more here: https://www.storyblok.com/docs/api/content-delivery/v2/stories/examples/sorting-by-story-object-property
			version: 'draft',
		});
		const storyExtract = stories.map((story) =>
			extractStoryMeta(story, {
				content: convertedMarkdown(story.content.content),
			}),
		);
		const body = `# Feeding the bots with Storyblok

> A tutorial for developers interested in generating an \`llms-full.txt\` file using a combination of Storyblok and Astro.

This file contains the complete content of the tutorial, converted into markdown.

***

${storyExtract
	.map(
		(story) =>
			`## ${story.headline}

${story.content}

URL: [${story.headline}](https://example.com/${story.slug})

***\n`,
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
		return new Response(`Failed to generate llms-full.txt \n\n${error}`, {
			status: 500,
		});
	}
};
