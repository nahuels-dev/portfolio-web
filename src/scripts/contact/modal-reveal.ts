import { createNetRecovery, type NetRecovery } from '../loading/net-recovery';
import { createRevealTiles, type RevealTiles } from '../effects/reveal-tiles';

export function createModalReveal(dialog: HTMLDialogElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 520;
  let frame = 0;
  let active:
    { recovery: NetRecovery; tiles: RevealTiles; start: number; phase: number } | undefined;
  const finish = () => {
    cancelAnimationFrame(frame);
    if (active) {
      active.recovery.destroy();
      active.tiles.destroy();
      active = undefined;
    }
    delete dialog.dataset.contactReveal;
  };
  const tick = () => {
    if (!active) return;
    const progress = Math.min(1, (performance.now() - active.start) / duration);
    if (progress === 1 || !dialog.open || document.hidden || reduced.matches) {
      finish();
      return;
    }
    const phase = Math.floor(progress * 18);
    if (phase !== active.phase) {
      active.phase = phase;
      active.recovery.update(progress);
      active.tiles.update(progress);
    }
    frame = requestAnimationFrame(tick);
  };
  return {
    play(source: HTMLElement, kind: 'opening' | 'step') {
      finish();
      if (reduced.matches || !dialog.open || document.hidden) return;

      const recovery = createNetRecovery({
        source,
        scope: 'fixed',
        strength: 1,
        className: 'net-recovery--contact',
        host: dialog,
      });
      const tiles = createRevealTiles(source, { fixed: true, host: dialog });
      active = { recovery, tiles, start: performance.now(), phase: -1 };
      dialog.dataset.contactReveal = kind;
      tick();
    },
    finish,
    reposition() {
      if (!active) return;
      active.recovery.reposition();
      active.tiles.reposition();
    },
  };
}
