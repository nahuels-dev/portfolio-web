import type { Locale } from '../i18n/ui';
import type { Project } from './projects/types';
import { projectSchema } from '../content/schemas';
export type { Project } from './projects/types';

const modules = import.meta.glob<{ default: unknown }>('../content/projects/*.json', {
  eager: true,
});

export const projects = Object.values(modules)
  .map((module) => projectSchema.parse(module.default))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const slugs = new Set<string>();
const ids = new Set<string>();
for (const project of projects) {
  if (slugs.has(project.slug) || ids.has(project.id)) {
    throw new Error(`Duplicate project slug or order: ${project.slug} (${project.id})`);
  }
  slugs.add(project.slug);
  ids.add(project.id);
}

export const projectPath = (project: Pick<Project, 'slug'>, lang: Locale) =>
  `${lang === 'es' ? '/proyectos' : '/en/projects'}/${project.slug}/`;
