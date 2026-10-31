import { initInputGlitch } from './input-glitch';
import type { InputGlitch, TextControl } from './input-glitch/types';

const selector =
  'textarea, input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"])';

export function initInputGlitches() {
  const abort = new AbortController();
  const controllers = new Set<InputGlitch>();
  const attach = (input: TextControl) => {
    if (input.closest('[inert], [aria-hidden="true"]')) return;
    const controller = initInputGlitch(input);
    controllers.add(controller);
    return controller;
  };
  document.querySelectorAll<TextControl>(selector).forEach(attach);
  document.addEventListener(
    'focusin',
    (event) => {
      const input = event.target;
      if (
        (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) &&
        input.matches(selector)
      )
        attach(input);
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    'reset',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || event.defaultPrevented) return;
      queueMicrotask(() => {
        if (!abort.signal.aborted)
          form.querySelectorAll<TextControl>(selector).forEach((input) => attach(input)?.sync());
      });
    },
    { signal: abort.signal },
  );
  return () => {
    abort.abort();
    controllers.forEach((controller) => controller.destroy());
  };
}
