export const GLITCH_PADDING = 20;

export function glitchBounds(rect: DOMRect) {
  const x = rect.left + scrollX,
    y = rect.top + scrollY;
  const left = Math.max(0, x - GLITCH_PADDING),
    top = Math.max(0, y - GLITCH_PADDING);
  return {
    left,
    top,
    width: Math.min(document.documentElement.clientWidth, x + rect.width + GLITCH_PADDING) - left,
    height: Math.min(document.documentElement.scrollHeight, y + rect.height + GLITCH_PADDING) - top,
    offsetX: x - left,
    offsetY: y - top,
  };
}

export type GlitchBounds = ReturnType<typeof glitchBounds>;
