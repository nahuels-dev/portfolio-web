import { visibleGlyphs, type ChangedGlyph, type TextSnapshot } from './changes';
import { animateGlyph } from './fragments';
import { prepareInputGlitch } from './layout';
import type { TextControl, TextScroll } from './types';

export function createInputGlitchRenderer(input: TextControl) {
  if (!input.parentElement) return;
  const host = document.createElement('span');
  host.className = 'input-glitch-host';
  input.before(host);
  host.append(input);
  const layer = document.createElement('span');
  layer.className = 'input-glitch';
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('data-clarity-mask', 'true');
  host.append(layer);
  let active: Animation[] = [];
  let frame = 0;
  let scroll: TextScroll = { left: 0, top: 0 };
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    active.forEach((animation) => animation.cancel());
    active = [];
    input.classList.remove('is-input-glitching');
    layer.replaceChildren();
  };
  return {
    play(glyphs: ChangedGlyph[], previous: TextSnapshot) {
      clear();
      const visible = visibleGlyphs(glyphs, input.value);
      if (!visible.length || input.selectionStart !== input.selectionEnd) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scroll = { left: input.scrollLeft, top: input.scrollTop };
        const layout = prepareInputGlitch(input, layer, previous);
        const seed = Math.floor(performance.now());
        for (const [index, glyph] of visible.entries()) {
          const capture = layout.capture(glyph);
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
      const dx = input.scrollLeft - scroll.left;
      const dy = input.scrollTop - scroll.top;
      for (const element of layer.children)
        if (element instanceof HTMLElement) {
          element.style.left = `${parseFloat(element.style.left) - dx}px`;
          if (input instanceof HTMLTextAreaElement)
            element.style.top = `${parseFloat(element.style.top) - dy}px`;
        }
      scroll = { left: input.scrollLeft, top: input.scrollTop };
    },
    clear,
    destroy() {
      clear();
      layer.remove();
      host.replaceWith(input);
    },
  };
}
