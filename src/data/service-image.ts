import { servicePortraits } from './service-portraits';

export const serviceHeroImage = (artwork: string) => {
  const src = servicePortraits[artwork];
  if (!src) throw new Error(`Missing service portrait: ${artwork}`);
  return {
    src,
    width: 960,
    widths: [320, 480, 640, 960, 1254, 1536],
    sizes: '(max-width: 760px) calc(100vw - 4rem), 54vw',
    format: 'avif' as const,
    quality: 50,
  };
};
