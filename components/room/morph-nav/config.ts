/**
 * All tunable geometry + motion constants for <MorphNav />.
 * Nothing in the component hard-codes these numbers: override any subset
 * through the `config` prop and the rest of the system adapts.
 */
export interface MorphConfig {
  /** Thickness of the panel (width when vertical, height when horizontal). */
  panelSize: number;
  /** Length of the panel along its edge (height when vertical). */
  panelLength: number;
  /** Inner padding of the content area. */
  panelPadding: number;
  /** Rounded-rect corner radius. */
  cornerRadius: number;
  /** Radius of the circular cup that wraps the active icon. */
  bumpRadius: number;
  /** Distance from the panel edge to the icon center (protrusion depth). */
  bumpDepth: number;
  /** How far along the edge the bump blends back into the straight wall. */
  bumpSpread: number;
  /** Bezier handle strength for the blend, 0..1. Higher = softer silicone. */
  bumpTension: number;
  /** Diameter of an icon button. */
  iconSize: number;
  /** Gap between icon buttons. */
  iconGap: number;
  /** Spring stiffness. */
  stiffness: number;
  /** Spring damping. */
  damping: number;
  /** Spring mass. */
  mass: number;
  /** Duration (s) of the content cross-fade. */
  contentFade: number;
}

export const defaultMorphConfig: MorphConfig = {
  panelSize: 320,
  panelLength: 520,
  panelPadding: 18,
  cornerRadius: 26,
  bumpRadius: 32,
  bumpDepth: 60,
  bumpSpread: 34,
  bumpTension: 0.62,
  iconSize: 48,
  iconGap: 24,
  stiffness: 260,
  damping: 30,
  mass: 1,
  contentFade: 0.18,
};

/** Total size of the SVG stage across the depth axis. */
export const stageDepth = (c: MorphConfig) =>
  c.panelSize + c.bumpDepth + c.bumpRadius + 4;
