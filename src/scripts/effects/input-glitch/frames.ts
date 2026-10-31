export const enterFrames: Keyframe[] = [
  { offset: 0, opacity: 1, transform: 'translate(-4px, calc(-50% - 3px)) skewX(-12deg)' },
  {
    offset: 0.2,
    opacity: 0.8,
    transform: 'translate(3px, calc(-50% + 2px))',
    clipPath: 'inset(20% 0 35% 0)',
  },
  { offset: 0.4, opacity: 0.2, transform: 'translate(-2px, -50%)', clipPath: 'inset(0)' },
  {
    offset: 0.55,
    opacity: 1,
    transform: 'translate(2px, calc(-50% - 1px))',
    clipPath: 'inset(45% 0 10% 0)',
  },
  { offset: 0.75, opacity: 0.6, transform: 'translate(0, -50%)', clipPath: 'inset(0)' },
  { offset: 1, opacity: 0, transform: 'translate(0, -50%)' },
];

export const exitFrames: Keyframe[] = [
  { offset: 0, opacity: 1, transform: 'translate(0, -50%)', clipPath: 'inset(0)' },
  {
    offset: 0.2,
    opacity: 1,
    transform: 'translate(3px, calc(-50% + 2px)) skewX(14deg)',
    clipPath: 'inset(15% 0 30% 0)',
  },
  {
    offset: 0.4,
    opacity: 0.5,
    transform: 'translate(-4px, calc(-50% - 2px))',
    clipPath: 'inset(40% 0 5% 0)',
  },
  {
    offset: 0.6,
    opacity: 0.9,
    transform: 'translate(4px, calc(-50% + 4px))',
    clipPath: 'inset(5% 0 45% 0)',
  },
  {
    offset: 1,
    opacity: 0,
    transform: 'translate(-3px, calc(-50% - 7px)) scaleX(0.6)',
    clipPath: 'inset(50% 0)',
  },
];
