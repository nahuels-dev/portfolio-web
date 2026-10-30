import type { RevealElements, RevealState } from './types';
import type { RevealRenderer } from './renderer';

export function createRevealAnimation(
  elements: RevealElements,
  state: RevealState,
  renderer: RevealRenderer,
  motion: MediaQueryList,
) {
  const { root, button, natural, cyberLayer, canvas } = elements;
  const { ctx, draw } = renderer;
  const clear = () => {
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.presence = state.target = state.energy = 0;
    natural.style.visibility = '';
    natural.style.maskImage = '';
    cyberLayer.hidden = true;
    cyberLayer.style.maskImage = '';
    cyberLayer.style.clipPath = '';
    canvas.hidden = true;
    ctx?.clearRect(0, 0, state.width, state.height);
    root.dataset.revealState = 'natural';
    button.setAttribute('aria-pressed', 'false');
  };

  const tick = (time: number) => {
    state.frame = 0;
    const dt = Math.max(1, Math.min(40, time - state.lastFrame || 16));
    state.lastFrame = time;
    state.presence += (state.target - state.presence) * (1 - Math.exp(-dt / 55));
    state.x += (state.toX - state.x) * (1 - Math.exp(-dt / 25));
    state.y += (state.toY - state.y) * (1 - Math.exp(-dt / 25));
    state.energy *= Math.exp(-dt / 65);
    const moving =
      Math.abs(state.target - state.presence) > 0.001 ||
      Math.hypot(state.toX - state.x, state.toY - state.y) > 0.1 ||
      state.energy > 0.008;
    if (!moving) {
      if (!state.target) {
        clear();
        return;
      }
      state.presence = 1;
      state.x = state.toX;
      state.y = state.toY;
      state.energy = 0;
    }
    if (moving || time - state.lastDraw >= 95) {
      draw(time);
      state.lastDraw = time;
    }
    if (moving || state.target) state.frame = requestAnimationFrame(tick);
  };

  const schedule = () => {
    if (motion.matches || !ctx) {
      state.presence = state.target;
      state.x = state.toX;
      state.y = state.toY;
      state.energy = 0;
      if (state.target) draw(performance.now());
      else clear();
    } else if (!state.frame) {
      state.lastFrame = performance.now();
      state.frame = requestAnimationFrame(tick);
    }
  };
  const activate = (active: boolean, immediate = false) => {
    if (!state.ready || state.disposed) return;
    if (!active && immediate) {
      clear();
      return;
    }
    if (state.target === Number(active)) return;
    state.target = Number(active);
    if (active && state.presence < 0.001) {
      state.x = state.toX;
      state.y = state.toY;
    }
    state.energy = motion.matches ? 0 : 1;
    root.dataset.revealState = active ? 'active' : 'hiding';
    button.setAttribute('aria-pressed', String(active));
    schedule();
  };
  const place = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect();
    const nextX = clientX - rect.left,
      nextY = clientY - rect.top;
    if (nextX < 0 || nextX > rect.width || nextY < 0 || nextY > rect.height) return false;
    const distance = Math.hypot(nextX - state.toX, nextY - state.toY);
    state.toX = nextX;
    state.toY = nextY;
    if (distance > 0.5) state.energy = motion.matches ? 0 : Math.min(1, 0.35 + distance / 35);
    return true;
  };
  return { clear, schedule, activate, place };
}

export type RevealAnimation = ReturnType<typeof createRevealAnimation>;
