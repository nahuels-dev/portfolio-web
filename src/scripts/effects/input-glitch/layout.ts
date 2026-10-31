import type { ChangedGlyph, TextSnapshot } from './changes';
import { createTextSurface } from './surface';
import type { TextControl } from './types';

export function prepareInputGlitch(input: TextControl, layer: HTMLElement, previous: TextSnapshot) {
  const createText = createTextSurface(input, layer);
  const text = createText(input.value, { left: input.scrollLeft, top: input.scrollTop });
  const exclusions: { left: number; top: number; width: number; height: number }[] = [];
  const occupied = document.createRange();
  occupied.selectNodeContents(text);
  const current = [...occupied.getClientRects()];
  const range = document.createRange();
  let oldText: HTMLSpanElement | undefined;
  return {
    capture(glyph: ChangedGlyph) {
      if (!glyph.text.trim()) return;
      const source = glyph.removed
        ? (oldText ??= createText(previous.value, previous.scroll))
        : text;
      const node = source.firstChild;
      if (!node) return;
      range.setStart(node, glyph.prefix.length);
      range.setEnd(node, glyph.prefix.length + glyph.text.length);
      const bounds = range.getBoundingClientRect();
      const origin = source.getBoundingClientRect();
      const viewport = layer.getBoundingClientRect();
      const overlaps = current.some(
        (rect) =>
          bounds.left < rect.right - 0.5 &&
          bounds.right > rect.left + 0.5 &&
          bounds.top < rect.bottom &&
          bounds.bottom > rect.top,
      );
      if (
        bounds.right <= viewport.left ||
        bounds.left >= viewport.right ||
        bounds.bottom <= viewport.top ||
        bounds.top >= viewport.bottom ||
        (glyph.removed && glyph.prefix !== input.value && overlaps)
      )
        return;
      const capture = {
        source,
        left: bounds.left - origin.left,
        top: bounds.top - origin.top,
        width: bounds.width,
        height: bounds.height,
      };
      if (!glyph.removed) exclusions.push(capture);
      return capture;
    },
    mask() {
      oldText?.remove();
      if (!exclusions.length) return;
      const { width, height } = text.getBoundingClientRect();
      const holes = exclusions
        .map(({ left, top, width, height }) => `M${left} ${top}h${width}v${height}h${-width}Z`)
        .join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path fill="white" fill-rule="evenodd" d="M0 0H${width}V${height}H0Z${holes}"/></svg>`;
      text.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      text.style.maskSize = '100% 100%';
    },
  };
}

export type GlyphCapture = NonNullable<
  ReturnType<ReturnType<typeof prepareInputGlitch>['capture']>
>;
