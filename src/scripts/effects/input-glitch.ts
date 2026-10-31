import { changedGlyphs, type TextSnapshot } from './input-glitch/changes';
import { createInputGlitchRenderer } from './input-glitch/renderer';
import type { InputGlitch, TextControl } from './input-glitch/types';

const instances = new WeakMap<TextControl, InputGlitch>();

export function initInputGlitch(input: TextControl): InputGlitch {
  const existing = instances.get(input);
  if (existing) return existing;
  const abort = new AbortController();
  const { signal } = abort;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = createInputGlitchRenderer(input);
  const snapshot = (): TextSnapshot => ({
    value: input.value,
    start: input.selectionStart ?? input.value.length,
    end: input.selectionEnd ?? 0,
    scroll: { left: input.scrollLeft, top: input.scrollTop },
  });
  let previous = snapshot();
  let composing = false;
  const sync = (animate = false) => {
    const next = snapshot();
    if (animate && !motion.matches && !composing)
      renderer?.play(changedGlyphs(previous, next), previous);
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
      const isComposing = event instanceof InputEvent && event.isComposing;
      if (!composing && !isComposing) sync(true);
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
      renderer?.reposition();
      if (!composing && previous.value === input.value)
        previous.scroll = { left: input.scrollLeft, top: input.scrollTop };
    },
    { signal, passive: true },
  );
  input.addEventListener('keydown', () => renderer?.clear(), { signal });
  input.addEventListener('pointerdown', () => renderer?.clear(), { signal });
  input.addEventListener(
    'select',
    () => {
      if (input.selectionStart !== input.selectionEnd) renderer?.clear();
    },
    { signal },
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

  const controller: InputGlitch = {
    sync,
    destroy() {
      if (instances.get(input) !== controller) return;
      abort.abort();
      renderer?.destroy();
      instances.delete(input);
    },
  };
  instances.set(input, controller);
  return controller;
}
