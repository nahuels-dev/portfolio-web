import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const site = 'https://nahuel-s.dev';
const readEntries = (folder) =>
  !existsSync(new URL(`./src/content/${folder}/`, import.meta.url))
    ? []
    : readdirSync(new URL(`./src/content/${folder}/`, import.meta.url))
        .filter((file) => file.endsWith('.json'))
        .map((file) =>
          JSON.parse(
            readFileSync(new URL(`./src/content/${folder}/${file}`, import.meta.url), 'utf8'),
          ),
        );
const localizedRoutes = [
  ['/', '/en/'],
  ['/servicios/', '/en/services/'],
  ['/blog/', '/en/blog/'],
  ...readEntries('posts')
    .filter(({ draft, date }) => draft === false && date <= new Date().toISOString().slice(0, 10))
    .map(({ slug }) => [`/blog/${slug}/`, `/en/blog/${slug}/`]),
  ...readEntries('projects').map(({ slug }) => [`/proyectos/${slug}/`, `/en/projects/${slug}/`]),
  ...readEntries('services').map(({ slug }) => [
    `/servicios/${slug.es}/`,
    `/en/services/${slug.en}/`,
  ]),
];
const alternateLinks = new Map(
  localizedRoutes.flatMap(([es, en]) => {
    const links = [
      { lang: 'es', url: new URL(es, site).href },
      { lang: 'en', url: new URL(en, site).href },
      { lang: 'x-default', url: new URL(es, site).href },
    ];
    return [es, en].map((path) => [new URL(path, site).href, links]);
  }),
);

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !/\/(?:404(?:\.html)?\/?$|error\/|(?:admin|media)(?:\/|$))/.test(page),
      serialize: (item) => ({ ...item, links: alternateLinks.get(item.url) }),
    }),
  ],
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
    },
  },
  vite: {
    build: { assetsInlineLimit: 0 },
    css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } },
  },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
