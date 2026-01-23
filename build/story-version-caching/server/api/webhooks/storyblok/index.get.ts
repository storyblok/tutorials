export default defineEventHandler(() => {
  console.log('GET /api/webhooks/storyblok called');

  return {
    ok: true,
    message: 'Webhook endpoint is up.',
  };
});
