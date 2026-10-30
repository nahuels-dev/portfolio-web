import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScrollGlitch } from './scroll-glitch';
import { initAccordionGlitch } from './accordion-glitch';
import { initFloatingNavGlitch } from './floating-nav-glitch';

export function initPageMotion() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  let lenis: Lenis | undefined;
  const media = matchMedia('(prefers-reduced-motion: no-preference)');
  let disposeEffects: (() => void) | undefined;
  const revealedPanels = new WeakSet<HTMLElement>();
  const start = () => {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    if (
      document.documentElement.dataset.boot ||
      document.querySelector('[data-contact-dialog][open]')
    )
      lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const disposeReveals = initScrollGlitch(revealedPanels);
    const disposeAccordions = initAccordionGlitch();
    const disposeFloatingNavGlitch = initFloatingNavGlitch();
    return () => {
      disposeReveals();
      disposeAccordions();
      disposeFloatingNavGlitch();
      gsap.ticker.remove(tick);
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
