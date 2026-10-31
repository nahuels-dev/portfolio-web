import { z } from 'zod';

const text = z.string().trim().min(1);
const date = z.iso.date();
const copy = z.object({
  title: text.max(120),
  description: text.max(300),
  body: text.max(100_000),
});

export const blogImagePath = /^\/media\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:avif|jpe?g|png|webp)$/i;

export const postSchema = z
  .object({
    slug: text.max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    date,
    updated: z.union([date, z.literal('')]).nullish(),
    draft: z.boolean().default(true),
    tags: z.array(text.max(32)).min(1).max(5),
    image: text.regex(blogImagePath),
    imageAlt: z.object({ es: text.max(200), en: text.max(200) }),
    copy: z.object({ es: copy, en: copy }),
  })
  .refine((post) => !post.updated || post.updated >= post.date, {
    path: ['updated'],
    message: 'Updated date must not precede publication date.',
  });

export type Post = z.infer<typeof postSchema>;
