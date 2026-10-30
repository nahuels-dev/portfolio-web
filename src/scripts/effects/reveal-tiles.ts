import { packetNoise } from './corruption-field';
import { SIGNAL_COLORS } from './signal-palette';

let serial = 0;

const NS = 'http://www.w3.org/2000/svg';

export function createRevealTiles(
  target: HTMLElement,
  options: { fixed?: boolean; preserveHitArea?: boolean; host?: HTMLElement } = {},
) {
  const rect = target.getBoundingClientRect();
  const originalClip = target.style.clipPath;
  const columns = rect.width < 600 ? 8 : 16;
  const rows = Math.min(32, Math.max(16, Math.ceil(rect.height / 14)));
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('reveal-tiles');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('viewBox', '0 0 1 1');
  svg.setAttribute('preserveAspectRatio', 'none');
  const reposition = () => {
    const bounds = target.getBoundingClientRect();
    Object.assign(svg.style, {
      position: options.fixed ? 'fixed' : 'absolute',
      left: `${bounds.left + (options.fixed ? 0 : scrollX)}px`,
      top: `${bounds.top + (options.fixed ? 0 : scrollY)}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    });
    if (options.preserveHitArea) svg.style.clipPath = getComputedStyle(target).clipPath;
  };
  reposition();
  const defs = document.createElementNS(NS, 'defs'),
    clip = document.createElementNS(NS, 'clipPath');
  clip.id = `section-packets-${++serial}`;
  clip.setAttribute('clipPathUnits', 'objectBoundingBox');
  defs.append(clip);
  svg.append(defs);
  const cover = document.createElementNS(NS, 'g');
  if (options.preserveHitArea) {
    cover.setAttribute('fill', 'var(--black)');
    svg.style.clipPath = getComputedStyle(target).clipPath;
    svg.append(cover);
  }
  const packets = document.createElementNS(NS, 'g');
  svg.append(packets);
  const cells = Array.from({ length: columns * rows }, (_, index) => {
    const x = (index % columns) / columns,
      y = Math.floor(index / columns) / rows;
    const mask = document.createElementNS(NS, 'rect');
    mask.setAttribute('x', String(x));
    mask.setAttribute('y', String(y));
    mask.setAttribute('width', options.preserveHitArea ? String(1 / columns + 0.0001) : '0');
    mask.setAttribute('height', String(1 / rows + 0.0001));
    (options.preserveHitArea ? cover : clip).append(mask);
    let packet: SVGRectElement | undefined;
    if (packetNoise(index * 7 + 9) > 0.78) {
      packet = document.createElementNS(NS, 'rect');
      packet.setAttribute('x', String(x + (packetNoise(index * 11) * 0.15) / columns));
      packet.setAttribute('y', String(y + (packetNoise(index * 19) * 0.4) / rows));
      packet.setAttribute('width', String((0.3 + packetNoise(index * 23) * 0.7) / columns));
      packet.setAttribute('height', String((0.2 + packetNoise(index * 29) * 0.6) / rows));
      const hue = packetNoise(index * 31);
      packet.setAttribute(
        'fill',
        hue > 0.86
          ? SIGNAL_COLORS.lavender
          : hue > 0.62
            ? SIGNAL_COLORS.magenta
            : SIGNAL_COLORS.violet,
      );
      packets.append(packet);
    }
    return { mask, packet, threshold: 0.025 + packetNoise(index * 79 + 17) * 0.82, open: false };
  });
  (options.host ?? document.body).append(svg);
  if (!options.preserveHitArea) target.style.clipPath = `url("#${clip.id}")`;
  return {
    element: svg,
    reposition,
    update(progress: number) {
      const phase = Math.floor(progress * 18);
      for (const [index, cell] of cells.entries()) {
        if (!cell.open && progress >= cell.threshold) {
          cell.open = true;
          cell.mask.setAttribute(
            'width',
            options.preserveHitArea ? '0' : String(1 / columns + 0.0001),
          );
        }
        if (cell.packet)
          cell.packet.setAttribute(
            'opacity',
            String(
              Math.max(0, 1 - progress / 0.9) * (0.35 + packetNoise(index + phase * 37) * 0.65),
            ),
          );
      }
    },
    destroy() {
      if (!options.preserveHitArea) {
        if (originalClip) target.style.clipPath = originalClip;
        else target.style.removeProperty('clip-path');
      }
      svg.remove();
    },
  };
}

export type RevealTiles = ReturnType<typeof createRevealTiles>;
