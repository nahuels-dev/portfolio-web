interface SectionNavigationOptions {
  onNavigate: () => void;
  scrollTo: (target: HTMLElement, onComplete: () => void) => boolean | undefined;
}

export function initSectionNavigation(options: SectionNavigationOptions) {
  const abort = new AbortController();
  const { signal } = abort;
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener(
      'click',
      (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        event.preventDefault();
        options.onNavigate();
        history.pushState(null, '', hash);
        const focusTarget = () => {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        };
        if (!options.scrollTo(target, focusTarget)) {
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
          focusTarget();
        }
      },
      { signal },
    );
  });

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      '.header__link,[data-menu-link],[data-floating-link]',
    ),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: '-5% 0px -65% 0px', threshold: 0 },
  );
  new Set(links.map((link) => document.getElementById(link.hash.slice(1)))).forEach((section) => {
    if (section) observer.observe(section);
  });

  return () => {
    abort.abort();
    observer.disconnect();
  };
}
