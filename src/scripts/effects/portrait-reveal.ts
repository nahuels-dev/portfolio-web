import { createRevealState } from './portrait-reveal/types';
import { createRevealRenderer } from './portrait-reveal/renderer';
import { createRevealAnimation } from './portrait-reveal/animation';
import { bindRevealControls } from './portrait-reveal/controls';

export function initPortraitReveal(): () => void {
  const root = document.querySelector<HTMLElement>('[data-portrait-reveal]');
  const hero = root?.closest<HTMLElement>('.hero');
  const button = hero?.querySelector<HTMLButtonElement>('[data-portrait-reveal-control]');
  const natural = root?.querySelector<HTMLImageElement>(':scope > picture img');
  const cyberLayer = root?.querySelector<HTMLElement>('[data-portrait-cyber]');
  const cyber = cyberLayer?.querySelector<HTMLImageElement>('img');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-portrait-reveal-canvas]');
  if (!root || !hero || !button || !natural || !cyberLayer || !cyber || !canvas) return () => {};

  const elements = { root, hero, button, natural, cyberLayer, cyber, canvas };
  const state = createRevealState();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const renderer = createRevealRenderer(elements, state, motion);
  const { fit } = renderer;
  const animation = createRevealAnimation(elements, state, renderer, motion);
  const { clear, activate } = animation;
  bindRevealControls(elements, state, animation, motion, abort.signal);

  const resize = new ResizeObserver(() => {
    if (state.ready) {
      fit();
      clear();
    }
  });
  resize.observe(root);
  const intersection = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) activate(false, true);
  });
  intersection.observe(root);
  void Promise.all([natural.decode(), cyber.decode()])
    .then(() => {
      if (state.disposed) return;
      state.ready = true;
      fit();
      clear();
      state.toX = state.x = state.width * 0.55;
      state.toY = state.y = state.height * 0.45;
      button.hidden = false;
    })
    .catch(() => {});
  return () => {
    clear();
    state.disposed = true;
    abort.abort();
    resize.disconnect();
    intersection.disconnect();
    button.hidden = true;
  };
}
