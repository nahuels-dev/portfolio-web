export interface TextSnapshot {
  value: string;
  start: number;
  end: number;
  scroll: number;
}

export interface ChangedGlyph {
  text: string;
  prefix: string;
  removed: boolean;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function visibleGlyphs(glyphs: ChangedGlyph[], value: string): ChangedGlyph[] {
  const visible = glyphs.filter((glyph) => !glyph.removed || glyph.prefix.length >= value.length);
  if (!glyphs.length || glyphs.some((glyph) => !glyph.removed)) return visible;
  const boundary = glyphs[0].prefix.length;
  const next = [...segmenter.segment(value)].find(
    ({ index, segment }) => index <= boundary && index + segment.length > boundary,
  );
  if (next)
    visible.push({ text: next.segment, prefix: value.slice(0, next.index), removed: false });
  return visible;
}

export function changedGlyphs(before: TextSnapshot, after: TextSnapshot): ChangedGlyph[] {
  const left = [...segmenter.segment(before.value)];
  const right = [...segmenter.segment(after.value)];
  const boundary = Math.min(before.start, after.start);
  let prefix = 0;
  let suffix = 0;
  while (
    prefix < Math.min(left.length, right.length) &&
    left[prefix].segment === right[prefix].segment &&
    left[prefix].index + left[prefix].segment.length <= boundary &&
    right[prefix].index + right[prefix].segment.length <= boundary
  )
    prefix++;
  while (suffix < Math.min(left.length, right.length) - prefix) {
    const a = left[left.length - suffix - 1];
    const b = right[right.length - suffix - 1];
    if (a.segment !== b.segment || a.index < before.end || b.index < after.end) break;
    suffix++;
  }
  const collect = (segments: typeof left, value: string, removed: boolean) =>
    segments.slice(prefix, segments.length - suffix).map(({ segment, index }) => ({
      text: segment,
      prefix: value.slice(0, index),
      removed,
    }));
  return [...collect(left, before.value, true), ...collect(right, after.value, false)];
}
