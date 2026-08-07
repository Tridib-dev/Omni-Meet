/**
 * Pure geometry. No React, no DOM, no animation.
 *
 * Builds a single continuous outline: a rounded rectangle whose right wall
 * (x = `edgeX`) grows a smooth protrusion that ends in a circular cup centred
 * on the active icon. The blend segments are cubic Beziers whose handles are
 * tangent to the wall on one side and tangent to the cup arc on the other, so
 * the outline is G1-continuous everywhere -- there is never a hard corner and
 * never a cut between states.
 *
 * Coordinate space is always "vertical": x grows along the depth axis, y grows
 * along the edge axis. Horizontal layouts reuse this exact function and rotate
 * the resulting path at render time.
 */
export interface BuildPathParams {
  /** Left wall of the panel (animates toward edgeX when collapsing). */
  x0: number;
  /** Right wall of the panel; the bump grows out of this wall. */
  edgeX: number;
  /** Top of the panel. */
  y0: number;
  /** Bottom of the panel. */
  y1: number;
  cornerRadius: number;
  /** Position of the bump along the edge axis. */
  bumpCenter: number;
  /** 0 = flat wall, 1 = fully wrapped icon. */
  bumpAmount: number;
  bumpRadius: number;
  bumpDepth: number;
  bumpSpread: number;
  bumpTension: number;
}

const n = (v: number) => Math.round(v * 100) / 100;

export function buildPath(p: BuildPathParams): string {
  const { x0, edgeX, y0, y1 } = p;
  const width = edgeX - x0;
  const height = y1 - y0;
  if (width <= 0.5 || height <= 0.5) return "";

  const c = Math.max(0, Math.min(p.cornerRadius, width / 2, height / 2));
  const amount = Math.max(0, Math.min(1, p.bumpAmount));

  const r = p.bumpRadius * amount;
  const d = p.bumpDepth * amount;
  const h = r + p.bumpSpread * amount;
  const t = p.bumpTension;

  // Keep the bump inside the straight part of the wall.
  const cy = Math.max(y0 + c + h, Math.min(y1 - c - h, p.bumpCenter));

  const parts: string[] = [
    `M ${n(x0 + c)} ${n(y0)}`,
    `L ${n(edgeX - c)} ${n(y0)}`,
    `A ${n(c)} ${n(c)} 0 0 1 ${n(edgeX)} ${n(y0 + c)}`,
  ];

  if (amount > 0.001 && d > 0.5) {
    const handle = t * (h - r);
    parts.push(
      `L ${n(edgeX)} ${n(cy - h)}`,
      `C ${n(edgeX)} ${n(cy - h + handle)} ${n(edgeX + d - t * d)} ${n(cy - r)} ${n(edgeX + d)} ${n(cy - r)}`,
      `A ${n(r)} ${n(r)} 0 0 1 ${n(edgeX + d)} ${n(cy + r)}`,
      `C ${n(edgeX + d - t * d)} ${n(cy + r)} ${n(edgeX)} ${n(cy + h - handle)} ${n(edgeX)} ${n(cy + h)}`,
    );
  }

  parts.push(
    `L ${n(edgeX)} ${n(y1 - c)}`,
    `A ${n(c)} ${n(c)} 0 0 1 ${n(edgeX - c)} ${n(y1)}`,
    `L ${n(x0 + c)} ${n(y1)}`,
    `A ${n(c)} ${n(c)} 0 0 1 ${n(x0)} ${n(y1 - c)}`,
    `L ${n(x0)} ${n(y0 + c)}`,
    `A ${n(c)} ${n(c)} 0 0 1 ${n(x0 + c)} ${n(y0)}`,
    "Z",
  );

  return parts.join(" ");
}
