export interface RevealElements {
  root: HTMLElement;
  hero: HTMLElement;
  button: HTMLButtonElement;
  natural: HTMLImageElement;
  cyberLayer: HTMLElement;
  cyber: HTMLImageElement;
  canvas: HTMLCanvasElement;
}

export interface RevealState {
  ready: boolean;
  disposed: boolean;
  frame: number;
  lastFrame: number;
  lastDraw: number;
  width: number;
  height: number;
  radius: number;
  x: number;
  y: number;
  toX: number;
  toY: number;
  presence: number;
  target: number;
  energy: number;
}

export const createRevealState = (): RevealState => ({
  ready: false,
  disposed: false,
  frame: 0,
  lastFrame: 0,
  lastDraw: 0,
  width: 0,
  height: 0,
  radius: 0,
  x: 0,
  y: 0,
  toX: 0,
  toY: 0,
  presence: 0,
  target: 0,
  energy: 0,
});
