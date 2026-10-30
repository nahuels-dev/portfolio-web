import type { RevealElements, RevealState } from './types';
import type { RevealAnimation } from './animation';

export function bindRevealControls(
  elements: RevealElements,
  state: RevealState,
  animation: RevealAnimation,
  motion: MediaQueryList,
  signal: AbortSignal,
) {
  const { root, hero, button } = elements;
  const { activate, schedule, place } = animation;
  const hover = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let touch: { id: number; x: number; y: number } | undefined;
  const link = (event: Event) =>
    event.target instanceof Element &&
    !!event.target.closest(
      'a, input, textarea, select, button:not([data-portrait-reveal-control])',
    );
  hero.addEventListener(
    'pointermove',
    (event) => {
      if (!state.ready || !hover.matches || event.pointerType === 'touch') return;
      if (event.target instanceof Node && button.contains(event.target)) return;
      if (link(event) || !place(event.clientX, event.clientY)) {
        activate(false);
        return;
      }
      activate(true);
      schedule();
    },
    { signal, passive: true },
  );
  hero.addEventListener(
    'pointerleave',
    (event) => {
      if (event.pointerType !== 'touch') activate(false);
    },
    { signal },
  );
  hero.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType === 'touch' && !link(event))
        touch = { id: event.pointerId, x: event.clientX, y: event.clientY };
    },
    { signal, passive: true },
  );
  hero.addEventListener(
    'pointerup',
    (event) => {
      if (event.pointerType !== 'touch' || touch?.id !== event.pointerId) return;
      const tap = Math.hypot(touch.x - event.clientX, touch.y - event.clientY) < 12;
      touch = undefined;
      if (!tap || link(event)) return;
      const rect = root.getBoundingClientRect();
      const same =
        Math.hypot(event.clientX - rect.left - state.toX, event.clientY - rect.top - state.toY) <
        state.radius * 0.4;
      if (place(event.clientX, event.clientY)) {
        activate(!(state.target && same));
        schedule();
      }
    },
    { signal, passive: true },
  );
  hero.addEventListener(
    'pointercancel',
    () => {
      touch = undefined;
      activate(false, true);
    },
    { signal },
  );
  button.addEventListener(
    'click',
    () => {
      if (!state.target) {
        state.toX = state.width * 0.55;
        state.toY = state.height * 0.45;
      }
      activate(!state.target);
    },
    { signal },
  );
  button.addEventListener(
    'keydown',
    (event) => {
      const direction = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!direction) return;
      event.preventDefault();
      state.toX = Math.max(0, Math.min(state.width, state.toX + direction[0] * 24));
      state.toY = Math.max(0, Math.min(state.height, state.toY + direction[1] * 24));
      activate(true);
      schedule();
    },
    { signal },
  );
  button.addEventListener('blur', () => activate(false), { signal });
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.target instanceof Node && button.contains(event.target)) return;
      if (event.target instanceof Node && !hero.contains(event.target)) activate(false);
      else if (link(event) || !place(event.clientX, event.clientY)) activate(false);
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') activate(false);
    },
    { signal },
  );
  window.addEventListener('blur', () => activate(false, true), { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) activate(false, true);
    },
    { signal },
  );
  motion.addEventListener(
    'change',
    () => {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      if (state.ready) schedule();
    },
    { signal },
  );
}
