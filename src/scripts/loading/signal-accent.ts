export interface SignalAccent {
  mask: HTMLCanvasElement;
  revision: number;
  bounds: { x: number; y: number; width: number; height: number };
  reveal: number;
  strength: number;
}

export function createCanvasAccent(accent: SignalAccent) {
  const layer = document.createElement('canvas');
  const ctx = layer.getContext('2d')!;
  return {
    render(source: HTMLCanvasElement, target: CanvasRenderingContext2D) {
      const b = accent.bounds;
      if (!accent.revision || accent.reveal <= 0 || b.y > 1 || b.y + b.height < 0) return;
      const sx = Math.floor(b.x * source.width),
        sy = Math.floor(b.y * source.height);
      const sw = Math.ceil((b.x + b.width) * source.width) - sx,
        sh = Math.ceil((b.y + b.height) * source.height) - sy;
      if (sw <= 0 || sh <= 0) return;
      const width = Math.max(1, Math.floor(sw)),
        height = Math.max(1, Math.floor(sh));
      if (layer.width !== width || layer.height !== height) {
        layer.width = width;
        layer.height = height;
      }
      ctx.clearRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      const gain = Math.max(0, Math.min(4, accent.strength));
      for (let pass = 0; pass < Math.ceil(gain); pass++) {
        ctx.globalAlpha = Math.min(1, gain - pass);
        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = `rgb(${3 * gain} ${3 * gain} ${7 * gain})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(accent.mask, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      target.save();
      target.globalCompositeOperation = 'lighter';
      const columns = 160;
      for (let i = 0; i < columns; i++) {
        const random = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        const seed = random - Math.floor(random);
        const t = Math.max(0, Math.min(1, (accent.reveal - seed * 0.3) / 0.7));
        target.globalAlpha = t * t * (3 - 2 * t);
        if (target.globalAlpha <= 0) continue;
        const x = (i * width) / columns,
          w = width / columns;
        target.drawImage(layer, x, 0, w, height, sx + (i * sw) / columns, sy, sw / columns, sh);
      }
      target.restore();
    },
    destroy() {
      layer.width = layer.height = 1;
    },
  };
}
