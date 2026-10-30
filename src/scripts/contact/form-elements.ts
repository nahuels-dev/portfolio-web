export function readContactElements(dialog: HTMLDialogElement) {
  const form = dialog.querySelector<HTMLFormElement>('[data-contact-form]')!;
  const body = dialog.querySelector<HTMLElement>('[data-contact-body]')!;
  const steps = Array.from(dialog.querySelectorAll<HTMLElement>('[data-contact-step]'));
  const back = dialog.querySelector<HTMLButtonElement>('[data-contact-back]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-contact-next]')!;
  const submit = dialog.querySelector<HTMLButtonElement>('[data-contact-submit]')!;
  const message = form.querySelector<HTMLTextAreaElement>('#contact-message')!;
  const name = form.querySelector<HTMLInputElement>('#contact-name')!;
  const email = form.querySelector<HTMLInputElement>('#contact-email')!;
  const copy = JSON.parse(dialog.dataset.copy!) as Record<string, string>;
  const feedback = dialog.querySelector<HTMLElement>('[data-contact-feedback]')!;
  const submitLabel = dialog.querySelector<HTMLElement>('[data-contact-submit-label]')!;
  const again = dialog.querySelector<HTMLButtonElement>('[data-contact-again]')!;
  const inputs = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
  );

  return {
    dialog,
    form,
    body,
    steps,
    back,
    next,
    submit,
    message,
    name,
    email,
    copy,
    feedback,
    submitLabel,
    again,
    inputs,
  };
}

export type ContactElements = ReturnType<typeof readContactElements>;
