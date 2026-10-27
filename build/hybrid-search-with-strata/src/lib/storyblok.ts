// 'draft' needs a preview token; a public token can only read 'published'.
export const version: 'draft' | 'published' =
	import.meta.env.STORYBLOK_VERSION === 'draft' ? 'draft' : 'published';
