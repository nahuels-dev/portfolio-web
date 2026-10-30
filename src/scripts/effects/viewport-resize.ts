export function viewportResize(onLayoutChange: () => void, onChromeChange = () => {}) {
  const touch = matchMedia('(hover: none) and (pointer: coarse)');
  let width = document.documentElement.clientWidth;
  let angle = screen.orientation?.angle;
  return () => {
    const nextWidth = document.documentElement.clientWidth;
    const nextAngle = screen.orientation?.angle;
    const chromeOnly = touch.matches && nextWidth === width && nextAngle === angle;
    width = nextWidth;
    angle = nextAngle;
    if (chromeOnly) onChromeChange();
    else onLayoutChange();
  };
}
