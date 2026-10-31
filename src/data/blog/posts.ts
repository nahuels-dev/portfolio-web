import { postSchema, type Post } from './schema';
import type { Locale } from '../../i18n/ui';

const entries = import.meta.glob<{ default: unknown }>('../../content/posts/*.json', {
  eager: true,
});

export const posts = Object.values(entries)
  .map((entry) => postSchema.parse(entry.default))
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

if (new Set(posts.map((post) => post.slug)).size !== posts.length)
  throw new Error('Post slugs must be unique.');

export const isPublished = (post: Post) =>
  !post.draft && post.date <= new Date().toISOString().slice(0, 10);

export const publishedPosts = posts.filter(isPublished);
export const visiblePosts = import.meta.env.DEV ? posts : publishedPosts;
export const blogPath = (lang: Locale) => (lang === 'es' ? '/blog/' : '/en/blog/');
export const postPath = (post: Post, lang: Locale) => `${blogPath(lang)}${post.slug}/`;
export const formatPostDate = (date: string, lang: Locale) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-UY' : 'en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
export const readingMinutes = (post: Post, lang: Locale) =>
  Math.max(1, Math.ceil(post.copy[lang].body.split(/\s+/).length / 200));
export type { Post } from './schema';
