"use client";

import type { ComponentPropsWithoutRef, ComponentType, PropsWithChildren } from "react";
import Source from "./SpotlightCard.jsx";

type SpotlightCardProps = PropsWithChildren<
  ComponentPropsWithoutRef<"div"> & {
    spotlightColor?: string;
    intensity?: number;
    spotlightSize?: number;
    softness?: number;
    shape?: "circle" | "beam";
    borderGlow?: number;
    proximity?: number;
    smoothing?: number;
    ambient?: boolean;
    flare?: boolean;
    grain?: number;
    theme?: "dark" | "light";
  }
>;

const SpotlightCard = Source as unknown as ComponentType<SpotlightCardProps>;
export default SpotlightCard;
