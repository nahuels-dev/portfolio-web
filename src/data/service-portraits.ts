import type { Locale } from '../i18n/ui';
import { services } from './services';
import { getMediaImage } from './media';

export const servicePortraits = Object.fromEntries(
  services.map((service) => [service.icon, getMediaImage(service.image)]),
);

export const servicePortraitAlt = (artwork: string, lang: Locale) =>
  services.find((service) => service.icon === artwork)?.imageAlt[lang] ?? '';
