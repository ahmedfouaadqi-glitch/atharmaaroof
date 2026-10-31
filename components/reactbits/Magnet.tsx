"use client";

import type { ComponentType, CSSProperties, PropsWithChildren } from "react";
import Source from "./Magnet.jsx";

type MagnetProps = PropsWithChildren<{
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  maxOffset?: number;
  exclusive?: boolean;
  axis?: "x" | "y" | "both";
  tilt?: number;
  scale?: number;
  spring?: { stiffness?: number; damping?: number; mass?: number };
  wrapperClassName?: string;
  innerClassName?: string;
  style?: CSSProperties;
}>;

const Magnet = Source as unknown as ComponentType<MagnetProps>;
export default Magnet;
