export const GLITCH_EFFECT = { duration: 260, intensity: 0.65 } as const;

export function glitchHost(value: EventTarget | null): HTMLElement | undefined {
  if (!(value instanceof Element)) return;
  const target = value.closest<HTMLElement>('a[href][data-glitch],button[data-glitch]');
  if (
    !target ||
    target.matches(':disabled,[aria-disabled="true"],[hidden]') ||
    target.closest('[inert]')
  )
    return;
  if (target instanceof HTMLAnchorElement && !target.getAttribute('href')?.trim()) return;
  return target;
}
