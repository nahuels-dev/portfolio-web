import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nahuel-s.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !/\/(?:404(?:\.html)?\/?$|error\/)/.test(page) })],
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
  vite: { css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } } },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
