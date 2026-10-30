import { es } from './ui/es';
import { en } from './ui/en';

export type Locale = 'es' | 'en';

export const ui = { es, en };

export const getUI = (lang: Locale) => ui[lang];
