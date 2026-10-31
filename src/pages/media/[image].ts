import type { APIRoute, GetStaticPaths } from 'astro';
import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const directory = resolve('src/assets/media');
const formats = /\.(avif|gif|jpe?g|png|svg|tiff|webp)$/i;

export const getStaticPaths: GetStaticPaths = () =>
  readdirSync(directory)
    .filter((file) => formats.test(file))
    .map((file) => ({ params: { image: file }, props: { file: join(directory, file) } }));

export const GET: APIRoute = async ({ props }) => {
  const file = props.file as string;
  const extension = file.split('.').at(-1)!.toLowerCase();
  const type = extension === 'jpg' ? 'jpeg' : extension === 'svg' ? 'svg+xml' : extension;
  const content = await readFile(file);
  return new Response(new Uint8Array(content), {
    headers: {
      'Content-Type': `image/${type}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
};
