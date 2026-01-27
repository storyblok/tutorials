import { createStoryVersionCachingService } from '../../caching/StoryVersionCachingService';
export default defineEventHandler(async (event) => {
	const slugParam = getRouterParam(event, 'slug') || '';
	const slug = Array.isArray(slugParam)
		? slugParam.join('/')
		: String(slugParam);

	const cacheService = createStoryVersionCachingService();
	const story = await cacheService.fetchBySlug(slug);

	if (!story) {
		throw createError({ statusCode: 404, statusMessage: 'Story not found' });
	}

	return story;
});
