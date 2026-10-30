export function initHeaderMenu() {
  const abort = new AbortController();
  const { signal } = abort;
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('#mobile-menu');
  const closeMenu = (restoreFocus = false) => {
    if (!toggle || !menu) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', toggle.dataset.labelOpen || 'Open menu');
    if (restoreFocus) toggle.focus();
  };
  toggle?.addEventListener(
    'click',
    () => {
      if (!menu) return;
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute(
        'aria-label',
        (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) || 'Menu',
      );
      menu.hidden = !open;
      if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus();
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && menu && !menu.hidden) {
        closeMenu(true);
      }
      if (event.key === 'Tab' && menu && !menu.hidden) {
        const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a'));
        const first = links[0],
          last = links.at(-1);
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle?.focus();
        } else if (event.shiftKey && document.activeElement === toggle) {
          event.preventDefault();
          last?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          toggle?.focus();
        }
      }
    },
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Node;
      if (menu && !menu.hidden && !menu.contains(target) && !toggle?.contains(target)) {
        closeMenu();
      }
    },
    { signal },
  );
  menu
    ?.querySelectorAll('a')
    .forEach((link) => link.addEventListener('click', () => closeMenu(), { signal }));

  const desktop = matchMedia('(min-width: 761px)');
  const onViewportChange = () => {
    if (desktop.matches) {
      const hadFocus = menu?.contains(document.activeElement) || document.activeElement === toggle;
      closeMenu();
      if (hadFocus) document.querySelector<HTMLAnchorElement>('.header__link')?.focus();
    }
  };
  desktop.addEventListener('change', onViewportChange, { signal });
  return { close: closeMenu, destroy: () => abort.abort() };
}
