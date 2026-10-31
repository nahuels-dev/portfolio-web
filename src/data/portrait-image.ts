import { getMediaImage, media } from './media';

export const heroPortrait = {
  src: getMediaImage(media.hero),
  widths: [320, 480, 512, 640, 768, 1100, 1254],
  sizes: '(max-width: 760px) 70vw, 51vw',
  quality: 50,
};

export const aboutPortrait = {
  ...heroPortrait,
  src: getMediaImage(media.about),
};

export const cyberPortrait = {
  ...heroPortrait,
  src: getMediaImage(media.heroReveal),
};
