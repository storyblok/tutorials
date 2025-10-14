import { storyblok } from '@storyblok/astro';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

const { STORYBLOK_DELIVERY_API_TOKEN } = loadEnv(
	import.meta.env.MODE,
	process.cwd(),
	'',
);

export default defineConfig({
	integrations: [
		storyblok({
			accessToken: STORYBLOK_DELIVERY_API_TOKEN,
			components: {
				article: 'storyblok/Article',
				article_overview: 'storyblok/ArticleOverview',
				feature: 'storyblok/Feature',
				grid: 'storyblok/Grid',
				InvalidHeadingWarning: 'components/A11yChecks/InvalidHeadingWarning',
				page: 'storyblok/Page',
				site_settings: 'storyblok/SiteSettings',
				teaser: 'storyblok/Teaser',
			},
		}),
	],
	output: 'server',
	vite: {
		plugins: [mkcert()],
	},
});
