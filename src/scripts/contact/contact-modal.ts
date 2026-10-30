import { createModalReveal } from './modal-reveal';
import { readContactElements } from './form-elements';
import { createContactState } from './form-state';
import { createContactView } from './form-view';
import { bindContactForm } from './form-controller';
import { bindContactSubmission } from './form-submission';
import { bindContactDialog } from './dialog-controller';

export function initContactModal(): () => void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-contact-dialog]');
  if (!dialog) return () => {};
  const abort = new AbortController();
  const { signal } = abort;
  const elements = readContactElements(dialog);
  const state = createContactState();
  const reveal = createModalReveal(dialog);
  const view = createContactView(elements, state, reveal);
  bindContactForm(elements, state, view, signal);
  bindContactSubmission(elements, state, view, signal);
  const disposeDialog = bindContactDialog(dialog, view.render, reveal, signal);
  dialog.dataset.ready = 'true';
  return () => {
    abort.abort();
    disposeDialog();
    delete dialog.dataset.ready;
  };
}
