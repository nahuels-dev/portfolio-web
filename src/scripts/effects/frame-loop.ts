export function createFrameLoop(render: () => void) {
  let frame = 0;
  let running = false;
  const tick = () => {
    frame = 0;
    if (!running) return;
    render();
    if (running && !frame) frame = requestAnimationFrame(tick);
  };
  return {
    start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
