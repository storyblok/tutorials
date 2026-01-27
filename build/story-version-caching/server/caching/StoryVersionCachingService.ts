/**
 * This fetch wrapper reads a cached `cv` for a slug.
 * Then, it calls Storyblok with that `cv`, falls back to a normal fetch,
 * and stores the returned `cv`.
 */

import { createStoryblokClient } from './StoryblokClient';
import { createSupabaseClient } from './SupabaseClient';

const DEFAULT_CACHE_PREFIX = 'storyblok:slug:';

interface StoryblokResponse<T = unknown> {
	story?: T;
	cv?: number;
}

export class StoryVersionCachingService<TContent = unknown> {
	private readonly cacheKeyPrefix: string;

	constructor(
		private readonly cache: SupabaseClient<TContent>,
		private readonly contentClient: StoryblokClient<TContent>,
	) {
		this.cacheKeyPrefix = DEFAULT_CACHE_PREFIX;
	}

	fetchBySlug = async (slug: string): Promise<TContent | null> => {
		console.log('Fetching content for slug:', slug);

		const cacheKey = this.buildCacheKey(slug);
		console.log('Cache key for slug:', cacheKey);

		// Check if we have a cached CV for this slug
		const cachedCv = await this.cache.get<number>(cacheKey);
		console.log('Cached CV for slug:', cachedCv);

		let result: StoryblokResponse<TContent> | null = null;

		if (cachedCv !== null) {
			console.log('Using cached CV:', cachedCv);
			result = (await this.contentClient.fetchBySlug(
				slug,
				cachedCv,
			)) as StoryblokResponse<TContent> | null;
		}

		if (result?.story) {
			console.log('Story found using cached CV:', slug, cachedCv);
			return result?.story;
		} else {
			console.log('No story found for slug using cached cv:', slug, cachedCv);
			result = (await this.contentClient.fetchBySlug(
				slug,
			)) as StoryblokResponse<TContent> | null;
			console.log('Story fetched without cached CV:', result?.story);
		}

		if (!result?.story) {
			console.log('No story found for slug:', slug);
			return null;
		}

		const upToDateCV = result.cv;

		if (!upToDateCV) {
			console.log('Story missing CV');
			return result?.story;
		}

		// Update cache
		await this.cache.set(cacheKey, upToDateCV);

		return result?.story;
	};

	buildCacheKey(slug: string): string {
		return `${this.cacheKeyPrefix}${slug.replace(/^\/+/, '')}`;
	}
}

let _cachingService: StoryVersionCachingService | null = null;

export function createStoryVersionCachingService<
	TContent = unknown,
>(): StoryVersionCachingService<TContent> {
	if (!_cachingService) {
		const cache = createSupabaseClient();
		const contentClient = createStoryblokClient();
		_cachingService = new StoryVersionCachingService<TContent>(
			cache,
			contentClient,
		);
	}

	return _cachingService as StoryVersionCachingService<TContent>;
}
