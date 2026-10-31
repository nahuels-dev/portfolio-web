export const enterFrames: Keyframe[] = [
  { offset: 0, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(0)' },
  { offset: 0.25, opacity: 1, color: 'var(--signal)', clipPath: 'inset(0)' },
  { offset: 0.4, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(20% 0 40% 0)' },
  { offset: 0.55, opacity: 0, clipPath: 'inset(0)' },
  { offset: 0.65, opacity: 1, color: 'var(--signal)', clipPath: 'inset(40% 0 15% 0)' },
  { offset: 0.85, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(15% 0 50% 0)' },
  { offset: 1, opacity: 0, clipPath: 'inset(0)' },
];

export const exitFrames: Keyframe[] = [
  { offset: 0, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(0)' },
  { offset: 0.2, opacity: 1, color: 'var(--signal)', clipPath: 'inset(15% 0 10% 0)' },
  { offset: 0.4, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(45% 0 15% 0)' },
  { offset: 0.55, opacity: 0, clipPath: 'inset(0)' },
  { offset: 0.65, opacity: 1, color: 'var(--signal)', clipPath: 'inset(20% 0 55% 0)' },
  { offset: 0.85, opacity: 1, color: 'var(--cyan)', clipPath: 'inset(50% 0 25% 0)' },
  { offset: 1, opacity: 0, clipPath: 'inset(50% 0)' },
];
