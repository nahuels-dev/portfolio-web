import { SIGNAL_COLORS } from '../effects/signal-palette';

const SIZE = 512;

const PALETTES = [
  [SIGNAL_COLORS.violet, SIGNAL_COLORS.magenta, SIGNAL_COLORS.lavender],
  [SIGNAL_COLORS.magenta, '#dd75ff', SIGNAL_COLORS.lavender],
];

function noise(n: number) {
  let x = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const surface = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  return canvas;
};

export function createSignalTexture() {
  const alpha = new Uint8ClampedArray(SIZE * SIZE);
  const channels = new Uint8Array(SIZE * SIZE);
  const stamp = (
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    strength: number,
  ) => {
    for (let py = Math.floor(y); py < Math.min(SIZE, Math.ceil(y + height)); py++)
      for (let px = Math.floor(x); px < Math.min(SIZE, Math.ceil(x + width)); px++) {
        const coverage =
          (Math.min(px + 1, x + width) - Math.max(px, x)) *
          (Math.min(py + 1, y + height) - Math.max(py, y));
        const index = py * SIZE + px;
        const value = Math.round(coverage * strength * 255);
        if (value > alpha[index]) {
          alpha[index] = value;
          channels[index] = color;
        }
      }
  };
  for (let column = 0; column < 240; column++) {
    const seed = noise(column * 79 + 13);
    const color = seed > 0.92 ? 2 : seed > 0.72 ? 1 : 0;
    const x = ((column + 0.5) / 240) * SIZE;
    for (let row = 0; row < 190; row++) {
      const key = column * 311 + row * 127;
      if (noise(key + 11) < 0.68) continue;
      const energy = noise(key + 29);
      const strength = 0.25 + Math.floor(energy * 4) * 0.23;
      const y = ((row + noise(key + 7)) / 190) * SIZE;
      stamp(x, y, 0.35 + energy * 0.3, 0.4 + energy ** 3 * 5, color, strength);
      if (noise(key + 53) > 0.9) stamp(x, y, 1 + noise(key + 67) * 9, 0.35, color, strength);
    }

    if (seed > 0.8)
      for (let i = 0; i < 8; i++) {
        const key = column * 97 + i * 43;
        stamp(x, noise(key) * SIZE, 0.25, 3 + noise(key + 1) * 18, color, 0.48);
      }
  }
  const sheets = PALETTES.map((palette) => {
    const canvas = surface(),
      ctx = canvas.getContext('2d')!;
    const rgb = palette.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
    const pixels = ctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < alpha.length; i++) {
      if (!alpha[i]) continue;
      const color = rgb[channels[i]];
      pixels.data[i * 4] = color[0];
      pixels.data[i * 4 + 1] = color[1];
      pixels.data[i * 4 + 2] = color[2];
      pixels.data[i * 4 + 3] = alpha[i];
    }

    ctx.putImageData(pixels, 0, 0);
    return canvas;
  });
  const blended = surface(),
    ctx = blended.getContext('2d')!;
  let lastPhase = -1;
  return {
    prepare(breach: number) {
      if (breach <= 0) return sheets[0];
      const phase = Math.floor(breach * 18);
      if (phase === lastPhase) return blended;
      lastPhase = phase;
      const a = smooth(0, 0.45, breach),
        b = smooth(0.3, 0.85, breach);
      const weights = [1 - a * (1 - b), a * (1 - b)];
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      sheets.forEach((sheet, i) => {
        if (weights[i] < 0.001) return;
        ctx.globalAlpha = weights[i];
        ctx.drawImage(sheet, 0, 0);
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      return blended;
    },
    destroy() {
      [...sheets, blended].forEach((sheet) => {
        sheet.width = sheet.height = 1;
      });
    },
  };
}
