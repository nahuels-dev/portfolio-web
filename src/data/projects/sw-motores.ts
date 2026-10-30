import { defineProject } from './types';

export default defineProject({
  id: '03',
  slug: 'sw-motores',
  name: 'SW Motores',
  category: { es: 'Sitio corporativo', en: 'Business website' },
  description: {
    es: 'Mi trabajo en la web de SW Motores: motores e instalaciones eléctricas.',
    en: 'My work on SW Motores’ website, for motor and electrical specialists.',
  },
  tech: ['Vue', 'JavaScript', 'SCSS'],
  image: '/images/project-motors.webp',
  imageSrcSet:
    '/images/project-motors-320.webp 320w, /images/project-motors-480.webp 480w, /images/project-motors.webp 720w',
  href: 'https://swmotores.com/',
  label: 'swmotores.com',
  role: { es: 'Desarrollo web', en: 'Web development' },
  copy: {
    es: {
      intro: 'Una presencia digital para especialistas en motores e instalaciones eléctricas.',
      overview:
        'Un sitio corporativo para presentar el trabajo de SW Motores y acercar sus servicios a quienes necesitan soluciones eléctricas.',
      challenge:
        'Comunicar una oferta técnica con una estructura accesible y un recorrido directo hacia la información de la empresa.',
      solution:
        'Una web organizada alrededor de la presentación de la empresa y sus servicios, construida con Vue, JavaScript y SCSS.',
      features: [
        {
          title: 'Presentación de servicios',
          text: 'Una estructura que da contexto al trabajo de la empresa.',
        },
        {
          title: 'Información clara',
          text: 'Contenido corporativo organizado en un recorrido fácil de seguir.',
        },
        {
          title: 'Desarrollo frontend',
          text: 'Vue, JavaScript y SCSS para construir la interfaz del sitio.',
        },
      ],
    },
    en: {
      intro: 'A digital presence for motor and electrical installation specialists.',
      overview:
        'A business website presenting SW Motores’ work and services to people looking for electrical solutions.',
      challenge:
        'Communicate a technical offering through an accessible structure and a direct route to company information.',
      solution:
        'A website organized around the company and its services, built with Vue, JavaScript and SCSS.',
      features: [
        {
          title: 'Service presentation',
          text: 'A structure that gives context to the company’s work.',
        },
        {
          title: 'Clear information',
          text: 'Business content organized into a straightforward journey.',
        },
        {
          title: 'Frontend development',
          text: 'Vue, JavaScript and SCSS to build the website’s interface.',
        },
      ],
    },
  },
});
