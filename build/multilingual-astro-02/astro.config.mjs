import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

const env = loadEnv(import.meta.env.MODE, process.cwd(), '');
const { STORYBLOK_DELIVERY_API_TOKEN } = env;

export default defineConfig({
	integrations: [
		storyblok({
			accessToken: STORYBLOK_DELIVERY_API_TOKEN,
			apiOptions: {
				/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
				region: 'eu',
			},
			components: {
				page: 'storyblok/Page',
				grid: 'storyblok/Grid',
				feature: 'storyblok/Feature',
				teaser: 'storyblok/Teaser',
				banner: 'storyblok/Banner',
				button: 'storyblok/Button',
				image_text: 'storyblok/ImageText',
			},
		}),
	],
	site: 'https://your-site.com', // Replace with your actual site URL
	output: 'server',
	vite: {
		plugins: [mkcert()],
	},
});
