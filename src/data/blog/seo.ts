import { profile } from '../site';
import { createStructuredData } from '../seo';
import type { Locale } from '../../i18n/ui';
import { blogUI } from '../../i18n/blog';
import { blogPath, postPath, type Post } from './posts';

export function blogStructuredData(site: URL, lang: Locale, post?: Post, image?: string) {
  const url = new URL(post ? postPath(post, lang) : blogPath(lang), site).href;
  const t = blogUI[lang];
  const home = new URL(lang === 'es' ? '/' : '/en/', site).href;
  const blogURL = new URL(blogPath(lang), site).href;
  const personId = `${site.href}#person`;
  const blogId = `${blogURL}#blog`;
  const blog = {
    '@type': 'Blog',
    '@id': blogId,
    url: blogURL,
    name: `${t.title} — ${profile.name}`,
    description: t.intro,
    inLanguage: lang,
    author: { '@id': personId },
    publisher: { '@id': personId },
    isPartOf: { '@id': `${site.href}#website` },
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...createStructuredData(site, lang)['@graph'].filter((node) =>
        ['Person', 'WebSite'].includes(node['@type']),
      ),
      blog,
      ...(post
        ? [
            {
              '@type': 'WebPage',
              '@id': `${url}#webpage`,
              url,
              name: post.copy[lang].title,
              description: post.copy[lang].description,
              inLanguage: lang,
              isPartOf: { '@id': blogId },
              mainEntity: { '@id': `${url}#article` },
              breadcrumb: { '@id': `${url}#breadcrumb` },
            },
            {
              '@type': 'BlogPosting',
              '@id': `${url}#article`,
              url,
              inLanguage: lang,
              headline: post.copy[lang].title,
              description: post.copy[lang].description,
              datePublished: post.date,
              dateModified: post.updated || post.date,
              image: image ? new URL(image, site).href : undefined,
              author: { '@type': 'Person', '@id': personId, name: profile.name, url: site.href },
              publisher: { '@id': personId },
              mainEntityOfPage: { '@id': `${url}#webpage` },
              isPartOf: { '@id': blogId },
              keywords: post.tags.join(', '),
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${url}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: t.home, item: home },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: blogURL },
                { '@type': 'ListItem', position: 3, name: post.copy[lang].title, item: url },
              ],
            },
          ]
        : []),
    ],
  };
}
