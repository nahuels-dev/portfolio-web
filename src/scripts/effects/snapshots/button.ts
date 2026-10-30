import { glitchBounds } from '../glitch-bounds';
import type { SurfaceSnapshot } from './types';
import { polygon } from './polygon';

export function snapshotButton(
  target: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
  intensity: number,
): SurfaceSnapshot | undefined {
  const label = target.querySelector<HTMLElement>('.button__label');
  if (!target.classList.contains('button') || !label) return;
  const text = label.textContent?.trim().replace(/\s+/g, ' ') || '';
  const labelStyle = getComputedStyle(label),
    labelRect = label.getBoundingClientRect();
  const font = `${labelStyle.fontStyle} ${labelStyle.fontWeight} ${labelStyle.fontSize} ${labelStyle.fontFamily}`;
  const ink = labelStyle.color,
    spacing = labelStyle.letterSpacing;
  const shape = style.clipPath;
  const outline = style.backgroundColor;
  const surface = getComputedStyle(target, '::before').backgroundColor;
  const border = parseFloat(style.borderLeftWidth) || 0;
  const icon = target.querySelector<SVGSVGElement>('svg');
  const iconRect = icon?.getBoundingClientRect();
  const iconInk = icon ? getComputedStyle(icon).color : ink;
  const paths = icon
    ? [...icon.querySelectorAll('path')].map((path) => path.getAttribute('d') || '')
    : [];
  const stroke = Number(icon?.getAttribute('stroke-width') || 1.6);
  return {
    element: target,
    intensity,
    rect,
    bounds: glitchBounds(rect),
    rasterize() {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(rect.width * ratio);
      canvas.height = Math.ceil(rect.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Button canvas unavailable');
      ctx.scale(ratio, ratio);
      ctx.fillStyle = outline;
      ctx.fill(polygon(shape, rect.width, rect.height));
      ctx.save();
      ctx.translate(border, border);
      ctx.fillStyle = surface;
      ctx.fill(polygon(shape, rect.width - border * 2, rect.height - border * 2));
      ctx.restore();
      ctx.font = font;
      ctx.letterSpacing = spacing === 'normal' ? '0px' : spacing;
      ctx.fillStyle = ink;
      ctx.textBaseline = 'alphabetic';
      const metrics = ctx.measureText(text);
      const baseline =
        labelRect.top -
        rect.top +
        (labelRect.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      ctx.fillText(text, labelRect.left - rect.left, baseline);
      if (iconRect) {
        ctx.save();
        ctx.translate(iconRect.left - rect.left, iconRect.top - rect.top);
        ctx.scale(iconRect.width / 24, iconRect.height / 24);
        ctx.strokeStyle = iconInk;
        ctx.lineWidth = stroke;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        paths.forEach((d) => ctx.stroke(new Path2D(d)));
        ctx.restore();
      }
      return canvas;
    },
  };
}
