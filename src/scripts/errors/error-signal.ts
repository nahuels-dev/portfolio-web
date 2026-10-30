import type { SignalAccent } from '../loading/signal-accent';

export function createErrorSignal(root: HTMLElement) {
  const mask = document.createElement('canvas');
  mask.width = 900;
  mask.height = 360;
  const ink = mask.getContext('2d');
  if (!ink) throw new Error('Glyph mask unavailable');
  const accent: SignalAccent = {
    mask,
    revision: 0,
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    reveal: 0,
    strength: 3,
  };
  let rect = root.getBoundingClientRect(),
    pageLeft = rect.left + scrollX,
    pageTop = rect.top + scrollY,
    started = 0,
    dead = false;
  const resize = () => {
    rect = root.getBoundingClientRect();
    pageLeft = rect.left + scrollX;
    pageTop = rect.top + scrollY;
  };
  const show = (active: boolean) => {
    if (active && accent.revision) root.dataset.ready = '';
    else delete root.dataset.ready;
  };
  return {
    accent,
    resize,
    prepare() {
      if (dead) return;
      const code = root.dataset.errorSignal || '404';
      ink.font = '900 340px Orbitron';
      const fontSize = Math.min(340, (mask.width * 0.9 * 340) / ink.measureText(code).width);
      ink.font = `900 ${fontSize}px Orbitron`;
      ink.textAlign = 'center';
      ink.fillStyle = '#fff';
      ink.filter = 'blur(1.2px)';
      const metrics = ink.measureText(code);
      ink.fillText(
        code,
        450,
        180 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2,
      );
      accent.revision++;
      started = performance.now();
      resize();
    },
    update(now: number, reduced: boolean) {
      if (dead || !accent.revision) return;
      accent.bounds = {
        x: (pageLeft - scrollX) / innerWidth,
        y: (pageTop - scrollY) / innerHeight,
        width: rect.width / innerWidth,
        height: rect.height / innerHeight,
      };
      accent.reveal = reduced ? 1 : Math.min(1, Math.max(0, (now - started) / 1900));
      const phase = accent.reveal >= 1 ? 'formed' : 'assembling';
      if (root.dataset.formation !== phase) root.dataset.formation = phase;
    },
    show,
    destroy() {
      dead = true;
      show(false);
      delete root.dataset.formation;
      mask.width = mask.height = 1;
    },
  };
}
