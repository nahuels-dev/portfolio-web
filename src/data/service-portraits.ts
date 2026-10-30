import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n/ui';
import websites from '../assets/service-heroes/human/websites.png';
import ecommerce from '../assets/service-heroes/human/ecommerce.png';
import webApps from '../assets/service-heroes/human/web-apps.png';
import frontend from '../assets/service-heroes/human/frontend.png';
import uiUx from '../assets/service-heroes/human/ui-ux.png';
import creativeCoding from '../assets/service-heroes/human/creative-coding.png';
import mobileApps from '../assets/service-heroes/human/mobile-apps.png';
import emails from '../assets/service-heroes/human/emails.png';

export const servicePortraits: Partial<Record<string, ImageMetadata>> = {
  globe: websites,
  cart: ecommerce,
  grid: webApps,
  layers: frontend,
  pen: uiUx,
  spark: creativeCoding,
  phone: mobileApps,
  mail: emails,
};

const subjects: Record<string, Record<Locale, string>> = {
  globe: { es: 'páginas web', en: 'websites' },
  cart: { es: 'tiendas online', en: 'online stores' },
  grid: { es: 'aplicaciones web', en: 'web applications' },
  layers: { es: 'interfaces frontend', en: 'frontend interfaces' },
  pen: { es: 'prototipos UI/UX', en: 'UI/UX prototypes' },
  spark: { es: 'animaciones', en: 'animations' },
  phone: { es: 'aplicaciones móviles', en: 'mobile apps' },
  mail: { es: 'emails', en: 'emails' },
};

export const servicePortraitAlt = (artwork: string, lang: Locale) =>
  servicePortraits[artwork]
    ? lang === 'es'
      ? `Nahuel Silva desarrollando ${subjects[artwork].es} con una MacBook en su espacio de trabajo.`
      : `Nahuel Silva developing ${subjects[artwork].en} on a MacBook in his workspace.`
    : '';
