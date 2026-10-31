import { services } from './services';
import { getMediaImage } from './media';

export const serviceArtwork = Object.fromEntries(
  services.map((service) => [service.icon, getMediaImage(service.cardImage)]),
);
