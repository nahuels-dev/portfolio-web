import type { ContactElements } from './form-elements';
import type { ContactState } from './form-state';
import type { ContactView } from './form-view';
import {
  ContactError,
  generateContactKey,
  sendContactMessage,
  type ContactPayload,
} from '../../services/contact';

export function bindContactSubmission(
  elements: ContactElements,
  state: ContactState,
  view: ContactView,
  signal: AbortSignal,
) {
  const {
    dialog,
    form,
    back,
    submit,
    message,
    name,
    email,
    copy,
    feedback,
    submitLabel,
    again,
    inputs,
  } = elements;
  const { showFeedback, selectionLabel, render, validate } = view;
  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      if (state.sending || state.sent) return;
      if (state.current < 2) {
        if (validate()) {
          state.current++;
          render();
        }
        return;
      }
      for (let step = 0; step < 3; step++) {
        if (!validate(step)) {
          if (state.current !== step) {
            state.current = step;
            render();
            validate(step);
          }
          return;
        }
      }
      const payload: ContactPayload = {
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim(),
        service: selectionLabel(),
        lang: dialog.dataset.lang === 'en' ? 'en' : 'es',
      };
      const serialized = JSON.stringify(payload);
      if (state.attempt?.body !== serialized)
        state.attempt = { body: serialized, key: generateContactKey() };
      state.sending = true;
      inputs.forEach((input) => {
        input.disabled = true;
      });
      submit.disabled = back.disabled = true;
      form.setAttribute('aria-busy', 'true');
      submitLabel.textContent = copy.sending;
      showFeedback(copy.sending, 'sending');
      try {
        await sendContactMessage(payload, state.attempt.key);
        state.sent = true;
        document.dispatchEvent(new Event('portfolio:contact-sent'));
        state.attempt = undefined;
        showFeedback(copy.success, 'success');
        submitLabel.textContent = copy.sent;
        submit.hidden = back.hidden = true;
        again.hidden = false;
      } catch (cause) {
        const text =
          cause instanceof ContactError && cause.kind === 'timeout'
            ? copy.timeoutError
            : cause instanceof ContactError && cause.kind === 'rate-limit'
              ? copy.rateLimitError
              : copy.sendError;
        showFeedback(text, 'error');
        submitLabel.textContent = copy.retry;
      } finally {
        state.sending = false;
        form.removeAttribute('aria-busy');
        inputs.forEach((input) => {
          input.disabled = state.sent;
        });
        submit.disabled = state.sent;
        back.disabled = false;
        if (dialog.open) feedback.focus({ preventScroll: true });
      }
    },
    { signal },
  );
}
