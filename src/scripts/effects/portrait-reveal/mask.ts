export function createRevealMask(
  x: number,
  y: number,
  r: number,
  time: number,
  reducedMotion: boolean,
) {
  const epoch = reducedMotion ? 0 : Math.floor(time / 95);
  const random = (i: number) => {
    const value = Math.sin(i * 12.9898 + epoch * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const left: [number, number][] = [],
    right: [number, number][] = [];
  const rows = 19,
    rowHeight = (r * 1.8) / rows;
  const fragments: string[] = [];
  for (let i = 0; i < rows; i++) {
    const v = ((i + 0.5) / rows) * 2 - 1;
    const spread = r * (1 - Math.pow(Math.abs(v), 1.4) * 0.55);
    const offset = (random(i + 80) - 0.5) * r * 0.3;
    const l = Math.round(x + offset - spread * (0.75 + random(i) * 0.4));
    const rr = Math.round(x + offset + spread * (0.75 + random(i + 30) * 0.4));
    const top = Math.round(y - r * 0.9 + i * rowHeight);
    const bottom = Math.round(y - r * 0.9 + (i + 1) * rowHeight);
    left.push([l, top], [l, bottom]);
    right.unshift([rr, bottom], [rr, top]);
    if (r > 8 && i % 5 === epoch % 5) {
      const side = random(i + 120) > 0.5;
      const fw = Math.max(2, r * (0.03 + random(i + 160) * 0.12));
      const fx = side ? rr + 3 + random(i + 190) * 8 : l - fw - 4;
      const fy = top + rowHeight * 0.2,
        fh = Math.max(2, rowHeight * 0.45);
      fragments.push(`M${fx} ${fy}h${fw}v${fh}h${-fw}Z`);
    }
  }
  const points = [...left, ...right];
  const path =
    points.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ') +
    'Z ' +
    fragments.join(' ');
  return { path, random };
}
