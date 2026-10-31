export type TextControl = HTMLInputElement | HTMLTextAreaElement;

export interface TextScroll {
  left: number;
  top: number;
}

export interface InputGlitch {
  sync(animate?: boolean): void;
  destroy(): void;
}
