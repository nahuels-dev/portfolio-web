import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const site = 'https://nahuel-s.dev';
const readEntries = (folder) =>
  readdirSync(new URL(`./src/content/${folder}/`, import.meta.url))
    .filter((file) => file.endsWith('.json'))
    .map((file) =>
      JSON.parse(readFileSync(new URL(`./src/content/${folder}/${file}`, import.meta.url), 'utf8')),
    );
const localizedRoutes = [
  ['/', '/en/'],
  ['/servicios/', '/en/services/'],
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
      filter: (page) => !/\/(?:404(?:\.html)?\/?$|error\/|admin(?:\/|$))/.test(page),
      serialize: (item) => ({ ...item, links: alternateLinks.get(item.url) }),
    }),
  ],
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
  vite: { css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } } },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
