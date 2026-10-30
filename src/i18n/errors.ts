import type { Locale } from './ui';

export type ErrorCode = 404 | 500 | 503;

const shared = {
  es: {
    mode: 'PROTOCOLO DE RECUPERACIÓN',
    sector: 'ANTIGUA NET / SECTOR AISLADO',
    home: 'Volver a zona segura',
    projects: 'Explorar proyectos',
    retry: 'Intentar reconexión',
    skip: 'Saltar al contenido',
    logo: 'Nahuel Silva — Volver al inicio',
    language: 'Switch to English',
    languageCode: 'EN',
    diagnostic: 'Diagnóstico del enlace',
    route: 'COORDENADA SOLICITADA',
    status: 'ESTADO DEL ENLACE',
    exit: 'RUTA DE SALIDA',
    available: 'DISPONIBLE',
    terminal: 'TERMINAL DE RESCATE',
    footer: 'Toda señal merece encontrar su destino.',
    signature: 'DISEÑO / CÓDIGO / PROPÓSITO',
    note: 'Tu ruta de vuelta sigue abierta.',
  },
  en: {
    mode: 'RECOVERY PROTOCOL',
    sector: 'OLD NET / ISOLATED SECTOR',
    home: 'Back to safe zone',
    projects: 'Explore projects',
    retry: 'Reconnect',
    skip: 'Skip to content',
    logo: 'Nahuel Silva — Back home',
    language: 'Cambiar a español',
    languageCode: 'ES',
    diagnostic: 'Connection diagnostics',
    route: 'REQUESTED COORDINATE',
    status: 'CONNECTION STATUS',
    exit: 'EXIT ROUTE',
    available: 'AVAILABLE',
    terminal: 'RESCUE TERMINAL',
    footer: 'Every signal deserves a destination.',
    signature: 'DESIGN / CODE / PURPOSE',
    note: 'Your way back is still open.',
  },
} as const;

const cases = {
  es: {
    404: {
      title: ['COORDENADA', 'PERDIDA.'],
      label: 'DESTINO NO ENCONTRADO',
      description:
        'Cruzaste la Blackwall, pero esta coordenada no existe. La señal termina acá. Te dejo una ruta para volver.',
      detail: 'El enlace puede haber cambiado o la dirección estar incompleta.',
      tag: 'ROUTE_NOT_FOUND',
      log: 'La coordenada solicitada no figura en el archivo.',
    },
    500: {
      title: ['ENLACE', 'INTERRUMPIDO.'],
      label: 'ERROR INTERNO',
      description:
        'La conexión se interrumpió durante el cruce. Algo falló de este lado de la red. Podés intentar reconectar o volver a zona segura.',
      detail: 'Si el problema persiste, podés regresar al inicio.',
      tag: 'CONNECTION_INTERRUPTED',
      log: 'El sistema no pudo completar la solicitud.',
    },
    503: {
      title: ['BRECHA', 'CERRADA.'],
      label: 'ACCESO TEMPORALMENTE NO DISPONIBLE',
      description:
        'Este acceso está temporalmente fuera de servicio. El cruce tendrá que esperar. Tu ruta de regreso sigue disponible.',
      detail: 'Volvé a intentar dentro de unos momentos.',
      tag: 'GATEWAY_UNAVAILABLE',
      log: 'El acceso está temporalmente fuera de servicio.',
    },
  },
  en: {
    404: {
      title: ['COORDINATE', 'LOST.'],
      label: 'DESTINATION NOT FOUND',
      description:
        'You crossed the Blackwall, but this coordinate does not exist. The signal ends here. Here’s a way back.',
      detail: 'The link may have changed, or the address may be incomplete.',
      tag: 'ROUTE_NOT_FOUND',
      log: 'The requested coordinate is missing from the archive.',
    },
    500: {
      title: ['CONNECTION', 'INTERRUPTED.'],
      label: 'INTERNAL ERROR',
      description:
        'The connection dropped during the crossing. Something failed on this side of the network. Try reconnecting, or head back to safe territory.',
      detail: 'If the problem persists, you can return home.',
      tag: 'CONNECTION_INTERRUPTED',
      log: 'The system could not complete the request.',
    },
    503: {
      title: ['BREACH', 'CLOSED.'],
      label: 'ACCESS TEMPORARILY UNAVAILABLE',
      description:
        'This gateway is temporarily offline. The crossing will have to wait. Your way back is still available.',
      detail: 'Please try again in a few moments.',
      tag: 'GATEWAY_UNAVAILABLE',
      log: 'This gateway is temporarily out of service.',
    },
  },
} as const;

export const getErrorUI = (lang: Locale, code: ErrorCode) => ({
  ...shared[lang],
  ...cases[lang][code],
});
