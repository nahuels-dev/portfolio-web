import {
  createFallbackField,
  type FieldRenderer,
  type FieldState,
} from '../loading/blackwall-field';
import { createErrorSignal } from './error-signal';

export function initErrorScreen(): () => void {
  const root = document.querySelector<HTMLElement>('[data-error-screen]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-error-field]');
  const gpuCanvas = root?.querySelector<HTMLCanvasElement>('[data-error-gpu]');
  if (!root || !canvas || !gpuCanvas) return () => {};
  const codeRoot = root.querySelector<HTMLElement>(
    `[data-error-language="${document.documentElement.lang}"] [data-error-signal]`,
  );
  const abort = new AbortController(),
    { signal } = abort;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state: FieldState = {
    time: 0,
    progress: 0.12,
    breach: 0,
    x: 0.5,
    y: 0.5,
  };
  const pointer = { x: 0.5, y: 0.5 };
  let renderer: FieldRenderer | undefined,
    gpu: FieldRenderer | undefined,
    frame = 0,
    resizeFrame = 0,
    lastPaint = -Infinity,
    disposed = false;
  let glyph: ReturnType<typeof createErrorSignal> | undefined;
  try {
    if (codeRoot) glyph = createErrorSignal(codeRoot);
  } catch {}
  let path = location.pathname;
  try {
    path = decodeURI(path);
  } catch {}
  root
    .querySelectorAll<HTMLElement>('[data-error-path]')
    .forEach((node) => (node.textContent = path.slice(0, 96)));
  root.querySelectorAll<HTMLElement>('[data-error-retry-wrapper]').forEach((wrapper) => {
    wrapper.hidden = false;
    wrapper.querySelector('button')?.addEventListener('click', () => location.reload(), { signal });
  });
  const useFallback = () => {
    if (disposed) return;
    const failed = gpu;
    gpu = undefined;
    failed?.destroy();
    gpuCanvas.hidden = true;
    canvas.hidden = !renderer;
    root.dataset.renderer = renderer ? 'canvas' : 'css';
  };
  const paint = (now = performance.now()) => {
    glyph?.update(now, reduced.matches);
    try {
      (gpu || renderer)?.render(state);
    } catch {
      if (gpu) useFallback();
      else {
        renderer?.destroy();
        renderer = undefined;
        canvas.hidden = true;
        root.dataset.renderer = 'css';
      }
    }
    glyph?.show(Boolean(gpu || renderer));
  };
  const tick = (time: number) => {
    frame = 0;
    if (disposed || document.hidden) return;
    if (reduced.matches) {
      paint(time);
      return;
    }
    if (time - lastPaint >= 1000 / 18) {
      lastPaint = time;
      state.time = (time / 1000) * 0.55;
      state.x += (pointer.x - state.x) * 0.06;
      state.y += (pointer.y - state.y) * 0.06;
      paint(time);
    }
    if (renderer || gpu) frame = requestAnimationFrame(tick);
  };
  const suspend = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const sync = () => {
    suspend();
    if (disposed || document.hidden) return;
    if (reduced.matches) paint();
    else if (renderer || gpu) frame = requestAnimationFrame(tick);
  };
  try {
    renderer = createFallbackField(canvas, glyph?.accent);
    canvas.hidden = false;
    root.dataset.renderer = 'canvas';
    paint();
    sync();
  } catch {
    canvas.hidden = true;
    root.dataset.renderer = 'css';
  }

  if (codeRoot)
    void document.fonts
      .load('900 32px Orbitron')
      .catch(() => [])
      .then(() => {
        if (disposed) return;
        try {
          glyph?.prepare();
          paint();
          sync();
        } catch {}
      });

  if (navigator.gpu && isSecureContext && !reduced.matches) {
    void import('../loading/blackwall-gpu')
      .then((module) => module.createGPUField(gpuCanvas, signal, useFallback, glyph?.accent))
      .then((field) => {
        if (disposed) {
          field?.destroy();
          return;
        }
        if (!field) return;
        gpu = field;
        gpu.render(state);
        gpuCanvas.hidden = false;
        canvas.hidden = true;
        root.dataset.renderer = 'webgpu';
        sync();
      })
      .catch(useFallback);
  }
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch' || reduced.matches) return;
      pointer.x = event.clientX / innerWidth;
      pointer.y = event.clientY / innerHeight;
    },
    { signal, passive: true },
  );
  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        renderer?.resize();
        gpu?.resize();
        glyph?.resize();
        paint();
      });
    },
    { signal, passive: true },
  );
  document.addEventListener('visibilitychange', sync, { signal });
  reduced.addEventListener('change', () => sync(), { signal });
  const destroy = () => {
    disposed = true;
    suspend();
    cancelAnimationFrame(resizeFrame);
    abort.abort();
    gpu?.destroy();
    gpu = undefined;
    renderer?.destroy();
    renderer = undefined;
    glyph?.destroy();
    glyph = undefined;
  };
  window.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) suspend();
      else destroy();
    },
    { signal },
  );
  window.addEventListener('pageshow', sync, { signal });
  return destroy;
}
