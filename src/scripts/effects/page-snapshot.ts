export interface PageSnapshot {
  html: string;
  width: number;
  height: number;
}

const EXCLUDED = 'script, iframe, object, embed, dialog, [data-loading-screen]';

function cloneViewport(element: Element): Element | undefined {
  if (element.matches(EXCLUDED)) return;
  if (!(element instanceof HTMLElement)) return element.cloneNode(true) as Element;
  const copy = element.cloneNode(false) as HTMLElement;
  const rect = element.getBoundingClientRect();
  if (rect.height > 0 && (rect.bottom < -32 || rect.top > innerHeight + 32)) {
    copy.style.height = `${rect.height}px`;
    copy.style.minHeight = '0';
    return copy;
  }
  for (const child of element.childNodes) {
    const node = child instanceof Element ? cloneViewport(child) : child.cloneNode();
    if (node) copy.append(node);
  }
  copy.classList.remove('is-glitch-captured');
  copy.removeAttribute('data-net-recovery');
  if (element instanceof HTMLImageElement) {
    copy.setAttribute('src', element.currentSrc || element.src);
    copy.removeAttribute('srcset');
    copy.removeAttribute('sizes');
    copy.setAttribute('loading', 'eager');
  }
  if (element instanceof HTMLPictureElement)
    copy.querySelectorAll('source').forEach((n) => n.remove());
  if (getComputedStyle(element).position === 'fixed') {
    Object.assign(copy.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      right: 'auto',
      bottom: 'auto',
      margin: '0',
      transform: 'none',
    });
  }
  return copy;
}

export function capturePageSnapshot(): PageSnapshot | undefined {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const source = document.querySelector<HTMLElement>(
    '.page-shell, .error-document > [data-boot-content]',
  );
  if (!source) return;
  const copy = cloneViewport(source) as HTMLElement | undefined;
  if (!copy) return;
  const rect = source.getBoundingClientRect();
  Object.assign(copy.style, {
    position: 'absolute',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    margin: '0',
    transform: 'none',
  });
  const styles = [...document.styleSheets]
    .filter((sheet) => !sheet.disabled)
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n')
    .replace(/<\/style/gi, '<\\/style');
  const snapshot = document.implementation.createHTMLDocument('');
  snapshot.documentElement.lang = document.documentElement.lang;
  const base = snapshot.createElement('base');
  base.href = location.href;
  const style = snapshot.createElement('style');
  style.textContent = `${styles}\nhtml,body{width:100%;height:100%;overflow:hidden!important}*,*::before,*::after{animation:none!important;transition:none!important}`;
  snapshot.head.append(base, style);
  snapshot.body.className = document.body.className;
  snapshot.body.append(copy);
  const html = `<!doctype html>${snapshot.documentElement.outerHTML}`;
  if (html.length > 1500000) return;
  return { html, width: innerWidth, height: innerHeight };
}
