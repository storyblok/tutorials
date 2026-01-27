export default defineEventHandler(() => {
	console.log('GET /api/webhooks/storyblok called');

	return {
		message: 'Webhook endpoint is up.',
		ok: true,
	};
});
