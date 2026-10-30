import { createRevealMask } from './mask';
import type { RevealElements, RevealState } from './types';

export function createRevealRenderer(
  elements: RevealElements,
  state: RevealState,
  motion: MediaQueryList,
) {
  const { root, natural, cyberLayer, cyber, canvas } = elements;
  const ctx = canvas.getContext('2d');
  let imageX = 0,
    imageY = 0,
    imageWidth = 0,
    imageHeight = 0;
  const fit = () => {
    const { width, height } = root.getBoundingClientRect();
    state.width = width;
    state.height = height;
    if (!width || !height) return;
    const scale = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(750_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    ctx?.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    const cover = Math.max(width / cyber.naturalWidth, height / cyber.naturalHeight);
    imageWidth = cyber.naturalWidth * cover;
    imageHeight = cyber.naturalHeight * cover;
    const [px, py] = getComputedStyle(natural).objectPosition.split(' ').map(parseFloat);
    imageX = (width - imageWidth) * (Number.isFinite(px) ? px / 100 : 0.5);
    imageY = (height - imageHeight) * (Number.isFinite(py) ? py / 100 : 0.5);
    state.radius = Math.max(52, Math.min(120, Math.min(width, height) * 0.185));
  };

  const draw = (time: number) => {
    const r = state.radius * Math.max(0, Math.min(1, state.presence));
    const { path, random } = createRevealMask(state.x, state.y, r, time, motion.matches);
    if (!ctx) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}"><path fill="white" fill-rule="evenodd" d="M0 0H${state.width}V${state.height}H0Z ${path}"/></svg>`;
      natural.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      const inside = `<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}"><path fill="white" d="${path}"/></svg>`;
      cyberLayer.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(inside)}")`;
      cyberLayer.hidden = false;
      return;
    }
    natural.style.visibility = 'hidden';
    cyberLayer.hidden = true;
    canvas.hidden = false;
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.drawImage(natural, imageX, imageY, imageWidth, imageHeight);
    const step = Math.floor(time / 48);
    const distortion = motion.matches
      ? 0
      : Math.max(state.energy, state.target ? 0.18 + random(240) * 0.25 : 0);
    const band = Math.max(6, Math.min(12, state.height / 55));
    ctx.save();
    ctx.clip(new Path2D(path));
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.drawImage(cyber, imageX, imageY, imageWidth, imageHeight);
    for (
      let i = 0, top = Math.max(0, state.y - r);
      distortion > 0.03 && top < Math.min(state.height, state.y + r);
      i++, top += band
    ) {
      if (i % 3 !== step % 3) continue;
      const h = Math.min(band, state.y + r - top);
      const dy = top + h / 2 - state.y;
      const chord = Math.sqrt(Math.max(0, r * r - dy * dy));
      const noise = Math.sin(i * 12.9898 + step * 4.1414);
      const left = state.x - chord,
        right = state.x + chord;
      const shift = noise * 16 * distortion;
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, h + 0.5);
      ctx.clip();
      ctx.clearRect(left, top, right - left, h + 0.5);
      ctx.drawImage(cyber, imageX + shift, imageY, imageWidth, imageHeight);
      if (distortion > 0.1 && i % 3 === step % 3) {
        ctx.fillStyle =
          i % 2
            ? `rgba(170,110,255,${distortion * 0.55})`
            : `rgba(100,240,255,${distortion * 0.45})`;
        ctx.fillRect(left, top, 2, h);
        ctx.fillRect(right - 2, top, 2, h);
      }
      ctx.restore();
    }
    ctx.restore();
  };

  return { ctx, fit, draw };
}

export type RevealRenderer = ReturnType<typeof createRevealRenderer>;
