const DEFAULT_BASE_URL = 'https://api.storyblok.com/v2/cdn';

export interface StoryblokResponse<TStory> {
  story?: TStory;
  cv?: number;
}

export class StoryblokClient<TContent = unknown> {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor() {
    const config = useRuntimeConfig();
    this.token = config.public.storyblokToken;
    this.baseUrl = DEFAULT_BASE_URL;
    this.fetcher = globalThis.fetch.bind(globalThis);
  }

  async fetchBySlug(slug: string, cv?: number): Promise<StoryblokResponse<TContent> | null> {
    const normalizedSlug = this.normalizeSlug(slug);
    const url = `${this.baseUrl}/stories/${normalizedSlug}?${this.createQuery(cv)}`;

    console.log('Storyblok request URL:', url);

    const response = await this.fetcher(url, { headers: { Accept: 'application/json' } });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Storyblok request failed (${response.status}): ${body}`);
    }

    return (await response.json()) as StoryblokResponse<TContent>;
  }

  private createQuery(cv?: number): string {
    const params = new URLSearchParams();

    if (cv) {
      params.set('cv', cv.toString());
    }

    params.set('token', this.token);
    params.set('version', 'published');

    return params.toString();
  }

  private normalizeSlug(value: string): string {
    return encodeURIComponent(value.replace(/^\/+/, ''));
  }
}

let _storyblokClient: StoryblokClient | null = null;

export function createStoryblokClient(): StoryblokClient {
  if (!_storyblokClient) {
    _storyblokClient = new StoryblokClient();
  }
  return _storyblokClient;
}
