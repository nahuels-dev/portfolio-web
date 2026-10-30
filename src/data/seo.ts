import { profile } from './site';
import { getUI, type Locale } from '../i18n/ui';
import { services, servicePath, serviceIndexPath, type Service } from './services';
import { serviceUI } from '../i18n/services';
import { projectPath, type Project } from './projects';

export function createStructuredData(site: URL, lang: Locale) {
  const t = getUI(lang);
  const home = new URL('/', site).href;
  const page = new URL(lang === 'es' ? '/' : '/en/', site).href;
  const personId = `${home}#person`;
  const websiteId = `${home}#website`;
  const serviceId = `${page}#web-development`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        url: home,
        jobTitle: lang === 'es' ? 'Desarrollador web frontend' : 'Frontend web developer',
        homeLocation: { '@type': 'Country', name: 'Uruguay' },
        sameAs: [profile.github, profile.linkedin, profile.codepen],
        knowsLanguage: ['es', 'en'],
        email: profile.email,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: profile.name,
        url: home,
        inLanguage: ['es', 'en'],
        publisher: { '@id': personId },
      },
      {
        '@type': 'WebPage',
        '@id': `${page}#webpage`,
        url: page,
        name: t.title,
        description: t.description,
        inLanguage: lang,
        isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        mainEntity: { '@id': serviceId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: new URL('/images/og-cover.jpg', site).href,
          width: 1200,
          height: 630,
        },
      },
      {
        '@type': 'Service',
        '@id': serviceId,
        name: t.services,
        description: t.servicesIntro,
        url: `${page}#servicios`,
        serviceType: lang === 'es' ? 'Diseño y desarrollo web' : 'Web design and development',
        provider: { '@id': personId },
        areaServed: { '@type': 'Country', name: 'Uruguay' },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${page}#contacto`,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t.services,
          itemListElement: t.servicesList.map(({ title, text, href }) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: title,
              description: text,
              url: new URL(href, site).href,
              provider: { '@id': personId },
            },
          })),
        },
      },
    ],
  };
}

export function createProjectStructuredData(site: URL, lang: Locale, project: Project) {
  const url = new URL(projectPath(project, lang), site).href;
  const home = new URL(lang === 'es' ? '/' : '/en/', site).href;
  const personId = `${new URL('/', site).href}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...createStructuredData(site, lang)['@graph'].filter((node) =>
        ['Person', 'WebSite'].includes(node['@type']),
      ),
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${project.name} | Nahuel Silva`,
        description: project.description[lang],
        inLanguage: lang,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#project` },
        isPartOf: { '@id': `${new URL('/', site).href}#website` },
      },
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name: project.name,
        description: project.description[lang],
        url,
        inLanguage: lang,
        image: new URL(project.image, site).href,
        author: { '@id': personId },
        keywords: project.tech.join(', '),
        ...(project.href ? { sameAs: project.href } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: home },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'es' ? 'Proyectos' : 'Projects',
            item: `${home}#proyectos`,
          },
          { '@type': 'ListItem', position: 3, name: project.name, item: url },
        ],
      },
    ],
  };
}

export function createServiceStructuredData(site: URL, lang: Locale, service?: Service) {
  const home = new URL(lang === 'es' ? '/' : '/en/', site).href;
  const index = new URL(serviceIndexPath(lang), site).href;
  const url = service ? new URL(servicePath(service, lang), site).href : index;
  const personId = `${new URL('/', site).href}#person`;
  const websiteId = `${new URL('/', site).href}#website`;
  const copy = service?.copy[lang];
  const serviceNode = (item: Service) => ({
    '@type': 'Service',
    '@id': `${new URL(servicePath(item, lang), site).href}#service`,
    url: new URL(servicePath(item, lang), site).href,
    name: item.copy[lang].name,
    description: item.copy[lang].description,
    serviceType: item.copy[lang].name,
    provider: { '@id': personId },
    areaServed: { '@type': 'Country', name: 'Uruguay' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${new URL(servicePath(item, lang), site).href}#contacto`,
    },
  });
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...createStructuredData(site, lang)['@graph'].filter((node) =>
        ['Person', 'WebSite'].includes(node['@type']),
      ),
      {
        '@type': service ? 'WebPage' : 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: copy?.title ?? serviceUI[lang].indexTitle,
        description: copy?.description ?? serviceUI[lang].indexDescription,
        inLanguage: lang,
        isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(service ? { mainEntity: { '@id': `${url}#service` } } : {}),
      },
      ...(service ? [serviceNode(service)] : services.map(serviceNode)),
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: home },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'es' ? 'Servicios' : 'Services',
            item: index,
          },
          ...(service ? [{ '@type': 'ListItem', position: 3, name: copy!.name, item: url }] : []),
        ],
      },
    ],
  };
}
