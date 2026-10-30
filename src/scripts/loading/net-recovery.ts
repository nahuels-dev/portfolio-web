import { packetNoise } from '../effects/corruption-field';
import { glitchBounds } from '../effects/glitch-bounds';
import { bridgeSignal, SIGNAL_COLORS } from '../effects/signal-palette';

interface RecoveryOptions {
  source?: HTMLElement;
  scope?: 'viewport' | 'section' | 'fixed';
  strength?: number;
  className?: string;
  host?: HTMLElement;
}

function cloneVisiblePage(source: HTMLElement): HTMLElement {
  const copy = source.cloneNode(false) as HTMLElement;
  const clone = (element: Element): Element => {
    if (!(element instanceof HTMLElement)) return element.cloneNode(true) as Element;
    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) return element.cloneNode(true) as Element;
    const spacer = element.cloneNode(false) as HTMLElement;
    spacer.style.height = `${rect.height}px`;
    spacer.style.minHeight = '0';
    return spacer;
  };
  for (const child of source.children) {
    if (child.tagName !== 'MAIN') {
      copy.append(clone(child));
      continue;
    }
    const main = child.cloneNode(false) as HTMLElement;
    for (const section of child.children) main.append(clone(section));
    copy.append(main);
  }
  return copy;
}

export function createNetRecovery(options: RecoveryOptions = {}) {
  const source = options.source ?? document.querySelector<HTMLElement>('.page-shell');
  if (!source) return { update(_progress: number) {}, reposition() {}, destroy() {} };
  let rect = source.getBoundingClientRect();
  const fixed = options.scope === 'fixed';
  const section = options.scope === 'section' || fixed;
  const amplitude = options.strength ?? 1;
  let bounds = section ? glitchBounds(rect) : undefined;
  if (fixed && bounds) {
    bounds.left -= scrollX;
    bounds.top -= scrollY;
  }
  const overlay = document.createElement('div');
  overlay.className = `net-recovery${fixed ? ' net-recovery--fixed' : section ? ' net-recovery--section' : ''}`;
  if (options.className) overlay.classList.add(options.className);
  const positionOverlay = () => {
    if (!bounds) return;
    Object.assign(overlay.style, {
      left: `${bounds.left}px`,
      top: `${bounds.top}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      ...(fixed ? { position: 'fixed' } : {}),
    });
  };
  const positionCopy = (copy: HTMLElement) => {
    Object.assign(copy.style, {
      position: 'absolute',
      left: `${bounds ? bounds.offsetX : rect.left}px`,
      top: `${bounds ? bounds.offsetY : rect.top}px`,
      width: `${rect.width}px`,
      margin: '0',
      transform: 'none',
      ...(fixed ? { bottom: 'auto', right: 'auto', height: `${rect.height}px` } : {}),
    });
  };
  positionOverlay();
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
  const echoes = ['violet', 'magenta'].map((channel, i) => {
    const layer = document.createElement('div');
    layer.className = `net-recovery__echo net-recovery__echo--${channel}`;
    layer.style.setProperty(
      '--recovery-color',
      i === 0 ? SIGNAL_COLORS.violet : SIGNAL_COLORS.magenta,
    );
    const copy = section ? (source.cloneNode(true) as HTMLElement) : cloneVisiblePage(source);
    for (const node of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
      for (const attribute of node.getAttributeNames()) {
        if (attribute.startsWith('data-contact-')) node.removeAttribute(attribute);
      }
      for (const attribute of [
        'id',
        'href',
        'tabindex',
        'autofocus',
        'data-glitch',
        'data-reveal',
        'data-reveal-state',
        'data-net-recovery',
        'data-copy-email',
        'data-menu-toggle',
        'data-menu-link',
        'data-floating-nav',
        'data-floating-link',
        'data-floating-toggle',
        'data-floating-panel',
        'data-floating-nav-state',
        'aria-controls',
      ])
        node.removeAttribute(attribute);
      if (node instanceof HTMLAnchorElement)
        for (const attribute of [
          'target',
          'download',
          'ping',
          'rel',
          'hreflang',
          'type',
          'referrerpolicy',
        ])
          node.removeAttribute(attribute);
    }
    positionCopy(copy);
    layer.append(copy);
    overlay.append(layer);
    return layer;
  });
  (options.host ?? document.body).append(overlay);
  source.dataset.netRecovery = '';
  let phase = -1;
  return {
    reposition() {
      rect = source.getBoundingClientRect();
      bounds = section ? glitchBounds(rect) : undefined;
      if (fixed && bounds) {
        bounds.left -= scrollX;
        bounds.top -= scrollY;
      }
      positionOverlay();
      echoes.forEach((layer) => positionCopy(layer.firstElementChild as HTMLElement));
    },
    update(progress: number) {
      const step = Math.floor(progress * 18);
      if (step === phase) return;
      phase = step;
      const strength = Math.max(0, 1 - progress / 0.9) * amplitude;
      if (!section)
        source.style.setProperty(
          '--signal-x',
          `${Math.round((packetNoise(step * 31) - 0.5) * 18 * strength)}px`,
        );
      if (!section)
        source.style.setProperty(
          '--signal-y',
          `${Math.round((packetNoise(step * 47) - 0.5) * 5 * strength)}px`,
        );
      echoes.forEach((layer, i) => {
        if (!section)
          layer.style.setProperty(
            '--recovery-color',
            bridgeSignal(
              i === 0 ? SIGNAL_COLORS.violet : SIGNAL_COLORS.magenta,
              i === 0 ? SIGNAL_COLORS.violet : SIGNAL_COLORS.lavender,
              progress,
            ),
          );
        const points = [];
        for (let band = 0; band < 5; band++) {
          const start = band * 20 + packetNoise(step * 53 + band * 17 + i) * 9;
          const end = start + 2 + packetNoise(step * 67 + band * 19 + i) * 7;
          points.push(`0 ${start}%`, `100% ${start}%`, `100% ${end}%`, `0 ${end}%`);
        }
        layer.style.clipPath = `polygon(${points.join(',')})`;
        layer.style.opacity = String(strength * 0.65);
        layer.style.transform = `translate3d(${(i === 0 ? -1 : 1) * (8 + packetNoise(step + i) * 28) * strength}px,0,0)`;
      });
    },
    destroy() {
      overlay.remove();
      delete source.dataset.netRecovery;
      source.style.removeProperty('--signal-x');
      source.style.removeProperty('--signal-y');
    },
  };
}

export type NetRecovery = ReturnType<typeof createNetRecovery>;
