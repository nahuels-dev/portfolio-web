struct SignalAccent {
  rect: vec4f,
  gain: vec4f
};

@group(1) @binding(0) var accentMask: texture_2d<f32>;
@group(1) @binding(1) var<uniform> accent: SignalAccent;

fn accentSignal(uv: vec2f) -> f32 {
  let local = (uv - accent.rect.xy) / max(accent.rect.zw, vec2f(.0001));
  if (any(local < vec2f(0.)) || any(local >= vec2f(1.))) {
    return 1.;
  }
  let size = textureDimensions(accentMask);
  let pixel = vec2i(clamp(local * vec2f(size), vec2f(0.), vec2f(size) - 1.));
  let glyph = textureLoad(accentMask, pixel, 0).a;
  let column = floor(local.x * 160.);
  let seed = fract(sin(column * 127.1 + 311.7) * 43758.5453);
  let arrival = smoothstep(seed * .3, seed * .3 + .7, accent.gain.x);
  return 1. + glyph * arrival * accent.gain.y;
}
