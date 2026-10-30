import portrait from '../assets/nahuel-human-standing.png';
import about from '../assets/nahuel-human-about-reference.png';
import cyberpunk from '../assets/nahuel-standing-chrome.png';

export const heroPortrait = {
  src: portrait,
  widths: [320, 480, 512, 640, 768, 1100, 1254],
  sizes: '(max-width: 760px) 70vw, 51vw',
  quality: 50,
};

export const aboutPortrait = {
  ...heroPortrait,
  src: about,
};

export const cyberPortrait = {
  ...heroPortrait,
  src: cyberpunk,
};
