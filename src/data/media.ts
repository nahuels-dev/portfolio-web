import type { ImageMetadata } from 'astro';
import content from '../content/settings/media.json';
import { mediaSchema } from '../content/schemas';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/media/**/*.{avif,gif,jpeg,jpg,png,svg,tiff,webp,AVIF,GIF,JPEG,JPG,PNG,SVG,TIFF,WEBP}',
  { eager: true },
);

export const media = mediaSchema.parse(content);

export function getMediaImage(path: string): ImageMetadata {
  const image = images[`../assets${path}`]?.default;
  if (!image) throw new Error(`Missing media image: ${path}`);
  return image;
}
