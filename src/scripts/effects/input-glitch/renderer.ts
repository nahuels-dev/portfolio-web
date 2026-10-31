import type { ChangedGlyph } from './changes';
import { enterFrames, exitFrames } from './frames';

export function createInputGlitchRenderer(input: HTMLInputElement) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context || !input.parentElement) return;
  const layer = document.createElement('span');
  layer.className = 'input-glitch';
  layer.setAttribute('aria-hidden', 'true');
  input.parentElement.append(layer);
  const active = new Set<Animation>();
  let pending: { glyph: ChangedGlyph; scroll: number }[] = [];
  let frame = 0;
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pending = [];
    active.forEach((animation) => animation.cancel());
    active.clear();
    layer.replaceChildren();
  };
  const draw = () => {
    frame = 0;
    const style = getComputedStyle(input);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    layer.style.font = style.font;
    layer.style.letterSpacing = style.letterSpacing;
    layer.style.left = `${parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth)}px`;
    layer.style.right = `${parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth)}px`;
    layer.style.top = style.borderTopWidth;
    layer.style.bottom = style.borderBottomWidth;
    const spacing = parseFloat(style.letterSpacing) || 0;
    const width =
      input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    for (const { glyph, scroll } of pending.splice(0)) {
      if (!glyph.text.trim()) continue;
      const left =
        context.measureText(glyph.prefix).width +
        [...glyph.prefix].length * spacing -
        (glyph.removed ? scroll : input.scrollLeft);
      if (left < -context.measureText(glyph.text).width || left > width) continue;
      if (active.size >= 100) {
        const oldest = active.values().next().value;
        oldest?.cancel();
        if (oldest) active.delete(oldest);
      }
      const character = document.createElement('span');
      character.className = `input-glitch__character${glyph.removed ? ' input-glitch__character--removed' : ''}`;
      character.textContent = glyph.text;
      character.style.left = `${left}px`;
      layer.append(character);
      const animation = character.animate(glyph.removed ? exitFrames : enterFrames, {
        duration: glyph.removed ? 150 : 120,
        easing: 'steps(1, end)',
        fill: 'both',
      });
      active.add(animation);
      const finish = () => {
        character.remove();
        active.delete(animation);
      };
      void animation.finished.then(finish, finish);
    }
  };
  return {
    play(glyphs: ChangedGlyph[], scroll: number) {
      clear();
      pending = glyphs.map((glyph) => ({ glyph, scroll }));
      if (pending.length && !frame) frame = requestAnimationFrame(draw);
    },
    clear,
    destroy() {
      clear();
      layer.remove();
    },
  };
}
