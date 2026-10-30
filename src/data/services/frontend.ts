import type { Service } from './types';

export const frontend: Service = {
  id: 'frontend',
  icon: 'layers',
  slug: {
    es: 'desarrollo-frontend',
    en: 'frontend-development',
  },
  related: ['web-apps', 'ui-ux', 'creative-coding'],
  copy: {
    es: {
      name: 'Frontend',
      summary:
        'Me sumo a tu proyecto para desarrollar interfaces, componentes e integraciones con APIs.',
      title: 'Desarrollo frontend en Uruguay | Nahuel Silva',
      description:
        'Soy desarrollador frontend freelance en Uruguay. Trabajo con Angular, React, Vue y Astro para implementar tus diseños, mejorar interfaces e integrar APIs.',
      heading: 'Desarrollo el frontend de tu proyecto.',
      promise: 'Me sumo al trabajo de tu equipo.',
      intro: [
        'Si ya tenés un diseño y necesitás llevarlo a código, puedo ayudarte. También me sumo a proyectos que necesitan ordenar sus componentes, mejorar pantallas o sumar una funcionalidad.',
        'Soy desarrollador frontend y trabajo con equipos de diseño y desarrollo. Uso Angular, React, Vue o Astro según el proyecto, y me fijo en que la interfaz sea accesible, se pueda mantener y funcione bien.',
      ],
      audience: [
        'Tu equipo tiene diseños y necesita llevarlos a producción.',
        'El frontend creció y cuesta mantener componentes consistentes.',
        'Necesitás sumar capacidad para una funcionalidad o una etapa concreta.',
      ],
      deliverables: [
        {
          title: 'Implementación de interfaces',
          text: 'Desarrollo las pantallas a partir de tus diseños y requisitos, con sus versiones responsive, interacciones y estados.',
        },
        {
          title: 'Componentes reutilizables',
          text: 'Organizo componentes que puedas reutilizar en nuevas pantallas y documento cómo usarlos.',
        },
        {
          title: 'Integración y comportamiento',
          text: 'Conecto las APIs del proyecto y trabajo en las validaciones, la carga y los errores. Coordino los detalles con quien se encargue del backend.',
        },
        {
          title: 'Revisión y transferencia',
          text: 'Pruebo los recorridos que cambian, reviso el código y documento las decisiones que sirvan para continuar el trabajo.',
        },
      ],
      steps: [
        {
          title: 'Conocer la base',
          text: 'Reviso el repositorio, los diseños y la forma de trabajo de tu equipo. Te propongo tareas y cómo revisar cada entrega.',
        },
        {
          title: 'Implementar por entregas',
          text: 'Desarrollo por partes que puedas revisar. Si faltan detalles de diseño o de una API, los consulto antes de seguir.',
        },
        {
          title: 'Revisar en contexto',
          text: 'Pruebo los cambios dentro del producto y preparo el código para el proceso de revisión de tu equipo.',
        },
      ],
      requirements: [
        'Tecnologías, estado actual del producto y objetivo de la etapa.',
        'Diseños o especificaciones y acceso al repositorio cuando corresponda.',
        'Responsables de diseño, backend y revisión de las entregas.',
      ],
      scope:
        'Puedo encargarme de una tarea concreta o trabajar por etapas. Para una migración, un sistema de diseño completo o cambios grandes de rendimiento, primero necesito revisar el código y entender qué hay que resolver.',
      faqs: [
        {
          question: '¿Podés trabajar sobre un proyecto ya iniciado?',
          answer:
            'Sí. Primero reviso su estructura, dependencias y forma de trabajo. Esa evaluación permite acordar una intervención que respete el contexto del equipo.',
        },
        {
          question: '¿Implementás diseños de Figma?',
          answer:
            'Sí. Desarrollo a partir de tus diseños y te consulto los detalles que falten: cómo se adapta a celulares, estados vacíos, errores e interacciones.',
        },
        {
          question: '¿Podés mejorar el rendimiento del frontend?',
          answer:
            'Puedo revisar qué lo está haciendo más lento y proponerte cambios medibles. Primero necesito conocer el rendimiento actual y revisar los datos, servicios, imágenes y código externo que usa.',
        },
        {
          question: '¿Cómo se revisan las entregas?',
          answer:
            'Me adapto a las ramas, revisiones de código y ambientes de prueba de tu equipo. Te explico qué cambié y cómo lo probé para que puedas revisar cada entrega.',
        },
      ],
      cta: 'Contame en qué está tu proyecto, qué tecnologías usás y dónde necesitás una mano. Te digo cómo puedo sumarme y por dónde empezaría.',
    },
    en: {
      name: 'Frontend',
      summary: 'I join your project to build interfaces, components and API integrations.',
      title: 'Frontend development in Uruguay | Nahuel Silva',
      description:
        'I’m a freelance frontend developer in Uruguay. I work with Angular, React, Vue and Astro to implement designs, improve interfaces and integrate APIs.',
      heading: 'I develop the frontend for your project.',
      promise: 'I work alongside your team.',
      intro: [
        'If you have a design ready to turn into code, I can help. I also join projects that need their components organised, screens improved or a new feature built.',
        'I’m a frontend developer who works with design and development teams. I use Angular, React, Vue or Astro depending on the project, with attention to accessibility, maintenance and performance.',
      ],
      audience: [
        'Your team has designs ready to move into production.',
        'A growing frontend makes consistent components difficult to maintain.',
        'You need extra development capacity for a feature or a defined stage.',
      ],
      deliverables: [
        {
          title: 'Interface implementation',
          text: 'I build screens from your designs and requirements, including responsive layouts, interactions and states.',
        },
        {
          title: 'Reusable components',
          text: 'I organise components you can reuse on new screens and document how to use them.',
        },
        {
          title: 'Integration and behaviour',
          text: 'I connect the project’s APIs and handle validation, loading and errors, coordinating details with the backend developer.',
        },
        {
          title: 'Review and handover',
          text: 'I test the affected tasks, review the code and document decisions that help with future work.',
        },
      ],
      steps: [
        {
          title: 'Understand the codebase',
          text: 'I review the repository, designs and your team’s workflow, then suggest tasks and how to review each delivery.',
        },
        {
          title: 'Deliver in reviewable steps',
          text: 'I build in changes you can review. If design or API details are missing, I ask before moving on.',
        },
        {
          title: 'Review in context',
          text: 'I test the changes in the product and prepare the code for your team’s review process.',
        },
      ],
      requirements: [
        'Technologies, current product status and the goal for this stage.',
        'Designs or specifications and repository access where needed.',
        'Contacts responsible for design, backend and delivery reviews.',
      ],
      scope:
        'I can take on a specific task or work in stages. For a migration, a complete design system or major performance work, I first need to review the code and understand the problem.',
      faqs: [
        {
          question: 'Can you join an existing project?',
          answer:
            'Yes. I first review the structure, dependencies and workflow, then suggest changes that fit your team’s way of working.',
        },
        {
          question: 'Do you implement Figma designs?',
          answer:
            'Yes. I build from your designs and ask about any missing details: mobile layouts, empty states, errors and interactions.',
        },
        {
          question: 'Can you improve frontend performance?',
          answer:
            'I can investigate what is slowing it down and suggest measurable changes. First I need a baseline and a look at the data, services, images and third-party code.',
        },
        {
          question: 'How are deliveries reviewed?',
          answer:
            'I adapt to your team’s branches, code reviews and test environments. I explain what I changed and how I tested it so you can review each delivery.',
        },
      ],
      cta: 'Tell me where your project stands, which technologies you use and where you need a hand. I’ll explain how I can contribute and where I would start.',
    },
  },
};
