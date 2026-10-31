import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { getMediaImage } from '../media';
import { blogImagePath } from './schema';

const checked = new Map<string, Promise<void>>();

export async function validateBlogImage(path: string) {
  if (!blogImagePath.test(path)) throw new Error(`Unsupported blog image: ${path}`);
  if (!checked.has(path))
    checked.set(
      path,
      (async () => {
        const file = resolve('src/assets', `.${path}`);
        const info = await stat(file);
        if (!info.isFile() || info.size > 8 * 1024 * 1024)
          throw new Error(`Blog image exceeds 8 MiB: ${path}`);
        const metadata = await sharp(file, { limitInputPixels: 24_000_000 }).metadata();
        const expected = path.split('.').at(-1)!.toLowerCase();
        const format = expected === 'jpg' ? 'jpeg' : expected === 'avif' ? 'heif' : expected;
        if (
          metadata.format !== format ||
          (expected === 'avif' && metadata.compression !== 'av1') ||
          !metadata.width ||
          !metadata.height ||
          metadata.width > 8000 ||
          metadata.height > 8000 ||
          metadata.width * metadata.height > 24_000_000 ||
          (metadata.pages ?? 1) > 1
        )
          throw new Error(`Invalid blog image format or dimensions: ${path}`);
      })(),
    );
  await checked.get(path);
  return getMediaImage(path);
}
