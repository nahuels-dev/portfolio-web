import { packetNoise } from './corruption-field';

export function createPageTransitionMask(width: number, height: number) {
  const columns = width < 600 ? 8 : 16;
  const rows = 24;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const cells = Array.from({ length: columns * rows }, (_, index) => ({
    x: Math.round((index % columns) * cellWidth * 10) / 10,
    y: Math.round(Math.floor(index / columns) * cellHeight * 10) / 10,
    threshold: 0.025 + packetNoise(index * 79 + 17) * 0.82,
  }));
  const w = Math.ceil(cellWidth * 10) / 10 + 0.2;
  const h = Math.ceil(cellHeight * 10) / 10 + 0.2;
  return (progress: number) => {
    if (progress <= 0) return 'inset(0)';
    const path = cells
      .filter((cell) => cell.threshold > progress)
      .map(({ x, y }) => `M${x} ${y}h${w}v${h}h-${w}Z`)
      .join('');
    return path ? `path("${path}")` : 'inset(100%)';
  };
}
