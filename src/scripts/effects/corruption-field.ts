import { SIGNAL_COLORS, SIGNAL_PALETTE } from './signal-palette';

export function packetNoise(value: number): number {
  let n = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function drawCorruption(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number,
  seed: number,
  intensity: number,
  tinted: HTMLCanvasElement,
): void {
  const phase = Math.floor(progress * 18),
    key = Math.floor(seed * 65536) + phase * 7919;
  const recovery = Math.max(0, (progress - 0.84) / 0.16);
  const strength = (1 - recovery) * intensity;

  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();

  for (let row = 0; row < height; row += 2) {
    const n = packetNoise(key + row * 73);
    const shift = (n - 0.5) * Math.min(width * 0.48, 140) * strength;
    ctx.drawImage(
      source,
      0,
      (row / height) * source.height,
      source.width,
      Math.min((2 / height) * source.height, source.height - (row / height) * source.height),
      x + shift,
      y + row,
      width,
      Math.min(2, height - row),
    );
  }
  ctx.save();
  ctx.resetTransform();
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = SIGNAL_COLORS.dark;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-atop';
  const anchorX = width * (0.62 + packetNoise(Math.floor(seed * 11)) * 0.18);
  const anchorY = height * (0.3 + packetNoise(Math.floor(seed * 19)) * 0.25);

  const packets = Math.min(9000, Math.max(900, Math.floor((width * height) / 28)));
  for (let i = 0; i < packets; i++) {
    const n = key + i * 131;
    const px = packetNoise(n) * width,
      py = packetNoise(n + 1) * height;
    const horizontal = Math.max(0, 1 - Math.abs(py - anchorY) / (height * 0.28));
    const vertical = Math.max(0, 1 - Math.abs(px - anchorX) / (width * 0.18));
    if (packetNoise(n + 2) > 0.13 + horizontal * 0.65 + vertical * 0.4) continue;
    const color = packetNoise(n + 3);
    const index = color < 0.6 ? i % 2 : color < 0.8 ? 2 : color < 0.89 ? 3 : color < 0.97 ? 4 : 5;
    ctx.fillStyle = SIGNAL_PALETTE[index];
    ctx.globalAlpha = (0.25 + packetNoise(n + 4) * 0.75) * strength;
    const length = 2 + packetNoise(n + 5) ** 3 * width * 0.22;
    ctx.fillRect(x + px, y + py, length, 0.6 + packetNoise(n + 6) * 1.5);
    if (vertical > 0.5 && i % 7 === 0) {
      ctx.globalAlpha *= 0.45;
      ctx.fillRect(x + px, y + py, 0.8, 4 + packetNoise(n + 7) * height * 0.3);
    }
  }

  ctx.globalAlpha = 0.12 * strength;
  for (let i = 0; i < 24; i++) {
    const n = key + i * 271;
    const sw = Math.max(1, source.width * (0.02 + packetNoise(n) * 0.08));
    const sh = Math.max(1, source.height * 0.025);
    ctx.drawImage(
      tinted,
      packetNoise(n + 1) * (source.width - sw),
      packetNoise(n + 2) * (source.height - sh),
      sw,
      sh,
      x + packetNoise(n + 3) * width,
      y + packetNoise(n + 4) * height,
      sw * 2,
      sh,
    );
  }
  ctx.globalAlpha = (1 - recovery) * (1 - intensity);
  ctx.drawImage(tinted, x, y, width, height);
  if (recovery > 0) {
    ctx.globalAlpha = recovery;
    ctx.drawImage(source, x, y, width, height);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
