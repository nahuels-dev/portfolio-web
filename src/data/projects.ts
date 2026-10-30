import type { Locale } from '../i18n/ui';
import type { Project } from './projects/types';
export type { Project } from './projects/types';

const modules = import.meta.glob<{ default: Project }>(
  ['./projects/*.ts', '!./projects/types.ts', '!./projects/_*.ts'],
  { eager: true },
);

export const projects = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const slugs = new Set<string>();
for (const project of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) {
    throw new Error(`Invalid or duplicate project slug: ${project.slug}`);
  }
  slugs.add(project.slug);
}

export const projectPath = (project: Pick<Project, 'slug'>, lang: Locale) =>
  `${lang === 'es' ? '/proyectos' : '/en/projects'}/${project.slug}/`;
