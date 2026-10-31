import type { TextControl, TextScroll } from './types';

export function createTextSurface(input: TextControl, layer: HTMLElement) {
  const style = getComputedStyle(input);
  const multiline = input instanceof HTMLTextAreaElement;
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingTop = multiline ? parseFloat(style.paddingTop) : 0;
  const width = input.clientWidth - paddingLeft - parseFloat(style.paddingRight);
  Object.assign(layer.style, {
    font: style.font,
    color: style.color,
    letterSpacing: style.letterSpacing,
    wordSpacing: style.wordSpacing,
    textAlign: style.textAlign,
    tabSize: style.tabSize,
    left: `${paddingLeft + parseFloat(style.borderLeftWidth)}px`,
    top: `${paddingTop + parseFloat(style.borderTopWidth)}px`,
    width: `${width}px`,
    height: `${input.clientHeight - paddingTop - (multiline ? parseFloat(style.paddingBottom) : 0)}px`,
  });
  return (value: string, scroll: TextScroll) => {
    const text = document.createElement('span');
    text.className = 'input-glitch__text';
    text.textContent = value;
    text.style.left = `${-scroll.left}px`;
    if (multiline) {
      text.classList.add('input-glitch__text--multiline');
      text.style.top = `${-scroll.top}px`;
      if (input.wrap !== 'off') text.style.width = `${width}px`;
      else text.style.whiteSpace = 'pre';
    }
    layer.append(text);
    return text;
  };
}
