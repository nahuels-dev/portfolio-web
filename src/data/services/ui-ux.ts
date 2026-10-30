import type { Service } from './types';

export const uiUx: Service = {
  id: 'ui-ux',
  icon: 'pen',
  slug: {
    es: 'diseno-ui-ux',
    en: 'ui-ux-design',
  },
  related: ['websites', 'web-apps', 'mobile-apps'],
  copy: {
    es: {
      name: 'UI/UX',
      summary:
        'Diseño las pantallas de tu web o app y te muestro un prototipo antes de desarrollarlas.',
      title: 'Diseño UI/UX de interfaces en Uruguay | Nahuel Silva',
      description:
        'Diseño interfaces UI/UX como freelance en Uruguay. Te ayudo con la estructura, los wireframes, el prototipo y el diseño visual de tu web o aplicación.',
      heading: 'Diseño la interfaz de tu web o aplicación.',
      promise: 'Te muestro la idea antes de llevarla a código.',
      intro: [
        'Si una pantalla genera dudas o pide demasiados pasos, puedo ayudarte a revisarla. Organizo la información, pienso los recorridos y diseño cómo se ve cada parte de tu web o aplicación.',
        'Mi experiencia en frontend me ayuda a pensar también en cómo se va a desarrollar el diseño. Puedo trabajar en una idea nueva o mejorar una parte de un producto que ya tenés.',
      ],
      audience: [
        'Tenés una idea y necesitás visualizar cómo se va a usar.',
        'Tus usuarios encuentran dificultades para completar una tarea.',
        'Tu producto necesita coherencia entre pantallas y componentes.',
      ],
      deliverables: [
        {
          title: 'Estructura y recorridos',
          text: 'Ordeno los contenidos y las tareas principales a partir de lo que necesitás y de la información que tengas sobre tus usuarios.',
        },
        {
          title: 'Wireframes y prototipo',
          text: 'Armo bocetos y un prototipo para que puedas recorrer las pantallas y revisar la navegación antes de programar.',
        },
        {
          title: 'Diseño visual responsive',
          text: 'Diseño la tipografía, los colores, los espacios y los componentes de las pantallas incluidas, con sus versiones para los dispositivos que necesites.',
        },
        {
          title: 'Entrega para desarrollar',
          text: 'Te entrego los diseños ordenados y explico los estados y comportamientos necesarios para desarrollarlos.',
        },
      ],
      steps: [
        {
          title: 'Entender y ordenar',
          text: 'Te pregunto qué problema querés resolver y quién usa el producto. Reviso qué partes conviene trabajar primero.',
        },
        {
          title: 'Proponer y revisar',
          text: 'Te muestro una estructura y un prototipo. Con tus comentarios ajusto el recorrido antes de pasar al diseño final.',
        },
        {
          title: 'Detallar y entregar',
          text: 'Termino las pantallas y documento cómo deben funcionar, para que puedas pasar a desarrollo con esos detalles resueltos.',
        },
      ],
      requirements: [
        'Qué querés que las personas puedan hacer en el producto.',
        'Identidad visual, diseños actuales y referencias, si existen.',
        'Comentarios de usuarios o datos que ayuden a entender el problema.',
      ],
      scope:
        'En el presupuesto te detallo cuántas pantallas voy a diseñar, para qué dispositivos y cuántas revisiones incluye. Si necesitás entrevistas, pruebas con usuarios, investigación o un sistema de diseño completo, te explico ese trabajo aparte y qué participantes hacen falta.',
      faqs: [
        {
          question: '¿Incluye desarrollo?',
          answer:
            'Puedo encargarme del diseño, del desarrollo o de ambas partes. En el presupuesto te aclaro qué archivos y pantallas voy a entregarte y si también voy a programarlas.',
        },
        {
          question: '¿Podés trabajar con mi identidad actual?',
          answer:
            'Sí. Reviso tu marca y sus recursos para usarlos en las pantallas. Si necesitás crear o renovar la identidad, te lo señalo como un trabajo adicional.',
        },
        {
          question: '¿Se puede probar antes de programar?',
          answer:
            'Sí. Te preparo un prototipo para que puedas recorrer las pantallas. Si querés probarlo con usuarios, también necesito definir qué observar, quiénes participan y qué tareas van a hacer.',
        },
        {
          question: '¿Podés rediseñar una sola parte del producto?',
          answer:
            'Sí. Puedo trabajar solo en el registro, la búsqueda, la compra u otra parte del producto. Reviso cómo se conecta con el resto para que el cambio tenga sentido.',
        },
      ],
      cta: 'Mostrame qué pantalla te está dando problemas o contame tu idea. Te ayudo a ordenar por dónde empezar.',
    },
    en: {
      name: 'UI/UX',
      summary: 'I design your website or app screens and show you a prototype before development.',
      title: 'UI/UX and interface design in Uruguay | Nahuel Silva',
      description:
        'I’m a freelance UI/UX designer based in Uruguay. I help with structure, wireframes, prototypes and the visual design of your website or application.',
      heading: 'I design the interface for your website or app.',
      promise: 'I show you the idea before writing the code.',
      intro: [
        'If a screen feels confusing or takes too many steps, I can help you review it. I organise information, plan the main tasks and design the screens of your website or application.',
        'My frontend experience helps me think about how a design will be built, too. I can work on a new idea or improve part of a product you already have.',
      ],
      audience: [
        'You have an idea and need to visualise how people will use it.',
        'Users struggle to complete an important task.',
        'Your product needs consistent screens and components.',
      ],
      deliverables: [
        {
          title: 'Structure and journeys',
          text: 'I organise content and main tasks around your needs and the information you have about your users.',
        },
        {
          title: 'Wireframes and prototype',
          text: 'I create wireframes and a prototype so you can explore the screens and review navigation before development.',
        },
        {
          title: 'Responsive visual design',
          text: 'I design typography, colours, spacing and components for the included screens and devices.',
        },
        {
          title: 'Development handover',
          text: 'I deliver organised designs and explain the states and behaviours needed for development.',
        },
      ],
      steps: [
        {
          title: 'Understand and organise',
          text: 'I ask what you want to solve and who uses the product, then review which parts to work on first.',
        },
        {
          title: 'Propose and review',
          text: 'I show you a structure and prototype, then use your feedback to refine the journey before the final design.',
        },
        {
          title: 'Detail and hand over',
          text: 'I finish the screens and document how they should work, so you can move into development with those details resolved.',
        },
      ],
      requirements: [
        'What people should be able to do in the product.',
        'Brand assets, existing designs and references, if available.',
        'User feedback or data that helps explain the problem.',
      ],
      scope:
        'My quote lists the screens, devices and review rounds I’ll cover. If you need interviews, user testing, research or a complete design system, I explain that work separately and which participants are needed.',
      faqs: [
        {
          question: 'Is development included?',
          answer:
            'I can handle design, development or both. My quote explains which files and screens I’ll deliver and whether I’ll also build them.',
        },
        {
          question: 'Can you use my existing brand?',
          answer:
            'Yes. I review your brand and assets and apply them to the screens. If you need a new or refreshed identity, I identify that as additional work.',
        },
        {
          question: 'Can I try the design before development?',
          answer:
            'Yes. I prepare a prototype you can explore. For testing with users, I also need to define what to observe, who takes part and which tasks they will try.',
        },
        {
          question: 'Can you redesign just one part?',
          answer:
            'Yes. I can focus on registration, search, checkout or another part of the product. I review how it connects with the rest so the change makes sense.',
        },
      ],
      cta: 'Show me a screen that is causing problems, or tell me your idea. I’ll help you work out where to start.',
    },
  },
};
