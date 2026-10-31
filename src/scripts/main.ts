import { initHeaderMenu } from './navigation/header-menu';
import { initSectionNavigation } from './navigation/section-navigation';
import { initCopyEmail } from './contact/copy-email';
import { initBootScreen } from './loading/boot-screen';
import { BOOT_TIMING } from './loading/boot-timing';
import { initHoverGlitch } from './effects/hover-glitch';
import { initPortraitReveal } from './effects/portrait-reveal';
import type { PageMotion } from './effects/page-motion';
import { initFloatingNav } from './navigation/floating-nav';
import { initInputGlitches } from './effects/input-glitches';

const headerMenu = initHeaderMenu();

const disposeCopyEmail = initCopyEmail();

let motion: PageMotion | undefined;

let motionPending = false;

let disposed = false;

const pauseForContact = () => motion?.pause();

const refreshLayout = () => motion?.refresh();

const resumeAfterContact = () => {
  if (!document.documentElement.dataset.boot) motion?.resume();
};

document.addEventListener('portfolio:contact-open', pauseForContact);

document.addEventListener('portfolio:contact-close', resumeAfterContact);

document.addEventListener('portfolio:layout-change', refreshLayout);

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

const loadMotion = () => {
  if (disposed || motion || motionPending || motionPreference.matches) return;
  motionPending = true;
  void import('./effects/page-motion')
    .then(({ initPageMotion }) => {
      if (!disposed) {
        motion = initPageMotion();
        if (document.querySelector('[data-contact-dialog][open]')) motion.pause();
      }
    })
    .catch(() => {})
    .finally(() => {
      motionPending = false;
    });
};

const prepareMotion = () => {
  const hero = document.querySelector<HTMLImageElement>('.hero__portrait');
  void Promise.allSettled([document.fonts.ready, hero?.decode() ?? Promise.resolve()]).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(loadMotion));
  });
};

const motionTimer = document.documentElement.dataset.boot
  ? window.setTimeout(
      loadMotion,
      Math.max(0, BOOT_TIMING.duration - 500 - (performance.now() - (window.__bootStartedAt ?? 0))),
    )
  : (prepareMotion(), 0);

document.addEventListener('portfolio:boot-complete', loadMotion, { once: true });

motionPreference.addEventListener('change', loadMotion);

const disposeSectionNavigation = initSectionNavigation({
  onNavigate: () => headerMenu.close(),
  scrollTo: (target, onComplete) => motion?.scrollTo(target, onComplete),
});

const disposeFloatingNav = initFloatingNav({ onHeaderHidden: () => headerMenu.close() });

const disposeBootScreen = initBootScreen({
  pause: () => motion?.pause(),
  resume: () => motion?.resume(),
});

const disposeHoverGlitch = initHoverGlitch();
const disposePortraitReveal = initPortraitReveal();
const disposeInputGlitches = initInputGlitches();

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposed = true;
    clearTimeout(motionTimer);
    document.removeEventListener('portfolio:boot-complete', loadMotion);
    motionPreference.removeEventListener('change', loadMotion);
    document.removeEventListener('portfolio:contact-open', pauseForContact);
    document.removeEventListener('portfolio:contact-close', resumeAfterContact);
    document.removeEventListener('portfolio:layout-change', refreshLayout);
    motion?.destroy();
    headerMenu.destroy();
    disposeCopyEmail();
    disposeSectionNavigation();
    disposeFloatingNav();
    disposeBootScreen();
    disposeHoverGlitch();
    disposePortraitReveal();
    disposeInputGlitches();
  });
