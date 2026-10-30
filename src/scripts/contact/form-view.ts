import type { ContactElements } from './form-elements';
import type { ContactState } from './form-state';
import type { createModalReveal } from './modal-reveal';

export function createContactView(
  elements: ContactElements,
  state: ContactState,
  reveal: ReturnType<typeof createModalReveal>,
) {
  const {
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
    again,
  } = elements;
  const selected = () => form.querySelector<HTMLInputElement>('input[name=service]:checked');
  const selectionLabel = () =>
    selected()?.closest('label')?.querySelector('span:nth-of-type(2)')?.textContent?.trim() ?? '';
  const error = (id: string, text: string, input?: HTMLInputElement | HTMLTextAreaElement) => {
    const node = dialog.querySelector<HTMLElement>(`#${id}`)!;
    node.textContent = text;
    node.hidden = !text;
    if (input) {
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  };
  const showFeedback = (text: string, state: 'sending' | 'success' | 'error') => {
    feedback.textContent = text;
    feedback.dataset.state = state;
    feedback.hidden = !text;
    if (text && dialog.open) feedback.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  };
  const syncSummary = () => {
    dialog.querySelector<HTMLElement>('[data-contact-selected]')!.textContent = selectionLabel();
    dialog.querySelector<HTMLElement>('[data-contact-review-service]')!.textContent =
      selectionLabel();
    dialog.querySelector<HTMLElement>('[data-contact-review-message]')!.textContent =
      message.value.trim();
  };
  const render = (animate = true) => {
    reveal.finish();
    steps.forEach((step, i) => {
      step.hidden = i !== state.current;
    });
    dialog.querySelectorAll<HTMLElement>('[data-contact-marker]').forEach((marker, i) => {
      if (i === state.current) marker.setAttribute('aria-current', 'step');
      else marker.removeAttribute('aria-current');
      marker.dataset.complete = String(i < state.current);
    });
    back.hidden = state.current === 0 || state.sent;
    back.disabled = state.sending;
    next.hidden = state.current === 2;
    submit.hidden = state.current !== 2 || state.sent;
    submit.disabled = state.sending || state.sent;
    again.hidden = !state.sent;
    dialog.querySelector<HTMLElement>('[data-contact-progress]')!.textContent =
      `0${state.current + 1}`;
    dialog.querySelector<HTMLElement>('[data-contact-bar]')!.style.width =
      `${((state.current + 1) / 3) * 100}%`;
    syncSummary();
    steps[state.current]?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    if (dialog.open) body.scrollTo({ top: 0, behavior: 'instant' });
    if (animate) reveal.play(body, 'step');
  };
  const validate = (step = state.current) => {
    if (step === 0 && !selected()) {
      error('contact-service-error', copy.serviceError);
      form.querySelector<HTMLInputElement>('input[name=service]')?.focus();
      return false;
    }
    if (step === 1 && (message.value.trim().length < 20 || message.value.length > 4000)) {
      error('contact-message-error', copy.messageError, message);
      message.focus();
      return false;
    }
    if (step === 2) {
      const nameValid = name.value.trim().length > 0 && name.value.trim().length <= 100;
      const emailValid =
        email.value.trim().length > 0 && email.value.trim().length <= 254 && email.validity.valid;
      error('contact-name-error', nameValid ? '' : copy.nameError, name);
      error('contact-email-error', emailValid ? '' : copy.emailError, email);
      if (!nameValid || !emailValid) {
        (nameValid ? email : name).focus();
        return false;
      }
    }
    return true;
  };

  return { error, showFeedback, selectionLabel, render, validate };
}

export type ContactView = ReturnType<typeof createContactView>;
