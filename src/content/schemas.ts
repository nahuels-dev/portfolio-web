import { z } from 'zod';

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const asset = text.regex(/^\/(?!\/)[^\s?#]+$/);
const mediaAsset = text.regex(/^\/media\/[^\s?#]+\.(?:avif|gif|jpe?g|png|svg|tiff|webp)$/i);
const url = z.url({ protocol: /^https?$/ });
const optionalUrl = z.union([url, z.literal('')]).optional();
const localized = <T extends z.ZodType>(schema: T) => z.object({ es: schema, en: schema });
const section = z.object({ title: text, text });
const faq = z.object({ question: text, answer: text });
const projectCopy = z.object({
  intro: text,
  overview: text,
  challenge: text,
  solution: text,
  features: z.array(section).min(1),
});

export const projectSchema = z.object({
  id: text.regex(/^\d+$/),
  slug,
  name: text,
  category: localized(text),
  description: localized(text),
  tech: z.array(text).min(1),
  image: mediaAsset,
  href: optionalUrl,
  repository: optionalUrl,
  label: text,
  role: localized(text),
  copy: localized(projectCopy),
  gallery: z
    .array(z.object({ src: mediaAsset, alt: localized(text), caption: localized(text) }))
    .optional(),
});

export const serviceIds = [
  'websites',
  'ecommerce',
  'web-apps',
  'frontend',
  'ui-ux',
  'creative-coding',
  'mobile-apps',
  'emails',
] as const;

export const serviceCopySchema = z.object({
  name: text,
  summary: text,
  title: text,
  description: text,
  heading: text,
  promise: text,
  intro: z.tuple([text, text]),
  audience: z.array(text).min(1),
  deliverables: z.array(section).min(1),
  steps: z.array(section).min(1),
  requirements: z.array(text).min(1),
  scope: text,
  faqs: z.array(faq).min(1),
  cta: text,
});

export const serviceSchema = z.object({
  id: z.enum(serviceIds),
  icon: text,
  slug: localized(slug),
  related: z.array(z.enum(serviceIds)),
  image: mediaAsset,
  imageAlt: localized(text),
  cardImage: mediaAsset,
  copy: localized(serviceCopySchema),
});

export const homeSchema = z.object({
  title: text,
  description: text,
  available: text,
  eyebrow: text,
  micro: text,
  role: z.array(text).length(2),
  intro: text,
  skills: z.array(text).min(1),
  heroNote: z.array(text).length(3),
  noteSteps: text,
  heroQuote: text,
  quoteBy: text,
  aboutTitle: z.array(text).length(3),
  aboutText: text,
  aboutText2: text,
  aboutText3: text,
  buildWords: z.array(text).length(4),
  servicesIntro: text,
  faqList: z.array(faq).min(1),
  ctaLabel: text,
  ctaTitle: z.array(text).length(2),
  ctaText: text,
  location: text,
});

export const profileSchema = z.object({
  name: text,
  email: z.email(),
  github: url,
  linkedin: url,
  codepen: url,
  cv: asset,
});

export const mediaSchema = z.object({
  hero: mediaAsset,
  heroAlt: localized(text),
  heroReveal: mediaAsset,
  about: mediaAsset,
  contact: mediaAsset,
  contactModal: mediaAsset,
  posters: z.object({
    questions: mediaAsset,
    principles: mediaAsset,
    services: mediaAsset,
  }),
});
