import { useEffect } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

import { buildPath } from "./buildPath";
import type { MorphConfig } from "./config";

/**
 * Animation engine. Owns the springs and derives the outline path from them.
 * It knows nothing about React rendering, layout or the DOM.
 */
export interface MorphSprings {
  /** 0 = collapsed, 1 = fully open. */
  open: MotionValue<number>;
  /** Position of the bump along the edge axis, in px. */
  bumpCenter: MotionValue<number>;
  /** The animated outline. */
  d: MotionValue<string>;
}

export function useMorphSprings(
  config: MorphConfig,
  target: { open: number; bumpCenter: number },
): MorphSprings {
  const reduced = useReducedMotion();
  const springOptions = {
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass,
  };

  const openRaw = useMotionValue(target.open);
  const bumpRaw = useMotionValue(target.bumpCenter);
  const open = useSpring(openRaw, springOptions);
  const bumpCenter = useSpring(bumpRaw, springOptions);

  useEffect(() => {
    if (reduced) {
      open.jump(target.open);
    } else {
      openRaw.set(target.open);
    }
  }, [target.open, reduced, open, openRaw]);

  useEffect(() => {
    // Never teleport the bump between icons: it always glides.
    if (reduced) {
      bumpCenter.jump(target.bumpCenter);
    } else {
      bumpRaw.set(target.bumpCenter);
    }
  }, [target.bumpCenter, reduced, bumpCenter, bumpRaw]);

  const d = useTransform<number, string>([open, bumpCenter], ([o, cy]) =>
    buildPath({
      x0: config.panelSize - config.panelSize * (o as number),
      edgeX: config.panelSize,
      y0: 0,
      y1: config.panelLength,
      cornerRadius: config.cornerRadius,
      bumpCenter: cy as number,
      bumpAmount: o as number,
      bumpRadius: config.bumpRadius,
      bumpDepth: config.bumpDepth,
      bumpSpread: config.bumpSpread,
      bumpTension: config.bumpTension,
    }),
  );

  return { open, bumpCenter, d };
}