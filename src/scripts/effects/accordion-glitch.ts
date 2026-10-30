import { gsap } from 'gsap';
import { viewportResize } from './viewport-resize';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createNetRecovery, type NetRecovery } from '../loading/net-recovery';
import { createRevealTiles, type RevealTiles } from './reveal-tiles';

const DURATION = 520;

export function initAccordionGlitch(): () => void {
  const abort = new AbortController();
  const accordions = document.querySelectorAll<HTMLDetailsElement>('#main details[data-accordion]');
  let active:
    | {
        details: HTMLDetailsElement;
        content: HTMLElement;
        recovery: NetRecovery;
        tiles: RevealTiles;
        start: number;
        phase: number;
      }
    | undefined;

  const finish = () => {
    gsap.ticker.remove(tick);
    if (!active) return;
    active.recovery.destroy();
    active.tiles.destroy();
    delete active.details.dataset.accordionState;
    active = undefined;
  };
  const tick = () => {
    if (!active) return;
    const progress = Math.min(1, (performance.now() - active.start) / DURATION);
    const rect = active.content.getBoundingClientRect();
    if (
      progress === 1 ||
      !active.details.open ||
      document.hidden ||
      rect.bottom <= 0 ||
      rect.top >= innerHeight
    ) {
      finish();
      return;
    }
    const phase = Math.floor(progress * 18);
    if (phase === active.phase) return;
    active.phase = phase;
    active.recovery.update(progress);
    active.tiles.update(progress);
  };

  for (const details of accordions) {
    details.addEventListener(
      'toggle',
      () => {
        finish();

        ScrollTrigger.refresh();
        if (!details.open || document.hidden) return;
        const content = details.querySelector<HTMLElement>('[data-accordion-content]');
        if (!content) return;
        const rect = content.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight) return;
        const recovery = createNetRecovery({
          source: content,
          scope: 'section',
          strength: 1,
          className: 'net-recovery--accordion',
        });
        const tiles = createRevealTiles(content);
        active = { details, content, recovery, tiles, start: performance.now(), phase: -1 };
        details.dataset.accordionState = 'revealing';
        tick();
        if (active) gsap.ticker.add(tick);
      },
      { signal: abort.signal },
    );
  }
  window.addEventListener('resize', viewportResize(finish), {
    signal: abort.signal,
    passive: true,
  });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) finish();
    },
    { signal: abort.signal },
  );
  return () => {
    abort.abort();
    finish();
  };
}
