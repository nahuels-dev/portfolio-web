import { bridgeSignal, SIGNAL_COLORS } from '../effects/signal-palette';
import { createSignalTexture } from './blackwall-texture';
import { createCanvasAccent, type SignalAccent } from './signal-accent';

export interface FieldState {
  time: number;
  progress: number;
  breach: number;
  x: number;
  y: number;
}

export interface FieldRenderer {
  render(state: FieldState): void;
  resize(): void;
  destroy(): void;
}

export function sizeField(canvas: HTMLCanvasElement, budget: number) {
  const width = innerWidth,
    height = innerHeight;
  const ratio = Math.min(1, Math.sqrt(budget / (width * height)));
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
}

function noise(n: number) {
  const value = Math.sin(n * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

export function createFallbackField(
  canvas: HTMLCanvasElement,
  accent?: SignalAccent,
): FieldRenderer {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Canvas unavailable');
  sizeField(canvas, 240000);
  const texture = createSignalTexture();
  const code = accent ? createCanvasAccent(accent) : undefined;
  const streams = Array.from({ length: 64 }, (_, i) => ({
    offset: noise(i + 31) * 512,
    speed: 8 + noise(i + 73) * 22,
  }));
  return {
    resize() {
      sizeField(canvas, 240000);
    },
    render(state) {
      const width = canvas.width,
        height = canvas.height;
      const cx = width * (0.69 + (state.x - 0.5) * 0.075),
        cy = height * (0.53 + (state.y - 0.5) * 0.055);
      const time = state.time;
      const colors = [
        bridgeSignal(SIGNAL_COLORS.violet, SIGNAL_COLORS.violet, state.breach),
        bridgeSignal(SIGNAL_COLORS.magenta, SIGNAL_COLORS.magenta, state.breach),
        bridgeSignal(SIGNAL_COLORS.lavender, SIGNAL_COLORS.lavender, state.breach),
      ];
      const hot = bridgeSignal(SIGNAL_COLORS.lavender, SIGNAL_COLORS.highlight, state.breach);
      const t = Math.min(1, Math.max(0, (state.progress - 0.25) / 0.37));
      const tunnel = t * t * (3 - 2 * t);
      const sheet = texture.prepare(state.breach);
      const size = sheet.width;
      ctx.fillStyle = '#030307';
      ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      if (tunnel < 0.995 && state.breach < 0.9) {
        ctx.globalAlpha = 1 - tunnel;
        streams.forEach((stream, i) => {
          const offset = (stream.offset + time * stream.speed) % size;
          const sx = (i / streams.length) * size;
          const sw = size / streams.length;
          const x = (i / streams.length) * width + (state.x - 0.5) * width * 0.015;
          const split = (1 - offset / size) * height;
          ctx.drawImage(
            sheet,
            sx,
            offset,
            sw,
            size - offset,
            x,
            0,
            width / streams.length + 0.3,
            split,
          );
          if (offset > 0)
            ctx.drawImage(
              sheet,
              sx,
              0,
              sw,
              offset,
              x,
              split,
              width / streams.length + 0.3,
              height - split,
            );
        });
      }
      if (tunnel > 0.005 && state.breach < 0.9) {
        ctx.globalAlpha = tunnel;
        const stride = Math.max(1, Math.ceil(Math.max(width, height) / 420));
        const focal = height * 0.3;

        for (let y = 0; y < height; y += stride) {
          const distance = Math.abs(y - cy);
          if (distance < 2) continue;
          const halfWidth = distance / 0.48;
          const depth = focal / distance;
          const sy = (((depth * 120 - time * 65) % size) + size) % size;
          ctx.drawImage(sheet, 0, sy, size, 1, cx - halfWidth, y, halfWidth * 2, stride + 0.2);
        }
        for (let x = 0; x < width; x += stride) {
          const distance = Math.abs(x - cx);
          if (distance < 2) continue;
          const halfHeight = distance * 0.48;
          const depth = focal / halfHeight;
          const sx = (((depth * 120 - time * 65) % size) + size) % size;
          ctx.drawImage(sheet, sx, 0, 1, size, x, cy - halfHeight, stride + 0.2, halfHeight * 2);
        }
      }
      ctx.globalAlpha = 1;
      code?.render(canvas, ctx);
      const glow = ctx.createLinearGradient(0, cy - height * 0.14, 0, cy + height * 0.14);
      glow.addColorStop(0, colors[0] + '00');
      glow.addColorStop(0.47, colors[0] + '22');
      glow.addColorStop(0.5, hot + 'aa');
      glow.addColorStop(0.53, colors[0] + '22');
      glow.addColorStop(1, colors[0] + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(0, cy - height * 0.14, width, height * 0.28);
      ctx.fillStyle = bridgeSignal(SIGNAL_COLORS.lavender, SIGNAL_COLORS.lavender, state.breach);
      ctx.globalAlpha = 0.65;
      ctx.fillRect(0, cy, width, 0.7);

      const spine = ctx.createLinearGradient(cx - width * 0.06, 0, cx + width * 0.06, 0);
      spine.addColorStop(0, colors[0] + '00');
      spine.addColorStop(0.5, colors[0] + '44');
      spine.addColorStop(1, colors[0] + '00');
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = spine;
      ctx.fillRect(cx - width * 0.06, 0, width * 0.12, height);
      ctx.globalAlpha = 1;
      if (state.breach > 0) {
        const phase = Math.floor(state.breach * 18);
        const t = Math.max(0, Math.min(1, (state.breach - 0.08) / 0.9));
        const recovery = t * t * (3 - 2 * t);
        const cellWidth = width / 18,
          cellHeight = height / 100;

        ctx.globalAlpha = 0.72;
        ctx.fillStyle = '#030307';
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        for (let row = 0; row < 100; row++)
          for (let column = 0; column < 18; column++) {
            const x = column * cellWidth,
              y = row * cellHeight;
            const slot = noise(column * 127.1 + row * 311.7);
            if (slot < recovery) {
              ctx.clearRect(x, y, cellWidth + 0.5, cellHeight + 0.5);
            } else {
              const color = noise(column + row * 7 + phase * 19);
              ctx.fillStyle = colors[color > 0.85 ? 2 : color > 0.6 ? 1 : 0];
              ctx.globalAlpha = 0.3 + noise(row + column * 13 + phase) * 0.7;
              ctx.fillRect(
                x + (noise(row + phase) - 0.5) * cellWidth,
                y,
                cellWidth * (0.2 + noise(column + phase)),
                Math.max(0.6, cellHeight * 0.2),
              );
              ctx.globalAlpha = 1;
            }
          }
        ctx.globalCompositeOperation = 'source-over';
      }
    },
    destroy() {
      code?.destroy();
      texture.destroy();
      canvas.width = 1;
      canvas.height = 1;
      canvas.hidden = true;
    },
  };
}
