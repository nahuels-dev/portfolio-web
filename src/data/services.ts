import type { Locale } from '../i18n/ui';
import type { Service, ServiceId } from './services/types';
import { websites } from './services/websites';
import { ecommerce } from './services/ecommerce';
import { webApps } from './services/web-apps';
import { frontend } from './services/frontend';
import { uiUx } from './services/ui-ux';
import { creativeCoding } from './services/creative-coding';
import { mobileApps } from './services/mobile-apps';
import { emails } from './services/emails';

export type { Service, ServiceCopy, ServiceId } from './services/types';

export const services: Service[] = [
  websites,
  ecommerce,
  webApps,
  frontend,
  uiUx,
  creativeCoding,
  mobileApps,
  emails,
];

export const servicePath = (service: Service, lang: Locale) =>
  `${lang === 'es' ? '/servicios/' : '/en/services/'}${service.slug[lang]}/`;

export const serviceIndexPath = (lang: Locale) => (lang === 'es' ? '/servicios/' : '/en/services/');

export const getServiceCards = (lang: Locale) =>
  services.map((service) => ({
    icon: service.icon,
    title: service.copy[lang].name,
    text: service.copy[lang].summary,
    href: servicePath(service, lang),
  }));

export function getService(id: ServiceId): Service {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}
