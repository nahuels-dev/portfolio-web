function length(value: string, extent: number): number {
  const expression = value.replace(/calc\(|\)/g, '').replace(/\s/g, '');
  return [...expression.matchAll(/[+-]?(?:\d*\.)?\d+(?:%|px)?/g)].reduce(
    (sum, [term]) => sum + parseFloat(term) * (term.endsWith('%') ? extent / 100 : 1),
    0,
  );
}

export function polygon(shape: string, width: number, height: number): Path2D {
  const path = new Path2D();
  const points = shape.match(/^polygon\((.*)\)$/)?.[1].split(',');
  if (!points) {
    path.rect(0, 0, width, height);
    return path;
  }
  points.forEach((point, index) => {
    const terms = point.trim().match(/calc\([^)]*\)|[-.\d]+(?:px|%)?/g);
    if (!terms || terms.length < 2) return;
    const x = length(terms[0], width),
      y = length(terms[1], height);
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
  return path;
}
