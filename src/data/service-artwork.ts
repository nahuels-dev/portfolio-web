import type { ImageMetadata } from 'astro';
import websites from '../assets/services/websites.png';
import ecommerce from '../assets/services/ecommerce.png';
import webApps from '../assets/services/web-apps.png';
import frontend from '../assets/services/frontend.png';
import uiUx from '../assets/services/ui-ux.png';
import creativeCoding from '../assets/services/creative-coding.png';
import mobileApps from '../assets/services/mobile-apps.png';
import emails from '../assets/services/emails.png';

export const serviceArtwork: Record<string, ImageMetadata> = {
  globe: websites,
  cart: ecommerce,
  grid: webApps,
  layers: frontend,
  pen: uiUx,
  spark: creativeCoding,
  phone: mobileApps,
  mail: emails,
};
