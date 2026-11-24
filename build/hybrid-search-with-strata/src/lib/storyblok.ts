import {
	createApiClient,
	type ContentApiClientConfig,
} from '@storyblok/api-client';
import { defineStoryblokBlocks } from '@storyblok/astro';
import Page from '../storyblok/Page.astro';
import Grid from '../storyblok/Grid.astro';
import Feature from '../storyblok/Feature.astro';
import Teaser from '../storyblok/Teaser.astro';
import TextSection from '../storyblok/TextSection.astro';
import Product from '../storyblok/Product.astro';
import Location from '../storyblok/Location.astro';

const {
	STORYBLOK_DELIVERY_API_TOKEN,
	STORYBLOK_REGION,
	STORYBLOK_API_BASE_URL,
	STORYBLOK_VERSION,
} = import.meta.env;

// 'draft' needs a preview token; a public token can only read 'published'.
export const version: 'draft' | 'published' =
	STORYBLOK_VERSION === 'draft' ? 'draft' : 'published';

export const apiClient = createApiClient({
	accessToken: STORYBLOK_DELIVERY_API_TOKEN,
	/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/libraries/js/content-delivery-api-client */
	region: (STORYBLOK_REGION || 'eu') as ContentApiClientConfig['region'],
	/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
	baseUrl: STORYBLOK_API_BASE_URL
		? new URL(STORYBLOK_API_BASE_URL).origin
		: undefined,
	throwOnError: true,
});

export const { StoryblokBlock, StoryblokRichText } = defineStoryblokBlocks(
	() => ({
		components: {
			page: Page,
			grid: Grid,
			feature: Feature,
			teaser: Teaser,
			text_section: TextSection,
			product: Product,
			location: Location,
		},
	}),
);

type ListStoriesQuery = NonNullable<
	NonNullable<Parameters<typeof apiClient.stories.list>[0]>['query']
>;

/**
 * Fetches every page of a story listing, like `getAll()` in the previous SDK.
 */
export async function getAllStories(
	query: Omit<ListStoriesQuery, 'page' | 'per_page'> = {},
) {
	const perPage = 100;
	const fetchPage = (page: number) =>
		apiClient.stories.list({ query: { ...query, per_page: perPage, page } });

	const firstPage = await fetchPage(1);
	const total = Number(firstPage.response.headers.get('total'));
	const pageCount = total > perPage ? Math.ceil(total / perPage) : 1;
	const remainingPages = await Promise.all(
		Array.from({ length: pageCount - 1 }, (_, index) => fetchPage(index + 2)),
	);

	return [firstPage, ...remainingPages].flatMap(({ data }) => data.stories);
}
