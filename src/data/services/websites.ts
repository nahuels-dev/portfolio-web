import type { Service } from './types';

export const websites: Service = {
  id: 'websites',
  icon: 'globe',
  slug: {
    es: 'paginas-web',
    en: 'websites',
  },
  related: ['ui-ux', 'ecommerce', 'emails'],
  copy: {
    es: {
      name: 'Sitios web',
      summary:
        'Diseño y desarrollo páginas web para que puedas mostrar lo que hacés y recibir consultas.',
      title: 'Diseño y desarrollo de páginas web en Uruguay | Nahuel Silva',
      description:
        'Soy desarrollador web freelance en Uruguay. Diseño páginas para negocios y profesionales, adaptadas a celulares y con SEO técnico. Conocé cómo trabajo.',
      heading: 'Diseño y desarrollo la web de tu negocio.',
      promise: 'Hablás conmigo. Yo me encargo del desarrollo.',
      intro: [
        'Si tu negocio necesita una web, puedo ayudarte a decidir qué mostrar y cómo organizarlo. Diseño y desarrollo sitios para empresas, profesionales y emprendimientos que quieren presentar lo que hacen y facilitar el contacto.',
        'Trabajo como freelance desde Uruguay, de forma remota. Te propongo una estructura, te muestro el diseño y desarrollo las páginas para que se puedan usar bien desde el celular y la computadora.',
      ],
      audience: [
        'Tu negocio todavía depende de las redes sociales para presentarse.',
        'Tu sitio quedó desactualizado o cuesta usarlo desde el celular.',
        'Necesitás una landing para un servicio, producto o campaña concreta.',
      ],
      deliverables: [
        {
          title: 'Estructura y diseño a medida',
          text: 'Organizo la información y diseño las páginas acordadas alrededor de tu propuesta, tus contenidos y las acciones que querés facilitar.',
        },
        {
          title: 'Desarrollo responsive',
          text: 'Construyo la interfaz para distintos tamaños de pantalla, con navegación clara, imágenes optimizadas y atención a la accesibilidad.',
        },
        {
          title: 'Base técnica para buscadores',
          text: 'Preparo títulos, descripciones, jerarquía de encabezados, enlaces y sitemap. La visibilidad posterior también depende del contenido y del trabajo continuo.',
        },
        {
          title: 'Entrega y puesta en línea',
          text: 'Reviso enlaces y recorridos principales, preparo la publicación y explico cómo mantener el sitio según la solución elegida.',
        },
      ],
      steps: [
        {
          title: 'Entender el negocio',
          text: 'Primero te pregunto por tu negocio, tus clientes y lo que necesitás de la web. Reviso las referencias y el material que ya tenés.',
        },
        {
          title: 'Diseñar y construir',
          text: 'Te muestro una propuesta visual y desarrollo las páginas por etapas. Así podés ver cómo va quedando y darme tu opinión.',
        },
        {
          title: 'Revisar y publicar',
          text: 'Pruebo la versión móvil, los textos, los enlaces y las formas de contacto. Después preparo la publicación en el dominio que vayas a usar.',
        },
      ],
      requirements: [
        'Qué hace tu negocio y qué querés conseguir con la web.',
        'Logo, textos, imágenes y dominio, si ya los tenés.',
        'Cantidad aproximada de páginas y funciones que necesitás.',
      ],
      scope:
        'Te preparo un presupuesto según las páginas, el contenido y las funciones que necesites. Ahí te detallo qué incluye mi trabajo y qué hace falta resolver aparte: dominio, hosting, textos, identidad visual, gestor de contenidos o mantenimiento.',
      faqs: [
        {
          question: '¿Puedo actualizar la web por mi cuenta?',
          answer:
            'Sí, si incluyo un gestor de contenidos en el proyecto. Te pregunto qué necesitás editar y con qué frecuencia, para proponerte una opción que puedas usar sin tocar código.',
        },
        {
          question: '¿Cuánto demora hacer una página web?',
          answer:
            'Depende de la cantidad de páginas, las funciones y el material disponible. Después de conocer el alcance, te propongo etapas y un calendario que contemple también tus revisiones.',
        },
        {
          question: '¿La web va a aparecer primera en Google?',
          answer:
            'Nadie puede garantizar esa posición. El desarrollo incluye una base técnica para que los buscadores entiendan el sitio; competir por búsquedas requiere contenido útil, autoridad y seguimiento.',
        },
        {
          question: '¿Podés renovar una web que ya existe?',
          answer:
            'Sí. Primero reviso tu sitio para ver qué conviene conservar, qué está fallando y cómo cuidar las URLs que ya tenés. Después te propongo una mejora puntual o un rediseño, según lo que haga falta.',
        },
      ],
      cta: 'Contame qué hace tu negocio y qué necesitás de la web. Te cuento cómo lo encararía y qué información me falta para presupuestarlo.',
    },
    en: {
      name: 'Websites',
      summary:
        'I design and build websites that show what you do and make it easy to get in touch.',
      title: 'Website design and development in Uruguay | Nahuel Silva',
      description:
        'I’m a freelance web developer based in Uruguay. I design business websites with mobile layouts and technical SEO. Find out how I work.',
      heading: 'I design and build your business website.',
      promise: 'You talk to me. I handle the development.',
      intro: [
        'If your business needs a website, I can help you decide what to show and how to organise it. I design and build sites for businesses and independent professionals who want to explain what they do and make contact easier.',
        'I work remotely as a freelancer based in Uruguay. I suggest a structure, show you the design and build the pages so people can use them on phones and computers.',
      ],
      audience: [
        'Your business relies on social media alone to introduce itself.',
        'Your current website feels outdated or is difficult to use on mobile.',
        'You need a focused landing page for a service, product or campaign.',
      ],
      deliverables: [
        {
          title: 'Custom structure and design',
          text: 'I organise the information and design the agreed pages around your offer, your content and the actions you want visitors to take.',
        },
        {
          title: 'Responsive development',
          text: 'I build for different screen sizes, with clear navigation, optimised images and attention to accessibility.',
        },
        {
          title: 'Technical SEO foundations',
          text: 'I prepare titles, descriptions, headings, links and a sitemap. Search visibility also needs useful content and ongoing work after launch.',
        },
        {
          title: 'Handover and launch',
          text: 'I check links and main journeys, prepare deployment and explain how to maintain the chosen solution.',
        },
      ],
      steps: [
        {
          title: 'Understand the business',
          text: 'First I ask about your business, customers and what you need the website to do. I look at your references and the material you already have.',
        },
        {
          title: 'Design and build',
          text: 'I show you a visual proposal and build the pages in stages. You can see the work as it takes shape and share your feedback.',
        },
        {
          title: 'Review and launch',
          text: 'I test mobile layouts, text, links and contact options, then prepare the site for publishing on your chosen domain.',
        },
      ],
      requirements: [
        'What your business does and what the website should achieve.',
        'Brand assets, copy, images and an existing domain, if available.',
        'An approximate page count and the features you need.',
      ],
      scope:
        'I put together a quote based on the pages, content and features you need. It explains my work and anything to arrange separately, such as a domain, hosting, copy, branding, a content editor or maintenance.',
      faqs: [
        {
          question: 'Can I update the website myself?',
          answer:
            'Yes, if I include a content management system in the project. I ask what you need to edit and how often, then suggest an option you can use without changing code.',
        },
        {
          question: 'How long does a website take?',
          answer:
            'It depends on the pages, features and content you have ready. Once I understand the work, I suggest stages and a schedule that leaves time for your feedback.',
        },
        {
          question: 'Will the website rank first on Google?',
          answer:
            'No one can guarantee that position. Development provides a technical foundation for search engines; competing for searches also requires useful content, authority and ongoing monitoring.',
        },
        {
          question: 'Can you refresh an existing website?',
          answer:
            'Yes. First I review your site to see what is worth keeping, what needs fixing and how to look after existing URLs. Then I suggest targeted changes or a broader redesign.',
        },
      ],
      cta: 'Tell me what your business does and what you need from the website. I’ll explain how I would approach it and what else I need to prepare a quote.',
    },
  },
};
