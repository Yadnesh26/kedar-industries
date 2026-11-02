// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kedarindustries.net',
  // Hitachi busbar and DC link busbar were the same product; both now live at /busbar/.
  redirects: {
    '/capacitor-parts/hitachi-busbar/': '/capacitor-parts/busbar/',
    '/capacitor-parts/dc-link-busbar/': '/capacitor-parts/busbar/',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap()]
});
