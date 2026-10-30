import { gsap } from 'gsap';
import { createNetRecovery, type NetRecovery } from '../loading/net-recovery';
import { createRevealTiles, type RevealTiles } from './reveal-tiles';
import { viewportResize } from './viewport-resize';

export function initFloatingNavGlitch(): () => void {
  const nav = document.querySelector<HTMLElement>('[data-floating-nav]');
  if (!nav) return () => {};
  const panel = nav.querySelector<HTMLElement>('[data-floating-panel]');
  const button = nav.querySelector<HTMLElement>('[data-floating-toggle]');
  if (!panel || !button) return () => {};
  const mobile = matchMedia('(max-width: 760px)');
  const abort = new AbortController();
  let recovery: NetRecovery | undefined;
  let tiles: RevealTiles | undefined;
  let started = 0;
  let geometryDirty = false;
  const realign = () => {
    geometryDirty = true;
  };
  const finish = () => {
    gsap.ticker.remove(tick);
    recovery?.destroy();
    tiles?.destroy();
    recovery = undefined;
    tiles = undefined;
    geometryDirty = false;
    delete nav.dataset.floatingNavState;
  };
  const tick = () => {
    const progress = Math.min(1, (performance.now() - started) / 520);
    if (progress === 1 || nav.hidden || document.hidden) {
      finish();
      return;
    }
    if (geometryDirty) {
      recovery?.reposition();
      tiles?.reposition();
      geometryDirty = false;
    }
    recovery?.update(progress);
    tiles?.update(progress);
  };
  const play = (surface: HTMLElement) => {
    finish();
    if (nav.hidden || document.hidden || surface.contains(document.activeElement)) return;
    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    recovery = createNetRecovery({
      source: surface,
      scope: 'fixed',
      className: 'net-recovery--floating-nav',
    });
    tiles = createRevealTiles(surface, { fixed: true, preserveHitArea: true });
    tiles.element.classList.add('reveal-tiles--floating-nav');
    nav.dataset.floatingNavState = 'revealing';
    started = performance.now();
    tick();
    gsap.ticker.add(tick);
  };
  const appear = () => play(mobile.matches ? button : panel);
  nav.addEventListener('portfolio:floating-nav-show', appear, { signal: abort.signal });
  nav.addEventListener('portfolio:floating-nav-panel-show', () => play(panel), {
    signal: abort.signal,
  });
  nav.addEventListener('portfolio:floating-nav-panel-hide', finish, { signal: abort.signal });
  nav.addEventListener('portfolio:floating-nav-hide', finish, { signal: abort.signal });
  nav.addEventListener('focusin', finish, { signal: abort.signal });
  panel.addEventListener('scroll', finish, { signal: abort.signal, passive: true });
  window.addEventListener('resize', viewportResize(finish, realign), {
    signal: abort.signal,
    passive: true,
  });

  visualViewport?.addEventListener('resize', realign, { signal: abort.signal, passive: true });
  visualViewport?.addEventListener('scroll', realign, { signal: abort.signal, passive: true });
  document.addEventListener('visibilitychange', finish, { signal: abort.signal });
  if (!nav.hidden) appear();
  return () => {
    abort.abort();
    finish();
  };
}
