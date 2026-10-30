import { glitchBounds } from '../glitch-bounds';
import type { SurfaceSnapshot } from './types';
import { polygon } from './polygon';

export function snapshotCard(
  target: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
  intensity: number,
): SurfaceSnapshot {
  const shape = style.clipPath;
  const background = style.backgroundColor;
  const images = [...target.querySelectorAll<HTMLImageElement>('img')].map((image) => ({
    image,
    rect: image.getBoundingClientRect(),
  }));

  const labels: { rect: DOMRect; text: string; color: string; font: string }[] = [];
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode,
      parent = node.parentElement;
    if (!parent || parent.closest('svg,[aria-hidden="true"]')) continue;
    const computed = getComputedStyle(parent);
    if (computed.visibility === 'hidden' || computed.display === 'none') continue;
    for (const word of (node.textContent || '').matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(node, word.index!);
      range.setEnd(node, word.index! + word[0].length);
      const bounds = range.getBoundingClientRect();
      if (!bounds.width || !bounds.height) continue;
      labels.push({
        rect: bounds,
        text: computed.textTransform === 'uppercase' ? word[0].toUpperCase() : word[0],
        color: computed.color,
        font: `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`,
      });
    }
  }
  const vectors = [...target.querySelectorAll<SVGSVGElement>('svg')].map((svg) => ({
    rect: svg.getBoundingClientRect(),
    box: svg.viewBox.baseVal,
    paths: [...svg.querySelectorAll('path')].map((path) => {
      const computed = getComputedStyle(path);
      return {
        path: new Path2D(path.getAttribute('d') || ''),
        fill: computed.fill,
        stroke: computed.stroke,
        width: parseFloat(computed.strokeWidth) || 1.6,
      };
    }),
  }));
  return {
    element: target,
    intensity,
    rect,
    bounds: glitchBounds(rect),
    rasterize() {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(
        devicePixelRatio || 1,
        1.5,
        Math.sqrt(262144 / (rect.width * rect.height)),
      );
      canvas.width = Math.ceil(rect.width * ratio);
      canvas.height = Math.ceil(rect.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Control canvas unavailable');
      ctx.scale(ratio, ratio);
      ctx.clip(polygon(shape, rect.width, rect.height));
      const card = target.matches('.project-card,.service-card');
      if (background !== 'rgba(0, 0, 0, 0)' || card) {
        ctx.fillStyle = background === 'rgba(0, 0, 0, 0)' ? '#09090f' : background;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
      for (const entry of images)
        if (entry.image.complete && entry.image.naturalWidth) {
          const cover = getComputedStyle(entry.image).objectFit === 'cover';
          const scale = Math.max(
            entry.rect.width / entry.image.naturalWidth,
            entry.rect.height / entry.image.naturalHeight,
          );
          const cropWidth = cover ? entry.rect.width / scale : entry.image.naturalWidth;
          const cropHeight = cover ? entry.rect.height / scale : entry.image.naturalHeight;
          const topAligned = getComputedStyle(entry.image).objectPosition.includes('0%');
          ctx.drawImage(
            entry.image,
            (entry.image.naturalWidth - cropWidth) / 2,
            topAligned ? 0 : (entry.image.naturalHeight - cropHeight) / 2,
            cropWidth,
            cropHeight,
            entry.rect.left - rect.left,
            entry.rect.top - rect.top,
            entry.rect.width,
            entry.rect.height,
          );
        }
      for (const label of labels) {
        ctx.fillStyle = label.color;
        ctx.font = label.font;
        ctx.textBaseline = 'alphabetic';
        const metrics = ctx.measureText(label.text);
        const baseline =
          label.rect.top -
          rect.top +
          (label.rect.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) /
            2;
        ctx.fillText(label.text, label.rect.left - rect.left, baseline, label.rect.width);
      }
      for (const vector of vectors) {
        if (!vector.rect.width || !vector.rect.height || !vector.box.width || !vector.box.height)
          continue;
        ctx.save();
        ctx.translate(vector.rect.left - rect.left, vector.rect.top - rect.top);
        ctx.scale(vector.rect.width / vector.box.width, vector.rect.height / vector.box.height);
        ctx.translate(-vector.box.x, -vector.box.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const part of vector.paths) {
          if (part.fill !== 'none') {
            ctx.fillStyle = part.fill;
            ctx.fill(part.path);
          }
          if (part.stroke !== 'none') {
            ctx.strokeStyle = part.stroke;
            ctx.lineWidth = part.width;
            ctx.stroke(part.path);
          }
        }
        ctx.restore();
      }
      return canvas;
    },
  };
}
