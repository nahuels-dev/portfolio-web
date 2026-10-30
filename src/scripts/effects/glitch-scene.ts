import { drawCorruption } from './corruption-field';
import { GLITCH_EFFECT } from './glitch-config';
import { SIGNAL_COLORS } from './signal-palette';
import { snapshotButton } from './snapshots/button';
import { snapshotCard } from './snapshots/card';
import type { SurfaceSnapshot } from './snapshots/types';

export type { SurfaceSnapshot } from './snapshots/types';

export interface GlitchScene {
  snapshot: SurfaceSnapshot;
  duration: number;
  showFallback(): void;
  hideFallback(): void;
  destroy(): void;
}

export function createGlitchScene(target: HTMLElement, start: number, seed: number): GlitchScene {
  const { duration, intensity } = GLITCH_EFFECT;
  const surface = target;
  const rect = surface.getBoundingClientRect(),
    style = getComputedStyle(surface);
  const snapshot =
    snapshotButton(surface, rect, style, intensity) ??
    snapshotCard(surface, rect, style, intensity);
  const source = snapshot.rasterize();
  const tinted = document.createElement('canvas');
  tinted.width = source.width;
  tinted.height = source.height;
  const tint = tinted.getContext('2d');
  if (!tint) throw new Error('Glitch tint unavailable');
  tint.drawImage(source, 0, 0);

  const pixels = tint.getImageData(0, 0, tinted.width, tinted.height);
  const violet = [1, 3, 5].map((offset) =>
    parseInt(SIGNAL_COLORS.violet.slice(offset, offset + 2), 16),
  );
  for (let i = 0; i < pixels.data.length; i += 4) {
    const luminance =
      (pixels.data[i] * 0.2126 + pixels.data[i + 1] * 0.7152 + pixels.data[i + 2] * 0.0722) / 255;
    pixels.data[i] = violet[0] * luminance;
    pixels.data[i + 1] = violet[1] * luminance;
    pixels.data[i + 2] = violet[2] * luminance;
  }
  tint.putImageData(pixels, 0, 0);
  const overlay = document.createElement('div');
  overlay.className = 'glitch-fragments';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.inert = true;
  const { left, top, width, height, offsetX, offsetY } = snapshot.bounds;
  Object.assign(overlay.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  const canvas = document.createElement('canvas');
  canvas.className = 'glitch-fragments__canvas';
  const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(262144 / (width * height)));
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Glitch canvas unavailable');
  ctx.scale(ratio, ratio);
  overlay.append(canvas);
  document.body.append(overlay);
  let frame = 0,
    lastPhase = -1,
    visible = true,
    destroyed = false;
  const render = (now: number) => {
    const progress = Math.max(0, (now - start) / duration);
    if (destroyed || !visible || progress >= 1) return;
    const phase = Math.floor(progress * 18);
    if (phase !== lastPhase) {
      lastPhase = phase;
      drawCorruption(
        ctx,
        source,
        offsetX,
        offsetY,
        rect.width,
        rect.height,
        progress,
        seed,
        intensity,
        tinted,
      );
    }
    frame = requestAnimationFrame(render);
  };
  render(performance.now());
  target.classList.add('is-glitch-captured');
  return {
    snapshot,
    duration,
    showFallback() {
      if (destroyed) return;
      visible = true;
      overlay.style.visibility = 'visible';
      cancelAnimationFrame(frame);
      render(performance.now());
    },
    hideFallback() {
      visible = false;
      overlay.style.visibility = 'hidden';
      cancelAnimationFrame(frame);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      overlay.remove();
      target.classList.remove('is-glitch-captured');
    },
  };
}
