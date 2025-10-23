// @ts-check
import { storyblok } from '@storyblok/astro';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || '', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
      enableFallbackComponent: true,
    }),
    react(),
  ],
  output: 'server',
});
