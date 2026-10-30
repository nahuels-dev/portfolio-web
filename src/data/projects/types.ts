import type { Locale } from '../../i18n/ui';

export type Localized<T = string> = Record<Locale, T>;
export interface ProjectSection {
  title: string;
  text: string;
}
export interface Project {
  id: string;
  slug: string;
  name: string;
  category: Localized;
  description: Localized;
  tech: string[];
  image: string;
  imageSrcSet?: string;
  href?: string;
  repository?: string;
  label: string;
  role: Localized;
  copy: Localized<{
    intro: string;
    overview: string;
    challenge: string;
    solution: string;
    features: ProjectSection[];
  }>;
  gallery?: { src: string; alt: Localized; caption: Localized }[];
}

export const defineProject = (project: Project): Project => project;
