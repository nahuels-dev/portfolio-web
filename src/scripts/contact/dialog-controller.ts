import type { createModalReveal } from './modal-reveal';

export function bindContactDialog(
  dialog: HTMLDialogElement,
  render: (animate?: boolean) => void,
  reveal: ReturnType<typeof createModalReveal>,
  signal: AbortSignal,
) {
  let opener: HTMLElement | null = null;
  const surface = dialog.querySelector<HTMLElement>(':scope > .contact-modal__shell')!;
  const close = () => dialog.close();
  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, input, textarea, a[href]'),
      ).filter(
        (control) =>
          !control.matches(':disabled') &&
          !control.closest('[inert]') &&
          control.getClientRects().length > 0,
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-contact-open]')
          : null;
      if (
        !trigger ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (dialog.open) return;
      opener = trigger;
      dialog.showModal();
      document.documentElement.classList.add('has-contact-modal');
      document.dispatchEvent(new Event('portfolio:contact-open'));
      render(false);
      reveal.play(surface, 'opening');
    },
    { capture: true, signal },
  );
  dialog.querySelector('[data-contact-close]')!.addEventListener('click', close, { signal });
  dialog.addEventListener(
    'close',
    () => {
      document.documentElement.classList.remove('has-contact-modal');
      document.dispatchEvent(new Event('portfolio:contact-close'));
      reveal.finish();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    },
    { signal },
  );
  window.addEventListener('resize', () => reveal.reposition(), { passive: true, signal });
  window.visualViewport?.addEventListener('resize', () => reveal.reposition(), {
    passive: true,
    signal,
  });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) reveal.finish();
    },
    { signal },
  );
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
    'change',
    (event) => {
      if (event.matches) reveal.finish();
    },
    { signal },
  );
  let outsideDown = false;
  const outside = (event: PointerEvent) => {
    const rect = dialog.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };
  dialog.addEventListener(
    'pointerdown',
    (event) => {
      outsideDown = event.target === dialog && outside(event);
    },
    { signal },
  );
  dialog.addEventListener(
    'pointerup',
    (event) => {
      if (outsideDown && event.target === dialog && outside(event)) close();
      outsideDown = false;
    },
    { signal },
  );

  return () => {
    reveal.finish();
    if (dialog.open) {
      dialog.close();
      document.documentElement.classList.remove('has-contact-modal');
      document.dispatchEvent(new Event('portfolio:contact-close'));
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    }
  };
}
