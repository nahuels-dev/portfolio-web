import { changedGlyphs, type TextSnapshot } from './input-glitch/changes';
import { createInputGlitchRenderer } from './input-glitch/renderer';

export function initInputGlitch(input: HTMLInputElement) {
  const abort = new AbortController();
  const { signal } = abort;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = createInputGlitchRenderer(input);
  const snapshot = (): TextSnapshot => ({
    value: input.value,
    start: input.selectionStart ?? input.value.length,
    end: input.selectionEnd ?? input.value.length,
    scroll: input.scrollLeft,
  });
  let previous = snapshot();
  let composing = false;
  const sync = (animate = false) => {
    const next = snapshot();
    if (animate && !motion.matches && !composing)
      renderer?.play(changedGlyphs(previous, next), previous.scroll);
    else renderer?.clear();
    previous = next;
  };

  input.addEventListener(
    'beforeinput',
    () => {
      if (!composing) previous = snapshot();
    },
    { signal },
  );
  input.addEventListener(
    'input',
    (event) => {
      if (!composing && !event.isComposing) sync(true);
    },
    { signal },
  );
  input.addEventListener(
    'compositionstart',
    () => {
      previous = snapshot();
      composing = true;
      renderer?.clear();
    },
    { signal },
  );
  input.addEventListener(
    'compositionend',
    () => {
      composing = false;
      sync(true);
    },
    { signal },
  );
  input.addEventListener(
    'scroll',
    () => {
      if (!composing && previous.value === input.value) previous.scroll = input.scrollLeft;
    },
    { signal, passive: true },
  );
  input.addEventListener('blur', () => renderer?.clear(), { signal });
  window.addEventListener('resize', () => renderer?.clear(), { signal, passive: true });
  motion.addEventListener('change', () => renderer?.clear(), { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) renderer?.clear();
    },
    { signal },
  );

  return {
    sync,
    destroy() {
      abort.abort();
      renderer?.destroy();
    },
  };
}
