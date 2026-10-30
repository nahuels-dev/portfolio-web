struct Settings {
  viewport: vec4f,
  element: vec4f,
  effect: vec4f
};

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var controlImage: texture_2d<f32>;
@group(0) @binding(2) var controlSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  let p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.))[index];
  return VertexOutput(vec4f(p, 0., 1.), vec2f(p.x * .5 + .5, .5 - p.y * .5));
}

fn hash(value: f32) -> f32 {
  return fract(sin(value * 127.1 + settings.effect.x * 311.7) * 43758.5453);
}

fn sampleControl(uv: vec2f) -> vec4f {
  if (any(uv < vec2f(0.)) || any(uv > vec2f(1.))) {
    return vec4f(0.);
  }
  return textureSampleLevel(controlImage, controlSampler, uv, 0.);
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let progress = clamp(settings.viewport.z, 0., 1.);
  let recovery = smoothstep(.84, 1., progress);
  let intensity = settings.effect.y;
  let strength = (1. - recovery) * intensity;
  let size = settings.element.zw;
  let pixel = input.uv * settings.viewport.xy - settings.element.xy;
  let uv = pixel / size;
  let row = floor(pixel.y / 1.25);
  let phase = floor(progress * 18.);
  let jump = (hash(row + phase * 31.) - .5) * min(size.x * .48, 140.) * strength;
  let displaced = uv + vec2f(jump / size.x, 0.);
  let mask = sampleControl(displaced).a;
  if (mask < .001) {
    discard;
  }
  let anchor = vec2f(.62 + hash(11.) * .18, .3 + hash(19.) * .25);
  let horizontal = max(0., 1. - abs(uv.y - anchor.y) / .28);
  let vertical = max(0., 1. - abs(uv.x - anchor.x) / .18);
  let cell = floor(pixel.x / (3. + hash(row + phase) * 16.));
  let packet = hash(cell * 17. + row * 73. + phase * 131.);
  let density = .13 + horizontal * .62 + vertical * .4;
  let occupied = step(1. - density, packet);
  let choice = hash(cell * 7. + row * 11. + phase * 53.);
  var tint = SIGNAL_VIOLET;
  if (choice > .3) {
    tint = SIGNAL_VIOLETLIGHT;
  }
  if (choice > .6) {
    tint = SIGNAL_MAGENTA;
  }
  if (choice > .8) {
    tint = SIGNAL_LAVENDER;
  }
  if (choice > .89) {
    tint = SIGNAL_LAVENDERLIGHT;
  }
  if (choice > .97) {
    tint = SIGNAL_HIGHLIGHT;
  }
  let line = step(.64, hash(row * 19. + phase * 29.));
  let energy = occupied * (.2 + hash(cell + row + phase) * .8) * (.55 + line * .45);
  let hot = pow(max(0., 1. - abs(uv.y - anchor.y) / .045), 3.) * .4 * step(.3, packet);
  let column = step(.88, hash(floor(pixel.x / 1.5) + phase * 7.))
    * vertical * .22 * step(.3, hash(row + cell));
  let scrambled = sampleControl(fract(
    displaced * vec2f(2.7, 3.1) + vec2f(hash(row + phase), hash(cell + phase))
  ));
  let debris = dot(scrambled.rgb, vec3f(.2126, .7152, .0722)) * .08;
  let grain = .5 + .5 * hash(floor(pixel.x * 1.5) + floor(pixel.y) * 127. + phase * 17.);
  let signal = SIGNAL_DARK * .15
    + tint * (energy * grain * 1.6 + column + debris)
    + SIGNAL_HIGHLIGHT * hot * 1.8;
  let original = sampleControl(uv);
  let luminance = dot(sampleControl(displaced).rgb, vec3f(.2126, .7152, .0722));
  let retained = SIGNAL_VIOLET * luminance;
  let corrupted = mix(retained, signal, intensity);
  return vec4f(mix(corrupted, original.rgb, recovery), mix(mask, original.a, recovery));
}
