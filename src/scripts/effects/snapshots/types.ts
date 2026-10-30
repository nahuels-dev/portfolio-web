import type { GlitchBounds } from '../glitch-bounds';

export interface SurfaceSnapshot {
  element: HTMLElement;
  intensity: number;
  rect: DOMRect;
  bounds: GlitchBounds;
  rasterize(): HTMLCanvasElement;
}
