import { createFallbackField, type FieldRenderer, type FieldState } from './blackwall-field';

interface BootRendererOptions {
  signal: AbortSignal;
  start: number;
  state: FieldState;
  isClosing(): boolean;
}

export function createBootRenderer(
  root: HTMLElement,
  { signal, start, state, isClosing }: BootRendererOptions,
) {
  const fallbackCanvas = root.querySelector<HTMLCanvasElement>('[data-loading-fallback]')!;
  const gpuCanvas = root.querySelector<HTMLCanvasElement>('[data-loading-gpu]')!;
  let fallback: FieldRenderer | undefined, gpu: FieldRenderer | undefined;
  let fallbackTimer = 0,
    lastPaint = -Infinity;
  const pointer = { x: 0.5, y: 0.5 };

  const ensureFallback = () => {
    if (signal.aborted || isClosing() || gpu || fallback) return;
    try {
      fallback = createFallbackField(fallbackCanvas);
    } catch {
      fallbackCanvas.hidden = true;
    }
  };
  const useFallback = () => {
    if (signal.aborted) return;
    clearTimeout(fallbackTimer);
    gpu?.destroy();
    gpu = undefined;
    ensureFallback();
    gpuCanvas.hidden = true;
    fallbackCanvas.hidden = false;
    root.dataset.renderer = 'canvas2d';
  };
  root.dataset.renderer = 'canvas2d';
  fallbackTimer = window.setTimeout(ensureFallback, navigator.gpu && isSecureContext ? 120 : 0);
  const paint = (now: number) => {
    if (now - lastPaint < 1000 / 30) return;
    lastPaint = now;
    state.time = (now - start) / 1000;
    state.x += (pointer.x - state.x) * 0.18;
    state.y += (pointer.y - state.y) * 0.18;
    try {
      (gpu ?? fallback)?.render(state);
    } catch {
      useFallback();
      fallback?.render(state);
    }
  };

  if (navigator.gpu && isSecureContext)
    void import('./blackwall-gpu')
      .then((m) => m.createGPUField(gpuCanvas, signal, useFallback))
      .then((renderer) => {
        if (isClosing() || signal.aborted) {
          renderer?.destroy();
          return;
        }
        if (renderer) {
          clearTimeout(fallbackTimer);
          gpu = renderer;
          gpu.render(state);
          gpuCanvas.hidden = false;
          fallbackCanvas.hidden = true;
          root.dataset.renderer = 'webgpu';
        } else useFallback();
      })
      .catch(useFallback);
  root.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX / innerWidth;
      pointer.y = e.clientY / innerHeight;
    },
    { signal, passive: true },
  );
  root.addEventListener(
    'pointerleave',
    () => {
      pointer.x = 0.5;
      pointer.y = 0.5;
    },
    { signal, passive: true },
  );
  window.addEventListener(
    'resize',
    () => {
      fallback?.resize();
      gpu?.resize();
    },
    { signal, passive: true },
  );
  return {
    paint,
    reset: () => {
      lastPaint = -Infinity;
    },
    destroy() {
      clearTimeout(fallbackTimer);
      gpu?.destroy();
      fallback?.destroy();
      gpu = fallback = undefined;
    },
  };
}
