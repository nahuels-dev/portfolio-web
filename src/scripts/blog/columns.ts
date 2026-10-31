const preferenceKey = 'blog-columns';

export function initBlogColumns(root: HTMLElement) {
  const controls = root.querySelector<HTMLElement>('[data-blog-columns]')!;
  const results = root.querySelector<HTMLElement>('[data-blog-results]')!;
  const buttons = [...controls.querySelectorAll<HTMLButtonElement>('button[data-columns]')];
  const images = results.querySelectorAll<HTMLImageElement | HTMLSourceElement>(
    'picture img, picture source',
  );
  const breakpoints = [761, 1100, 1360].map((width) => matchMedia(`(min-width: ${width}px)`));
  const abort = new AbortController();
  let requested = 2;
  try {
    const saved = Number(localStorage.getItem(preferenceKey));
    if ([2, 3, 4].includes(saved)) requested = saved;
  } catch {}

  const render = () => {
    const capacity = 1 + breakpoints.filter((query) => query.matches).length;
    const columns = Math.min(requested, capacity);
    results.dataset.columns = String(columns);
    images.forEach((image) => (image.sizes = `${90 / columns}vw`));
    for (const button of buttons) {
      const value = Number(button.dataset.columns);
      button.disabled = value > capacity;
      button.setAttribute('aria-pressed', String(value === columns));
    }
    document.dispatchEvent(new Event('portfolio:layout-change'));
  };

  for (const button of buttons)
    button.addEventListener(
      'click',
      () => {
        requested = Number(button.dataset.columns);
        try {
          localStorage.setItem(preferenceKey, String(requested));
        } catch {}
        render();
      },
      { signal: abort.signal },
    );
  for (const query of breakpoints)
    query.addEventListener('change', render, { signal: abort.signal });
  controls.hidden = false;
  render();

  return () => abort.abort();
}
