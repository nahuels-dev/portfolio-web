import type { Locale } from '../../i18n/ui';

export type ServiceId =
  | 'websites'
  | 'ecommerce'
  | 'web-apps'
  | 'frontend'
  | 'ui-ux'
  | 'creative-coding'
  | 'mobile-apps'
  | 'emails';

export interface ServiceCopy {
  name: string;
  summary: string;
  title: string;
  description: string;
  heading: string;
  promise: string;
  intro: [string, string];
  audience: string[];
  deliverables: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  requirements: string[];
  scope: string;
  faqs: { question: string; answer: string }[];
  cta: string;
}

export interface Service {
  id: ServiceId;
  icon: string;
  slug: Record<Locale, string>;
  related: ServiceId[];
  copy: Record<Locale, ServiceCopy>;
}
