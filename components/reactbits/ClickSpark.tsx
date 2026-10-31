"use client";

import type { ComponentType, CSSProperties, PropsWithChildren } from "react";
import Source from "./ClickSpark.jsx";

type ClickSparkProps = PropsWithChildren<{
  sparkColor?: string | string[];
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  sparkWidth?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
  extraScale?: number;
  shape?: "line" | "streak" | "dot" | "star";
  randomness?: number;
  gravity?: number;
  spread?: number;
  direction?: number;
  glow?: number;
  ring?: boolean;
  layer?: "front" | "back";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}>;

const ClickSpark = Source as unknown as ComponentType<ClickSparkProps>;
export default ClickSpark;
