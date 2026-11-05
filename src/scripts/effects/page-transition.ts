import { createNetRecovery, type NetRecovery } from '../loading/net-recovery';
import { capturePageSnapshot, type PageSnapshot } from './page-snapshot';
import { createPageTransitionMask } from './page-transition-mask';
import { packetNoise } from './corruption-field';
import { SIGNAL_COLORS } from './signal-palette';

declare global {
  interface Window {
    __pageViewTransition?: ViewTransition;
    __pageEntryPending?: boolean;
    __pageEntryDeadline?: number;
    __pageSnapshotFrame?: HTMLIFrameElement;
    __capturePageSnapshot?: () => PageSnapshot | undefined;
  }
}

export function initPageTransition(): () => void {
  const abort = new AbortController();
  const { signal } = abort;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window.__capturePageSnapshot = capturePageSnapshot;
  let frame = 0;
  let entryFrame = 0;
  let waitTimer = 0;
  let active:
    | { transition?: ViewTransition; recovery: NetRecovery; start: number; ending?: boolean }
    | undefined;

  const clearPending = () => {
    clearTimeout(window.__pageEntryDeadline);
    window.__pageEntryPending = false;
    delete root.dataset.pageEntry;
  };
  const finish = () => {
    cancelAnimationFrame(frame);
    clearTimeout(waitTimer);
    active?.recovery.destroy();
    window.__pageSnapshotFrame?.remove();
    delete window.__pageSnapshotFrame;
    clearPending();
    if (active?.transition) {
      active.ending = true;
      root.style.setProperty('--page-old-mask', 'inset(100%)');
      active.transition.skipTransition();
      return;
    }
    active = undefined;
    delete root.dataset.pageTransition;
    delete root.dataset.pageTransitionMode;
    for (const name of ['--page-old-mask', '--page-old-x', '--page-old-y'])
      root.style.removeProperty(name);
  };

  const play = (transition?: ViewTransition) => {
    if (active) return;
    const source = document.querySelector<HTMLElement>(
      '.page-shell, .error-document > [data-boot-content]',
    );
    if (!source || document.hidden || reduced.matches) {
      finish();
      return;
    }
    const timing = getComputedStyle(root).getPropertyValue('--page-transition-duration').trim();
    const duration = parseFloat(timing) * (timing.endsWith('ms') ? 1 : 1000);
    if (!Number.isFinite(duration) || duration <= 0) {
      finish();
      return;
    }

    clearPending();
    const previous = window.__pageSnapshotFrame;
    const mask = createPageTransitionMask(innerWidth, innerHeight);
    try {
      active = {
        transition,
        recovery: createNetRecovery({ source, strength: 1.4 }),
        start: Infinity,
      };
    } catch {
      finish();
      return;
    }
    const reveal = active;
    root.dataset.pageTransition = 'active';
    root.dataset.pageTransitionMode = transition ? 'native' : previous ? 'snapshot' : 'incoming';
    let lastPhase = -1;

    const update = (progress: number) => {
      const phase = Math.floor(progress * 18);
      if (phase === lastPhase) return;
      lastPhase = phase;
      const clip = mask(progress);
      const strength = Math.max(0, 1 - progress / 0.9);
      const x = Math.round((packetNoise(phase * 31) - 0.5) * 30 * strength);
      const y = Math.round((packetNoise(phase * 47) - 0.5) * 5 * strength);
      root.style.setProperty('--page-old-mask', clip);
      root.style.setProperty('--page-old-x', `${x}px`);
      root.style.setProperty('--page-old-y', `${y}px`);
      if (previous) {
        previous.style.clipPath = clip;
        previous.style.transform = `translate(${x}px,${y}px)`;
        previous.style.filter = `drop-shadow(${6 * strength}px 0 ${SIGNAL_COLORS.violet})`;
      }
      reveal.recovery.update(progress);
    };
    update(0);

    const tick = (now: number) => {
      if (active !== reveal) return;
      const progress = Math.min(1, (now - reveal.start) / duration);
      if (progress >= 1 || document.hidden || reduced.matches) {
        finish();
        return;
      }
      update(progress);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (active !== reveal || reveal.ending || Number.isFinite(reveal.start)) return;
      clearTimeout(waitTimer);
      if (!reveal.transition && previous) previous.style.visibility = 'visible';
      reveal.start = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const startSnapshot = () => {
      if (active !== reveal || reveal.ending) return;
      reveal.transition = undefined;
      root.dataset.pageTransitionMode = previous ? 'snapshot' : 'incoming';
      if (!previous) {
        start();
        return;
      }
      const previousFrame = previous;
      previousFrame.hidden = false;
      const loaded = () => {
        if (active !== reveal) return;
        previousFrame.style.visibility = 'visible';
        void (previousFrame.contentDocument?.fonts.ready ?? Promise.resolve()).then(start, start);
      };
      if (
        previousFrame.contentDocument?.URL === 'about:srcdoc' &&
        previousFrame.contentDocument.readyState === 'complete'
      )
        loaded();
      else previousFrame.addEventListener('load', loaded, { once: true, signal });
      waitTimer = window.setTimeout(start, 600);
    };

    if (transition) {
      if (previous) previous.hidden = true;
      void transition.ready.then(start, startSnapshot);
      void transition.finished
        .finally(() => {
          if (active?.transition === transition) {
            active.transition = undefined;
            finish();
          }
        })
        .catch(() => {});
    } else startSnapshot();
  };

  const scheduleEntry = () => {
    if (!window.__pageEntryPending || document.hidden || document.readyState === 'loading') return;
    cancelAnimationFrame(entryFrame);
    entryFrame = requestAnimationFrame(() => {
      if (window.__pageEntryPending) play(window.__pageViewTransition);
    });
  };
  window.addEventListener('pagereveal', scheduleEntry, { signal });
  window.addEventListener('pageshow', scheduleEntry, { signal });
  document.addEventListener('DOMContentLoaded', scheduleEntry, { signal });
  document.addEventListener('prerenderingchange', scheduleEntry, { signal });
  window.addEventListener('pagehide', finish, { signal });
  window.addEventListener(
    'resize',
    () => {
      if (active) finish();
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) finish();
    },
    { signal },
  );
  reduced.addEventListener(
    'change',
    () => {
      if (reduced.matches) finish();
    },
    { signal },
  );
  scheduleEntry();

  return () => {
    abort.abort();
    cancelAnimationFrame(entryFrame);
    finish();
    if (window.__capturePageSnapshot === capturePageSnapshot) delete window.__capturePageSnapshot;
  };
}
