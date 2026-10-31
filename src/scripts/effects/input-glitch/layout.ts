import type { ChangedGlyph } from './changes';

export function prepareInputGlitch(input: HTMLInputElement, layer: HTMLElement) {
  const style = getComputedStyle(input);
  layer.style.font = style.font;
  layer.style.letterSpacing = style.letterSpacing;
  layer.style.color = style.color;
  layer.style.left = `${parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth)}px`;
  layer.style.right = `${parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth)}px`;
  layer.style.top = style.borderTopWidth;
  layer.style.bottom = style.borderBottomWidth;
  const createText = (value: string, scroll: number) => {
    const text = document.createElement('span');
    text.className = 'input-glitch__text';
    text.textContent = value;
    text.style.left = `${-scroll}px`;
    layer.append(text);
    return text;
  };
  const text = createText(input.value, input.scrollLeft);
  const exclusions: { start: number; end: number }[] = [];
  return {
    capture(glyph: ChangedGlyph, scroll: number) {
      if (!glyph.text.trim()) return;
      const source = glyph.removed ? createText(glyph.prefix + glyph.text, scroll) : text;
      const range = document.createRange();
      const node = source.firstChild;
      if (!node) return;
      range.setStart(node, glyph.prefix.length);
      range.setEnd(node, glyph.prefix.length + glyph.text.length);
      const bounds = range.getBoundingClientRect();
      const origin = source.getBoundingClientRect();
      const viewport = layer.getBoundingClientRect();
      if (glyph.removed) source.remove();
      if (
        bounds.right <= viewport.left ||
        bounds.left >= viewport.right ||
        (glyph.removed && bounds.left < text.getBoundingClientRect().right - 0.5)
      )
        return;
      const left = bounds.left - origin.left;
      if (!glyph.removed) exclusions.push({ start: left, end: left + bounds.width });
      return {
        source,
        left,
        top: bounds.top - origin.top,
        width: bounds.width,
        height: bounds.height,
      };
    },
    mask() {
      if (!exclusions.length) return;
      const stops = ['#000 0px'];
      for (const { start, end } of exclusions.sort((a, b) => a.start - b.start))
        stops.push(
          `#000 ${start}px`,
          `transparent ${start}px`,
          `transparent ${end}px`,
          `#000 ${end}px`,
        );
      stops.push('#000 100%');
      text.style.maskImage = `linear-gradient(to right, ${stops.join(', ')})`;
    },
  };
}

export type GlyphCapture = NonNullable<
  ReturnType<ReturnType<typeof prepareInputGlitch>['capture']>
>;
