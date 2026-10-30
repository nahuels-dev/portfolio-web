export const SIGNAL_COLORS = {
  violet: '#8155ff',
  violetLight: '#966cff',
  magenta: '#c055ff',
  lavender: '#a98bff',
  lavenderLight: '#dbbaff',
  highlight: '#eadfff',
  dark: '#101220',
} as const;

export const SIGNAL_PALETTE = [
  SIGNAL_COLORS.violet,
  SIGNAL_COLORS.violetLight,
  SIGNAL_COLORS.magenta,
  SIGNAL_COLORS.lavender,
  SIGNAL_COLORS.lavenderLight,
  SIGNAL_COLORS.highlight,
];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function mixSignal(from: string, to: string, weight: number): string {
  const start = rgb(from),
    end = rgb(to);
  return (
    '#' +
    start
      .map((value, i) =>
        Math.round(value + (end[i] - value) * weight)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function bridgeSignal(from: string, to: string, progress: number): string {
  if (progress <= 0) return from;
  return mixSignal(
    mixSignal(from, SIGNAL_COLORS.magenta, smooth(0, 0.45, progress)),
    to,
    smooth(0.3, 0.85, progress),
  );
}

export const SIGNAL_WGSL =
  Object.entries(SIGNAL_COLORS)
    .map(
      ([name, color]) =>
        `const SIGNAL_${name.toUpperCase()} = vec3f(${rgb(color)
          .map((v) => (v / 255).toFixed(6))
          .join(',')});`,
    )
    .join('\n') +
  `
fn bridgeSignal(startColor:vec3f,endColor:vec3f,progress:f32)->vec3f {
  return mix(mix(startColor,SIGNAL_MAGENTA,smoothstep(0.,.45,progress)),endColor,smoothstep(.3,.85,progress));
}
`;
