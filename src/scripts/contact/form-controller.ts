import type { ContactElements } from './form-elements';
import type { ContactState } from './form-state';
import type { ContactView } from './form-view';

export function bindContactForm(
  elements: ContactElements,
  state: ContactState,
  view: ContactView,
  signal: AbortSignal,
) {
  const {
    dialog,
    form,
    back,
    next,
    message,
    name,
    email,
    copy,
    feedback,
    submitLabel,
    again,
    inputs,
  } = elements;
  const { error, showFeedback, render, validate } = view;
  next.addEventListener(
    'click',
    () => {
      if (validate()) {
        state.current = Math.min(2, state.current + 1);
        render();
      }
    },
    { signal },
  );
  back.addEventListener(
    'click',
    () => {
      state.current = Math.max(0, state.current - 1);
      render();
    },
    { signal },
  );
  again.addEventListener(
    'click',
    () => {
      if (state.sending) return;
      form.reset();
      inputs.forEach((input) => {
        input.disabled = false;
        input.removeAttribute('aria-invalid');
      });
      form.querySelectorAll<HTMLElement>('.contact-modal__error').forEach((node) => {
        node.hidden = true;
        node.textContent = '';
      });
      state.sent = false;
      state.attempt = undefined;
      state.current = 0;
      showFeedback('', 'success');
      submitLabel.textContent = copy.send;
      dialog.querySelector<HTMLOutputElement>('[data-contact-count]')!.value = '0 / 4000';
      render();
    },
    { signal },
  );
  form.addEventListener(
    'input',
    () => {
      if (!state.sending && !state.sent && feedback.dataset.state === 'error') {
        showFeedback('', 'error');
        submitLabel.textContent = copy.send;
      }
    },
    { signal },
  );
  form
    .querySelectorAll<HTMLInputElement>('input[name=service]')
    .forEach((input) =>
      input.addEventListener('change', () => error('contact-service-error', ''), { signal }),
    );
  message.addEventListener(
    'input',
    () => {
      dialog.querySelector<HTMLOutputElement>('[data-contact-count]')!.value =
        `${message.value.length} / 4000`;
      error('contact-message-error', '', message);
    },
    { signal },
  );
  name.addEventListener(
    'blur',
    () => error('contact-name-error', name.value.trim() ? '' : copy.nameError, name),
    { signal },
  );
  email.addEventListener(
    'blur',
    () => error('contact-email-error', email.validity.valid ? '' : copy.emailError, email),
    { signal },
  );
  name.addEventListener('input', () => error('contact-name-error', '', name), { signal });
  email.addEventListener('input', () => error('contact-email-error', '', email), { signal });
}
