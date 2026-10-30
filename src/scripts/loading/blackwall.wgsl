struct Frame {
  viewport: vec4f,
  pointer: vec4f
};

@group(0) @binding(0) var<uniform> frame: Frame;

struct Output {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f
};

@vertex
fn vertexMain(@builtin(vertex_index) i: u32) -> Output {
  let p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.))[i];
  return Output(vec4f(p, 0., 1.), vec2f(p.x * .5 + .5, .5 - p.y * .5));
}

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn line(value: f32, width: f32) -> f32 {
  return 1. - smoothstep(0., width, abs(value));
}

@fragment
fn fragmentMain(input: Output) -> @location(0) vec4f {
  let breach = frame.pointer.z;
  let time = frame.viewport.z;
  let progress = frame.viewport.w;
  let mouse = frame.pointer.xy;
  let aspect = frame.viewport.x / frame.viewport.y;
  let delta = input.uv - mouse;
  let local = 1. / (1. + dot(delta, delta) * 45.);
  let center = vec2f(.69, .53) + (mouse - .5) * vec2f(.075, .055);
  let phase = floor(breach * 18.);
  let breakup = select(0., 1. - smoothstep(.72, 1., breach), breach > 0.);
  let slice = floor(input.uv.y * 110.);
  let jump = vec2f(
    (hash(vec2f(slice, phase)) - .5) * .24,
    (hash(vec2f(phase, slice)) - .5) * .06
  ) * breakup;
  let uv = input.uv + delta * .025 * local + jump;
  let p = (uv - center) * vec2f(aspect, 1.);
  let trace = smoothstep(.25, .62, progress);
  let column = floor(uv.x * 240.);
  let row = floor(uv.y * 190.);
  let crawl = floor(time * 9.);
  let seed = hash(vec2f(column, 13.));
  let codeGain = accentSignal(input.uv);
  let codeDensity = clamp(codeGain - 1., 0., 1.);
  let scan = fract(uv.y * (9. + seed * 32.) + time * (.12 + seed * .3));
  let pixels = step(.73 - codeDensity * .32, hash(vec2f(column, row + floor(time * 4.))));
  let vertical = line(fract(uv.x * 240.) - .5, .09) * pixels;
  let basePacket = step(.62 - codeDensity * .22, hash(vec2f(column, floor(scan * 27.))));
  let strand = step(.81 - codeDensity * .09, seed)
    * (.2 + .8 * hash(vec2f(column, floor(uv.y * 26. + time * seed))));
  let connection = vertical * (.1 + seed * .8)
    + basePacket * line(fract(scan * 27.) - .5, .08) * .5
    + line(fract(uv.x * 240.) - .5, .1) * strand;
  let radius = max(abs(p.y), abs(p.x) * .48);
  let depth = .24 / max(radius, .018);
  let wall = abs(p.x) * .48 > abs(p.y);
  let across = select(p.x, p.y, wall) * depth;
  let tiles = vec2f(across * 7., depth * 3. - time * 2.2);
  let cell = floor(tiles);
  let tileNoise = hash(cell);
  let verticalEdge = line(fract(tiles.x) - .5, .012);
  let horizontalEdge = line(fract(tiles.y) - .5, .008);
  let fine = hash(floor(tiles * vec2f(24., 70.)) + vec2f(0., crawl));
  let packet = step(.86, fine) * (.3 + tileNoise * .7);
  let tunnel = (verticalEdge * .16 + horizontalEdge * .12 + packet * 1.3)
    * smoothstep(.012, .07, radius);
  let hue = hash(vec2f(column + floor(depth), 23.));
  var tint = SIGNAL_VIOLET;
  if (hue > .72) {
    tint = SIGNAL_MAGENTA;
  }
  if (hue > .92) {
    tint = SIGNAL_LAVENDER;
  }
  let destination = select(SIGNAL_VIOLET, SIGNAL_MAGENTA, hue > .72);
  tint = bridgeSignal(tint, destination, breach);
  let horizon = exp(-abs(p.y) * 100.);
  let spine = exp(-abs(p.x) * 35.);
  let bloom = bridgeSignal(SIGNAL_VIOLET * .6, SIGNAL_VIOLET * .6, breach)
    * exp(-abs(p.y) * 14.) * (.32 + spine * .65);
  let grain = .5 + .5 * hash(floor(uv * frame.viewport.xy * .65));
  let energy = mix(connection, tunnel, trace) * grain * codeGain;
  let nearby = 1. + local * .48;
  let hot = bridgeSignal(SIGNAL_LAVENDER, SIGNAL_HIGHLIGHT, breach) * horizon * (.5 + spine * .5);
  let cross = bridgeSignal(SIGNAL_MAGENTA * .7, SIGNAL_MAGENTA * .7, breach)
    * spine * mix(.18, .5, trace);
  let color = vec3f(.003, .003, .009) + tint * energy * nearby + bloom + hot + cross;
  let vignette = 1. - smoothstep(.25, 1.1, length((uv - .5) * vec2f(1., .8)));
  if (breach > 0.) {
    let band = floor(input.uv.y * 100.);
    let column = floor(input.uv.x * 18.);
    let slot = hash(vec2f(column, band));
    let recovery = smoothstep(.08, .98, breach);
    let alpha = step(recovery, slot);
    let block = floor(input.uv * vec2f(90., 220.));
    let packetNoise = hash(block + vec2f(phase * 19., phase * 7.));
    let scanNoise = hash(vec2f(floor(input.uv.x * 180.), band + phase * 23.));
    let split = hash(vec2f(column + phase, band));
    var channel = SIGNAL_VIOLET;
    if (split > .6) {
      channel = SIGNAL_MAGENTA;
    }
    if (split > .85) {
      channel = SIGNAL_LAVENDER;
    }
    channel = bridgeSignal(channel, select(SIGNAL_VIOLET, SIGNAL_LAVENDER, split > .6), breach);
    let streak = step(.67, packetNoise) * (.2 + .8 * scanNoise);
    let interference = vec3f(.008, .003, .015) + channel * streak * 1.1 + color * .35;
    return vec4f(clamp(interference, vec3f(0.), vec3f(1.)) * alpha, alpha);
  }
  return vec4f(color * vignette, 1.);
}
