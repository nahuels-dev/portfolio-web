import type { Locale } from '../i18n/ui';
import type { Service, ServiceId } from './services/types';
import { serviceIds, serviceSchema } from '../content/schemas';

export type { Service, ServiceCopy, ServiceId } from './services/types';

const modules = import.meta.glob<{ default: unknown }>('../content/services/*.json', {
  eager: true,
});
const entries = Object.values(modules).map((module) => serviceSchema.parse(module.default));

export const services: Service[] = serviceIds.map((id) => {
  const matches = entries.filter((service) => service.id === id);
  if (matches.length !== 1) throw new Error(`Missing or duplicate service: ${id}`);
  return matches[0];
});

for (const lang of ['es', 'en'] as const) {
  const slugs = services.map((service) => service.slug[lang]);
  if (new Set(slugs).size !== slugs.length) throw new Error(`Duplicate service slug: ${lang}`);
}

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
