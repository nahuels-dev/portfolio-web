import { GLITCH_EFFECT } from '../glitch-config';
import { fragmentFrames } from './frames';
import type { GlyphCapture } from './layout';

export function animateGlyph(
  layer: HTMLElement,
  capture: GlyphCapture,
  removed: boolean,
  seed: number,
) {
  const animations: Animation[] = [];
  const { source, left, top, width, height } = capture;
  const rowHeight = height / 6;
  for (let row = 0; row < 6; row++) {
    const fragment = source.cloneNode(true) as HTMLSpanElement;
    fragment.classList.add('input-glitch__fragment');
    const y = top + row * rowHeight;
    fragment.style.clipPath = `polygon(${left}px ${y}px, ${left + width}px ${y}px, ${left + width}px ${y + rowHeight}px, ${left}px ${y + rowHeight}px)`;
    layer.append(fragment);
    const animation = fragment.animate(fragmentFrames(row, width, seed, removed), {
      duration: GLITCH_EFFECT.duration,
      easing: 'steps(1, end)',
      fill: 'both',
    });
    animations.push(animation);
  }
  return animations;
}
