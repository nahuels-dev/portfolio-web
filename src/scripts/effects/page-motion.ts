import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { initScrollGlitch } from './scroll-glitch';
import { initAccordionGlitch } from './accordion-glitch';
import { initFloatingNavGlitch } from './floating-nav-glitch';

export function initPageMotion() {
  let lenis: Lenis | undefined;
  const media = matchMedia('(prefers-reduced-motion: no-preference)');
  let disposeEffects: (() => void) | undefined;
  const revealedPanels = new WeakSet<HTMLElement>();
  const start = () => {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, autoRaf: true });
    if (
      document.documentElement.dataset.boot ||
      document.querySelector('[data-contact-dialog][open]')
    )
      lenis.stop();
    const disposeReveals = initScrollGlitch(revealedPanels);
    const disposeAccordions = initAccordionGlitch();
    const disposeFloatingNavGlitch = initFloatingNavGlitch();
    return () => {
      disposeReveals();
      disposeAccordions();
      disposeFloatingNavGlitch();
      lenis?.destroy();
      lenis = undefined;
    };
  };

  const syncMotion = () => {
    if (media.matches) disposeEffects ??= start();
    else {
      disposeEffects?.();
      disposeEffects = undefined;
    }
  };
  media.addEventListener('change', syncMotion);
  syncMotion();
  return {
    pause: () => lenis?.stop(),
    resume: () => lenis?.start(),
    refresh() {
      lenis?.resize();
    },
    scrollTo(target: HTMLElement, onComplete: () => void) {
      if (!lenis) return false;
      lenis.scrollTo(target, { offset: -18, onComplete });
      return true;
    },
    destroy: () => {
      media.removeEventListener('change', syncMotion);
      disposeEffects?.();
      disposeEffects = undefined;
    },
  };
}

export type PageMotion = ReturnType<typeof initPageMotion>;
