import { visibleGlyphs, type ChangedGlyph } from './changes';
import { animateGlyph } from './fragments';
import { prepareInputGlitch } from './layout';

export function createInputGlitchRenderer(input: HTMLInputElement) {
  if (!input.parentElement) return;
  const layer = document.createElement('span');
  layer.className = 'input-glitch';
  layer.setAttribute('aria-hidden', 'true');
  input.parentElement.append(layer);
  let active: Animation[] = [];
  let frame = 0;
  let scroll = 0;
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    active.forEach((animation) => animation.cancel());
    active = [];
    input.classList.remove('is-input-glitching');
    layer.replaceChildren();
  };
  return {
    play(glyphs: ChangedGlyph[], previousScroll: number) {
      clear();
      const visible = visibleGlyphs(glyphs, input.value);
      if (!visible.length || input.selectionStart !== input.selectionEnd) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scroll = input.scrollLeft;
        const layout = prepareInputGlitch(input, layer);
        const seed = Math.floor(performance.now());
        for (const [index, glyph] of visible.entries()) {
          const capture = layout.capture(glyph, previousScroll);
          if (capture)
            active.push(...animateGlyph(layer, capture, glyph.removed, seed + index * 131));
        }
        if (!active.length) return clear();
        layout.mask();
        input.classList.add('is-input-glitching');
        const current = active;
        void Promise.allSettled(current.map((animation) => animation.finished)).then(() => {
          if (active === current) clear();
        });
      });
    },
    reposition() {
      const delta = input.scrollLeft - scroll;
      for (const element of layer.children)
        if (element instanceof HTMLElement)
          element.style.left = `${parseFloat(element.style.left) - delta}px`;
      scroll = input.scrollLeft;
    },
    clear,
    destroy() {
      clear();
      layer.remove();
    },
  };
}
