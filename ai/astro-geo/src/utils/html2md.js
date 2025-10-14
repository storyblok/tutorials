import { tables } from '@joplin/turndown-plugin-gfm';
import { richTextResolver } from '@storyblok/astro';
import TurndownService from 'turndown';

const teaserBlock = (blok) => {
	return `${blok.headline}`;
};

const mdResolver = richTextResolver({
	resolvers: {
		blok: (node) => {
			const componentBody = node.attrs?.body;
			if (!Array.isArray(componentBody)) return '';

			return componentBody
				.map((blok) => {
					if (blok.component === 'teaser') {
						return teaserBlock(blok);
					}

					// Handle any other block allowed inside the rich text field

					return '';
				})
				.join('');
		},
	},
});

export const convertedMarkdown = (richTextField) => {
	const content = mdResolver.render(richTextField);
	const turndownService = new TurndownService({
		bulletListMarker: '-',
		codeBlockStyle: 'fenced',
		emDelimiter: '*',
		fence: '```',
		headingStyle: 'atx',
	});
	turndownService.use(tables);

	const markdown = turndownService.turndown(content);
	return markdown;
};
