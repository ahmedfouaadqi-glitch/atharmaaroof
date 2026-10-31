"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MotionPoint = { x: number; y: number };
type MotionStatus = "unknown" | "unsupported" | "ready" | "enabled" | "denied";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useDeviceMotion() {
  const [point, setPoint] = useState<MotionPoint>({ x: 0, y: 0 });
  const [status, setStatus] = useState<MotionStatus>("unknown");
  const sampleRef = useRef<MotionPoint>({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus("ready");
  }, []);

  const onOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.gamma === null || event.beta === null) return;
    const now = performance.now();
    if (now - lastUpdateRef.current < 32) return;
    lastUpdateRef.current = now;

    const next = {
      x: clamp(event.gamma / 22, -1, 1),
      y: clamp((event.beta - 35) / 28, -1, 1)
    };
    const previous = sampleRef.current;
    const smooth = {
      x: previous.x + (next.x - previous.x) * 0.16,
      y: previous.y + (next.y - previous.y) * 0.16
    };
    sampleRef.current = smooth;
    setPoint(smooth);
  }, []);

  const enable = useCallback(async () => {
    if (!("DeviceOrientationEvent" in window)) {
      setStatus("unsupported");
      return false;
    }

    try {
      const OrientationConstructor = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof OrientationConstructor.requestPermission === "function") {
        const permission = await OrientationConstructor.requestPermission();
        if (permission !== "granted") {
          setStatus("denied");
          return false;
        }
      }

      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      setStatus("enabled");
      return true;
    } catch {
      setStatus("denied");
      return false;
    }
  }, [onOrientation]);

  useEffect(() => () => {
    window.removeEventListener("deviceorientation", onOrientation);
  }, [onOrientation]);

  return { point, status, enable };
}
