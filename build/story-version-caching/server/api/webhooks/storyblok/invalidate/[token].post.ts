import { createSupabaseClient } from '../../../../caching/SupabaseClient';
import { createStoryVersionCachingService } from '../../../../caching/StoryVersionCachingService';

export default defineEventHandler(async (event) => {
  try {
    console.log('Received Storyblok webhook event');

    // Validate the webhook token from URL
    const token = getRouterParam(event, 'token');
    const config = useRuntimeConfig();
    const expectedToken = config.storyblokWebhookToken;

    if (!expectedToken) {
      console.error('STORYBLOK_WEBHOOK_TOKEN not configured');
      throw createError({ statusCode: 500, statusMessage: 'Webhook token not configured' });
    }

    if (token !== expectedToken) {
      console.error('Invalid webhook token');
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // Parse the webhook payload from Storyblok
    const body = await readBody(event);
    console.log('Webhook payload:', body);

    // Validate that we have the necessary data (basic payload validation)
    if (!body || typeof body !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid payload format' });
    }

    if (!body.full_slug) {
      return {
        statusCode: 400,
        body: { error: 'Missing full_slug in webhook payload' },
      };
    }

    const slug = body.full_slug;

    // Log the webhook event for debugging
    console.log(`Storyblok webhook received: publish event for story slug ${slug}`);

    // Initialize clients and build cache key using slug
    const supabaseClient = createSupabaseClient();
    const cachingService = createStoryVersionCachingService();
    const cacheKey = cachingService.buildCacheKey(slug);

    const wasRemoved = await supabaseClient.remove(cacheKey);

    if (wasRemoved) {
      console.log(`Successfully removed story ${slug} from cache`);
    }
    else {
      console.log(`Story ${slug} was not in cache (nothing to remove)`);
    }

    return {
      statusCode: 200,
      body: {
        success: true,
        message: wasRemoved
          ? `Story ${slug} removed from cache`
          : `Story ${slug} was not cached`,
      },
    };
  }
  catch (error) {
    console.error('Error processing Storyblok webhook:', error);

    return {
      statusCode: 500,
      body: {
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
});
