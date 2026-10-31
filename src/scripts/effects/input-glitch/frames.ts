import { packetNoise } from '../corruption-field';
import { SIGNAL_COLORS, SIGNAL_PALETTE } from '../signal-palette';

export function fragmentFrames(
  row: number,
  width: number,
  seed: number,
  removed: boolean,
): Keyframe[] {
  return Array.from({ length: 9 }, (_, phase) => {
    const progress = phase / 8;
    const noise = packetNoise(seed + row * 73 + phase * 7919);
    const recovery = Math.max(0, (progress - 0.65) / 0.35);
    const shift = (noise - 0.5) * Math.min(width * 1.8, 16) * (1 - recovery);
    const lift =
      Math.round((packetNoise(seed + row * 19 + phase * 271) - 0.5) * 4) * (1 - recovery);
    return {
      offset: progress,
      translate: `${shift}px ${lift}px`,
      opacity: removed
        ? phase === 8 || noise < progress * 0.7
          ? 0
          : 1
        : noise < 0.18 && phase < 6
          ? 0
          : 1,
      color:
        phase === 8
          ? 'inherit'
          : noise > 0.65
            ? SIGNAL_COLORS.highlight
            : SIGNAL_PALETTE[(row + phase) % SIGNAL_PALETTE.length],
    };
  });
}
