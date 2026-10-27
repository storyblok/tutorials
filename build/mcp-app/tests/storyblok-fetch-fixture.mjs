// Redirect only Storyblok requests to the test's local upstream server.
// The production API client still constructs the URL and processes the response.
const originalFetch = globalThis.fetch;

globalThis.fetch = (input, options) => {
  const request = new Request(input, options);
  const url = new URL(request.url);
  if (!/^api(?:-us|-ca|-ap)?\.storyblok\.com$/.test(url.hostname)
    && url.hostname !== "app.storyblokchina.cn") {
    return originalFetch(input, options);
  }

  const redirected = new Request(process.env.STORYBLOK_TEST_UPSTREAM, request);
  redirected.headers.set("x-storyblok-test-url", request.url);
  return originalFetch(redirected);
};
