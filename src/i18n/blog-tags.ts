import type { Locale } from './ui';

const spanish: Record<string, string> = {
  AI: 'IA',
  Technology: 'Tecnología',
  Science: 'Ciencia',
  Security: 'Seguridad',
  Space: 'Espacio',
  Quantum: 'Cuántica',
  Biology: 'Biología',
  Climate: 'Clima',
  Weather: 'Meteorología',
  Astronomy: 'Astronomía',
  Physics: 'Física',
  'Supply chain': 'Cadena de suministro',
};

export const blogTag = (tag: string, lang: Locale) => (lang === 'es' ? (spanish[tag] ?? tag) : tag);
