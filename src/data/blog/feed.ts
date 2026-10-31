import rss from '@astrojs/rss';
import { publishedPosts, postPath, blogPath } from './posts';
import { blogUI } from '../../i18n/blog';
import type { Locale } from '../../i18n/ui';

export function blogFeed(site: URL, lang: Locale) {
  return rss({
    title: 'Blog — Nahuel Silva',
    description: blogUI[lang].intro,
    site: new URL(blogPath(lang), site),
    items: publishedPosts.map((post) => ({
      title: post.copy[lang].title,
      description: post.copy[lang].description,
      pubDate: new Date(`${post.date}T00:00:00Z`),
      link: postPath(post, lang),
      categories: post.tags,
    })),
    customData: `<language>${lang}</language>`,
  });
}
