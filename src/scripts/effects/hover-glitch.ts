import { createGlitchScene, type GlitchScene } from './glitch-scene';
import { glitchHost } from './glitch-config';
import { viewportResize } from './viewport-resize';
import type { GlitchRenderer } from './webgpu-glitch';

type Interaction = 'pointer' | 'focus';

export function initHoverGlitch(): () => void {
  const motion = matchMedia('(prefers-reduced-motion: reduce)'),
    pointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const abort = new AbortController(),
    signal = abort.signal;
  let active: HTMLElement | undefined,
    hovered: HTMLElement | undefined,
    scene: GlitchScene | undefined;
  let interaction: Interaction = 'pointer',
    start = 0,
    seed = 0,
    burstTimer = 0,
    viewportFrame = 0,
    generation = 0;
  let point: { x: number; y: number } | undefined,
    engine: GlitchRenderer | undefined,
    preparation: Promise<GlitchRenderer | undefined> | undefined;
  let disposed = false,
    gpuFailed = false;
  const stop = () => {
    clearTimeout(burstTimer);
    engine?.stop();
    scene?.destroy();
    scene = undefined;
    active?.classList.remove('is-glitching');
    active?.removeAttribute('data-glitch-renderer');
    active = undefined;
  };
  const fallback = () => {
    gpuFailed = true;
    engine?.destroy();
    engine = undefined;
    scene?.showFallback();
    if (active && scene?.snapshot) active.dataset.glitchRenderer = 'canvas2d';
  };
  const renderActive = () => {
    if (!engine || !scene?.snapshot || !active) return;
    try {
      if (engine.play(scene.snapshot, start, scene.duration, seed)) {
        scene.hideFallback();
        active.dataset.glitchRenderer = 'webgpu';
      }
    } catch {
      fallback();
    }
  };
  const prepare = () => {
    if (preparation || gpuFailed || !navigator.gpu || !isSecureContext) return;
    const pending = generation;
    preparation = import('./webgpu-glitch')
      .then((m) => m.createGlitchRenderer(fallback))
      .then((renderer) => {
        if (disposed || motion.matches || gpuFailed || pending !== generation) {
          renderer?.destroy();
          if (pending === generation) preparation = undefined;
          return;
        }
        engine = renderer;

        if (active && scene && performance.now() - start < scene.duration - 60) renderActive();
        return renderer;
      })
      .catch(() => {
        if (pending === generation) gpuFailed = true;
        return undefined;
      });
  };
  const play = (target: HTMLElement, mode: Interaction) => {
    if (disposed || motion.matches || document.hidden || !target.isConnected) return;
    stop();
    start = performance.now();
    seed = Math.random() * 100;
    interaction = mode;
    active = target;

    scene = createGlitchScene(target, start, seed);
    target.classList.add('is-glitching');
    target.dataset.glitchRenderer = 'canvas2d';
    if (scene.snapshot) {
      if (engine) renderActive();
      else prepare();
    }
    burstTimer = window.setTimeout(stop, scene.duration);
  };
  const host = glitchHost;
  const within = (target: HTMLElement, related: EventTarget | null) =>
    related instanceof Node && target.contains(related);
  const eligible = (event: PointerEvent) =>
    pointer.matches && (event.pointerType === 'mouse' || event.pointerType === 'pen');
  const enter = (target: HTMLElement | undefined) => {
    if (target === hovered) return;
    hovered = target;
    if (target) play(target, 'pointer');
    else if (interaction === 'pointer') stop();
  };
  const remember = (event: PointerEvent) => {
    point = { x: event.clientX, y: event.clientY };
  };
  const reconcile = () => {
    viewportFrame = 0;
    if (point && pointer.matches && !motion.matches && !document.hidden && !disposed)
      enter(host(document.elementFromPoint(point.x, point.y)));
  };
  const viewportChanged = () => {
    if (point && !viewportFrame) viewportFrame = requestAnimationFrame(reconcile);
  };
  const resized = () => {
    stop();
    hovered = undefined;
    viewportChanged();
  };
  document.addEventListener(
    'pointerover',
    (event) => {
      if (!eligible(event)) return;
      remember(event);
      const target = host(event.target);
      if (target && !within(target, event.relatedTarget)) enter(target);
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'pointermove',
    (event) => {
      if (!eligible(event)) return;
      remember(event);
      enter(host(event.target));
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'pointerout',
    (event) => {
      if (!eligible(event)) return;
      if (!event.relatedTarget) {
        point = undefined;
        cancelAnimationFrame(viewportFrame);
        viewportFrame = 0;
      }
      if (hovered && !within(hovered, event.relatedTarget)) {
        hovered = undefined;
        if (interaction === 'pointer') stop();
      }
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'focusin',
    (event) => {
      const target = host(event.target);
      if (target?.matches(':focus-visible') && target !== active) play(target, 'focus');
    },
    { signal },
  );
  document.addEventListener(
    'focusout',
    (event) => {
      if (active && interaction === 'focus' && !within(active, event.relatedTarget)) stop();
    },
    { signal },
  );
  window.addEventListener('scroll', viewportChanged, { signal, passive: true, capture: true });
  window.addEventListener('resize', viewportResize(resized), { signal, passive: true });
  const suspend = () => {
    point = undefined;
    hovered = undefined;
    cancelAnimationFrame(viewportFrame);
    viewportFrame = 0;
    stop();
  };
  window.addEventListener('blur', suspend, { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) suspend();
    },
    { signal },
  );
  motion.addEventListener(
    'change',
    () => {
      if (motion.matches) {
        generation++;
        suspend();
        engine?.destroy();
        engine = undefined;
        preparation = undefined;
      }
    },
    { signal },
  );
  return () => {
    disposed = true;
    generation++;
    suspend();
    abort.abort();
    engine?.destroy();
  };
}
