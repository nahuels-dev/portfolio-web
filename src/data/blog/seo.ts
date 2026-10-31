import { profile } from '../site';
import type { Locale } from '../../i18n/ui';
import { blogUI } from '../../i18n/blog';
import { blogPath, postPath, type Post } from './posts';

export function blogStructuredData(site: URL, lang: Locale, post?: Post, image?: string) {
  const url = new URL(post ? postPath(post, lang) : blogPath(lang), site).href;
  const author = { '@type': 'Person', name: profile.name, url: site.href };
  return {
    '@context': 'https://schema.org',
    '@type': post ? 'BlogPosting' : 'Blog',
    '@id': `${url}#${post ? 'article' : 'blog'}`,
    url,
    inLanguage: lang,
    author,
    ...(post
      ? {
          headline: post.copy[lang].title,
          description: post.copy[lang].description,
          datePublished: post.date,
          dateModified: post.updated || post.date,
          image: image ? new URL(image, site).href : undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          isPartOf: { '@type': 'Blog', url: new URL(blogPath(lang), site).href },
          keywords: post.tags.join(', '),
        }
      : { name: `${blogUI[lang].title} — ${profile.name}`, description: blogUI[lang].intro }),
  };
}
