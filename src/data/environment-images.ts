import archive from '../assets/environments/cyber-archive.png';
import skybridge from '../assets/environments/cyber-skybridge.png';
import workbench from '../assets/environments/cyber-workbench.png';
import passage from '../assets/environments/cyber-passage.png';

export const posterImages = {
  questions: archive,
  principles: skybridge,
  services: passage,
};

export type PosterVariant = keyof typeof posterImages;

export const contactModalImage = workbench;
