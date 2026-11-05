import { createFrameLoop } from './frame-loop';
import { viewportResize } from './viewport-resize';
import { createNetRecovery, type NetRecovery } from '../loading/net-recovery';
import { createRevealTiles, type RevealTiles } from './reveal-tiles';

const DURATION = 520;

interface Reveal {
  target: HTMLElement;
  recovery: NetRecovery;
  tiles: RevealTiles;
  start: number;
  phase: number;
}

export function initScrollGlitch(seen: WeakSet<HTMLElement>): () => void {
  const panels = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  const abort = new AbortController(),
    queue: HTMLElement[] = [];
  let observer: IntersectionObserver | undefined;
  let active: Reveal | undefined,
    started = false,
    disposed = false;
  const complete = (panel: HTMLElement) => {
    panel.dataset.revealState = 'complete';
    seen.add(panel);
    observer?.unobserve(panel);
  };
  const finish = () => {
    loop.stop();
    if (!active) return;
    const { target, recovery, tiles } = active;
    active = undefined;
    recovery.destroy();
    tiles.destroy();
    complete(target);
  };
  const advance = () => {
    if (disposed || document.hidden) return;
    if (active) {
      const rect = active.target.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) return;
      finish();
    }
    while (queue.length) {
      const panel = queue.shift()!;
      if (seen.has(panel)) continue;
      const rect = panel.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight || panel.contains(document.activeElement)) {
        complete(panel);
        continue;
      }
      panel.dataset.revealState = 'revealing';
      seen.add(panel);

      const recovery = createNetRecovery({ source: panel, scope: 'section', strength: 1 });
      const tiles = createRevealTiles(panel);
      active = { target: panel, recovery, tiles, start: performance.now(), phase: -1 };
      tick();
      if (active) loop.start();
      return;
    }
  };
  const tick = () => {
    if (!active) return;
    const progress = Math.min(1, (performance.now() - active.start) / DURATION),
      phase = Math.floor(progress * 18);
    if (phase === active.phase) return;
    active.phase = phase;
    const rect = active.target.getBoundingClientRect();
    if (progress === 1 || rect.bottom <= 0 || rect.top >= innerHeight || document.hidden) {
      finish();
      advance();
      return;
    }
    active.recovery.update(progress);
    active.tiles.update(progress);
  };
  const loop = createFrameLoop(tick);
  const request = (panel: HTMLElement) => {
    if (disposed || seen.has(panel) || queue.includes(panel)) return;
    queue.push(panel);
    advance();
  };
  const observePanels = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          request(entry.target as HTMLElement);
        }
      },
      { rootMargin: `0px 0px -${Math.round(innerHeight * 0.28)}px 0px` },
    );
    for (const panel of panels)
      if (!seen.has(panel) && !queue.includes(panel)) observer.observe(panel);
  };
  const start = () => {
    if (started || disposed || document.documentElement.dataset.boot) return;
    started = true;
    bootObserver.disconnect();
    const pending = new Set(
      panels.filter((panel) => !seen.has(panel) && panel.getBoundingClientRect().bottom > 0),
    );
    for (const panel of panels) {
      if (!pending.has(panel)) {
        complete(panel);
        continue;
      }
      panel.dataset.revealState = 'pending';
    }
    observePanels();
  };
  const bootObserver = new MutationObserver(start);
  if (document.documentElement.dataset.boot)
    bootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-boot'],
    });
  else start();
  document.addEventListener(
    'focusin',
    (event) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>('[data-reveal]') : null;
      if (!target) return;
      if (active?.target === target) finish();
      else complete(target);
      advance();
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) finish();
      else advance();
    },
    { signal: abort.signal },
  );
  window.addEventListener(
    'resize',
    viewportResize(() => {
      finish();
      if (started) observePanels();
      advance();
    }),
    { signal: abort.signal, passive: true },
  );
  return () => {
    disposed = true;
    abort.abort();
    bootObserver.disconnect();
    queue.length = 0;
    observer?.disconnect();
    finish();
    panels.forEach((panel) => {
      delete panel.dataset.revealState;
    });
  };
}
