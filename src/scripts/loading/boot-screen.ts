import { createNetRecovery, type NetRecovery } from './net-recovery';
import { BOOT_TIMING } from './boot-timing';
import type { FieldState } from './blackwall-field';
import { createBootDisplay } from './boot-display';
import { createBootRenderer } from './boot-renderer';
import { watchBootResources } from './boot-resources';

declare global {
  interface Window {
    __bootDeadline?: number;
    __bootStartedAt?: number;
  }
}

interface Options {
  pause(): void;
  resume(): void;
}

export function initBootScreen(options: Options): () => void {
  const root = document.querySelector<HTMLElement>('[data-loading-screen]');
  if (!root) return () => {};
  if (!document.documentElement.dataset.boot) {
    root.remove();
    return () => {};
  }
  const abort = new AbortController(),
    { signal } = abort;
  const page = [...document.querySelectorAll<HTMLElement>('.page-shell,.skip-link')];
  const previousInert = page.map((el) => el.inert);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = root.querySelector<HTMLButtonElement>('.blackwall__skip')!;
  const display = createBootDisplay(root);
  let recovery: NetRecovery | undefined;
  let frame = 0,
    ready = 0;
  let closing = false,
    removed = false,
    exitTimer = 0,
    crossingStart = 0,
    crossingDuration: number = BOOT_TIMING.crossing,
    contentRevealed = false;
  const start = window.__bootStartedAt ?? performance.now();
  const state: FieldState = { time: 0, progress: 0, breach: 0, x: 0.5, y: 0.5 };
  const renderer = createBootRenderer(root, { signal, start, state, isClosing: () => closing });
  const revealContent = () => {
    if (contentRevealed) return;
    contentRevealed = true;
    document.dispatchEvent(
      new CustomEvent('portfolio:boot-complete', { detail: { glitch: true } }),
    );
  };
  const restore = () => {
    if (removed) return;
    removed = true;
    clearTimeout(exitTimer);
    clearTimeout(window.__bootDeadline);
    cancelAnimationFrame(frame);
    abort.abort();
    recovery?.destroy();
    recovery = undefined;
    renderer.destroy();
    root.remove();
    delete document.documentElement.dataset.boot;
    page.forEach((el, i) => {
      el.inert = previousInert[i];
    });
    options.resume();
    revealContent();
    document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  };
  const finish = (immediate = false, quick = false) => {
    if (closing) {
      if (immediate) restore();
      return;
    }
    closing = true;
    cancelAnimationFrame(frame);
    display.complete();
    if (immediate || motion.matches) {
      restore();
      return;
    }
    root.classList.add('is-crossing');
    crossingStart = performance.now();
    crossingDuration = quick ? BOOT_TIMING.skipCrossing : BOOT_TIMING.crossing;
    state.progress = 1;
    state.breach = 0;
    renderer.reset();

    revealContent();
    recovery = createNetRecovery();
    recovery.update(0);
    exitTimer = window.setTimeout(restore, crossingDuration + 120);
    frame = requestAnimationFrame(tick);
  };
  clearTimeout(window.__bootDeadline);
  window.__bootDeadline = window.setTimeout(
    () => finish(true),
    Math.max(0, BOOT_TIMING.deadline - (performance.now() - start)),
  );
  root.hidden = false;
  document.documentElement.dataset.boot = 'active';
  page.forEach((el) => {
    el.inert = true;
  });
  options.pause();
  root.focus({ preventScroll: true });
  const tick = (now: number) => {
    if (signal.aborted || document.hidden) return;
    if (closing) {
      state.breach = Math.min(1, (now - crossingStart) / crossingDuration);
      if (state.breach >= 1) {
        restore();
        return;
      }
      recovery?.update(state.breach);
      renderer.paint(now);
      frame = requestAnimationFrame(tick);
      return;
    }
    const elapsed = now - start;
    const value = Math.floor(
      Math.min(100, (elapsed / BOOT_TIMING.duration) * 100, ready === 3 ? 100 : 92),
    );
    display.update(value);
    if (elapsed >= BOOT_TIMING.maxDuration || (value === 100 && ready === 3)) {
      finish();
      return;
    }
    state.progress = value / 100;
    renderer.paint(now);
    frame = requestAnimationFrame(tick);
  };
  root.addEventListener('wheel', (e) => e.preventDefault(), { signal, passive: false });
  root.addEventListener('touchmove', (e) => e.preventDefault(), { signal, passive: false });
  skip.addEventListener('click', () => finish(false, true), { signal });
  root.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish(false, true);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        skip.focus();
      }
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !removed) frame = requestAnimationFrame(tick);
    },
    { signal },
  );
  motion.addEventListener(
    'change',
    () => {
      if (motion.matches) finish(true);
    },
    { signal },
  );
  window.addEventListener('portfolio:boot-timeout', () => finish(true), { signal });
  watchBootResources((index) => {
    ready++;
    if (!closing) display.ready(index);
  });
  frame = requestAnimationFrame(tick);
  return () => finish(true);
}
