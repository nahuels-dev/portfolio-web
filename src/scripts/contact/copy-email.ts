export function initCopyEmail() {
  const abort = new AbortController();
  const { signal } = abort;
  const copyButton = document.querySelector<HTMLButtonElement>('[data-copy-email]');
  copyButton?.addEventListener(
    'click',
    async () => {
      const feedback = document.querySelector<HTMLElement>('[data-copy-feedback]');
      if (!feedback) return;
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copyEmail || '');
        feedback.textContent = copyButton.dataset.copied || 'Copied';
      } catch {
        feedback.textContent = copyButton.dataset.error || 'Please use the email link.';
      }
    },
    { signal },
  );

  return () => abort.abort();
}
