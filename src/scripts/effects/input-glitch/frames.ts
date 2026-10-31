export const enterFrames: Keyframe[] = [
  { offset: 0, opacity: 0.65, clipPath: 'inset(25% 0 45% 0)' },
  { offset: 0.3, opacity: 0, clipPath: 'inset(25% 0 45% 0)' },
  { offset: 0.5, opacity: 0.5, clipPath: 'inset(50% 0 20% 0)' },
  { offset: 1, opacity: 0, clipPath: 'inset(50% 0 20% 0)' },
];

export const exitFrames: Keyframe[] = [
  { offset: 0, opacity: 0.65, clipPath: 'inset(0)' },
  { offset: 0.25, opacity: 0.4, clipPath: 'inset(25% 0 35% 0)' },
  { offset: 0.5, opacity: 0, clipPath: 'inset(25% 0 35% 0)' },
  { offset: 0.7, opacity: 0.3, clipPath: 'inset(50% 0 15% 0)' },
  { offset: 1, opacity: 0, clipPath: 'inset(50% 0 15% 0)' },
];
