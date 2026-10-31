import { getMediaImage, media } from './media';

export const posterImages = {
  questions: getMediaImage(media.posters.questions),
  principles: getMediaImage(media.posters.principles),
  services: getMediaImage(media.posters.services),
};

export type PosterVariant = keyof typeof posterImages;

export const contactModalImage = getMediaImage(media.contactModal);
export const contactImage = getMediaImage(media.contact);
