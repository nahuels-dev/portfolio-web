interface Options {
  onHeaderHidden(): void;
}

export function initFloatingNav(options: Options): () => void {
  const nav = document.querySelector<HTMLElement>('[data-floating-nav]');
  const header = document.querySelector<HTMLElement>('.header');
  const footer = document.querySelector<HTMLElement>('.footer');
  const button = nav?.querySelector<HTMLButtonElement>('[data-floating-toggle]');
  const panel = nav?.querySelector<HTMLElement>('[data-floating-panel]');
  if (!nav || !header || !footer || !button || !panel) return () => {};
  const abort = new AbortController();
  const mobile = matchMedia('(max-width: 760px)');
  const control = header.querySelector<HTMLElement>('[data-menu-toggle]') ?? header;
  let headerGone = false;
  let footerVisible = false;

  const setOpen = (open: boolean, focus = false) => {
    open = open && mobile.matches;
    const focusedInside = panel.contains(document.activeElement);
    if (!open) nav.dispatchEvent(new Event('portfolio:floating-nav-panel-hide'));
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute(
      'aria-label',
      (open ? button.dataset.labelClose : button.dataset.labelOpen) ?? 'Menu',
    );
    nav.toggleAttribute('data-floating-open', open);
    panel.toggleAttribute('data-floating-panel-open', open);
    panel.inert = mobile.matches && !open;
    if (mobile.matches && !open) panel.setAttribute('aria-hidden', 'true');
    else panel.removeAttribute('aria-hidden');
    if (open) {
      nav.dispatchEvent(new Event('portfolio:floating-nav-panel-show'));
      if (focus) panel.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    } else if ((focus || focusedInside) && mobile.matches && !nav.hidden) {
      button.focus({ preventScroll: true });
    }
  };
  const breakpointChanged = () => {
    const wasButton = document.activeElement === button;
    setOpen(false);
    if (wasButton && !mobile.matches && !nav.hidden)
      panel.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  };
  setOpen(false);
  mobile.addEventListener('change', breakpointChanged);
  button.addEventListener(
    'click',
    (event) => {
      setOpen(button.getAttribute('aria-expanded') !== 'true', event.detail === 0);
    },
    { signal: abort.signal },
  );
  panel.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) setOpen(false);
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      if (
        button.getAttribute('aria-expanded') === 'true' &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      )
        setOpen(false);
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setOpen(false, true);
      }
    },
    { signal: abort.signal },
  );

  const restoreFocus = () => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !nav.contains(focused)) return;
    const hash =
      focused instanceof HTMLAnchorElement
        ? focused.hash
        : panel.querySelector<HTMLAnchorElement>('a[aria-current]')?.hash;
    const region = headerGone ? footer : header;
    const destination = [...region.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].find(
      (link) => link.hash === hash && link.getClientRects().length > 0,
    );
    (destination ?? (headerGone ? footer.querySelector<HTMLAnchorElement>('a') : control))?.focus({
      preventScroll: true,
    });
  };
  const sync = () => {
    const visible = headerGone && !footerVisible && !document.documentElement.dataset.boot;
    if (visible === !nav.hidden) return;
    if (!visible) {
      restoreFocus();
      setOpen(false);
      nav.dispatchEvent(new Event('portfolio:floating-nav-hide'));
    }
    nav.hidden = !visible;
    document.documentElement.toggleAttribute('data-floating-nav-visible', visible);
    if (visible) nav.dispatchEvent(new Event('portfolio:floating-nav-show'));
  };
  const headerObserver = new IntersectionObserver(([entry]) => {
    const gone = entry.boundingClientRect.bottom <= 0;
    const focused = document.activeElement;
    const moveFocus =
      gone &&
      !headerGone &&
      (header.contains(focused) || document.querySelector('#mobile-menu')?.contains(focused));
    if (gone && !headerGone) options.onHeaderHidden();
    headerGone = gone;
    sync();
    if (moveFocus && !nav.hidden)
      (mobile.matches ? button : panel.querySelector<HTMLAnchorElement>('a'))?.focus({
        preventScroll: true,
      });
  });
  const footerObserver = new IntersectionObserver(([entry]) => {
    footerVisible = entry.isIntersecting;
    sync();
  });
  const bootObserver = new MutationObserver(sync);
  headerObserver.observe(control);
  footerObserver.observe(footer);
  bootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-boot'],
  });
  return () => {
    headerObserver.disconnect();
    footerObserver.disconnect();
    bootObserver.disconnect();
    abort.abort();
    mobile.removeEventListener('change', breakpointChanged);
    nav.dispatchEvent(new Event('portfolio:floating-nav-hide'));
    restoreFocus();
    setOpen(false);
    nav.hidden = true;
    document.documentElement.removeAttribute('data-floating-nav-visible');
  };
}
