import { projectUI } from '../i18n/projects';
import { getUI, type Locale } from '../i18n/ui';

export interface NavigationItem {
  label: string;
  id: string;
  href?: string;
}

export const homeNavigation = (lang: Locale): NavigationItem[] => {
  const t = getUI(lang);
  const items: NavigationItem[] = t.nav.map((label, index) => ({ label, id: t.ids[index] }));
  items.splice(-1, 0, { label: 'Blog', id: 'blog', href: lang === 'es' ? '/blog/' : '/en/blog/' });
  return items;
};

export const serviceNavigation = (lang: Locale): NavigationItem[] =>
  (lang === 'es'
    ? ['Resumen', 'Qué incluye', 'Proceso', 'Preguntas', 'Servicios', 'Contacto']
    : ['Overview', 'Included', 'Process', 'Questions', 'Services', 'Contact']
  ).map((label, index) => ({
    label,
    id: ['inicio', 'incluye', 'proceso', 'preguntas', 'otros-servicios', 'contacto'][index],
  }));

export const serviceIndexNavigation = (lang: Locale): NavigationItem[] =>
  (lang === 'es'
    ? ['Inicio', 'Servicios', 'Orientación', 'Enfoque', 'Proyectos', 'Contacto']
    : ['Overview', 'Services', 'Guidance', 'Approach', 'Projects', 'Contact']
  ).map((label, index) => ({
    label,
    id: ['inicio', 'servicios', 'orientacion', 'enfoque', 'proyectos', 'contacto'][index],
  }));

export const projectNavigation = (lang: Locale): NavigationItem[] =>
  projectUI[lang].nav.map((label, index) => ({
    label,
    id: ['inicio', 'contexto', 'desarrollo', 'capturas', 'contacto'][index],
  }));
