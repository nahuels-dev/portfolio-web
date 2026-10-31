import type { APIRoute } from 'astro';
import { blogFeed } from '../../../data/blog/feed';
export const GET: APIRoute = (context) => blogFeed(context.site!, 'en');
