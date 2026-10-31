"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type MotionPoint = { x: number; y: number };
type MotionStatus = "unknown" | "unsupported" | "ready" | "enabled" | "denied";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useDeviceMotion(elementRef: RefObject<HTMLElement | null>) {
  const [status, setStatus] = useState<MotionStatus>("unknown");
  const sampleRef = useRef<MotionPoint>({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const touchDevice = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    if (!touchDevice || !("DeviceOrientationEvent" in window)) {
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
      x: previous.x + (next.x - previous.x) * 0.18,
      y: previous.y + (next.y - previous.y) * 0.18
    };
    sampleRef.current = smooth;

    // Write transforms directly to the artwork layer to avoid rerendering the full page.
    const element = elementRef.current;
    if (element) {
      element.style.setProperty("--device-tilt-x", (smooth.y * -4.2).toFixed(2) + "deg");
      element.style.setProperty("--device-tilt-y", (smooth.x * 5.0).toFixed(2) + "deg");
      element.style.setProperty("--motion-back-x", (smooth.x * -8).toFixed(2) + "px");
      element.style.setProperty("--motion-back-y", (smooth.y * -7).toFixed(2) + "px");
      element.style.setProperty("--motion-front-x", (smooth.x * 10).toFixed(2) + "px");
      element.style.setProperty("--motion-front-y", (smooth.y * 9).toFixed(2) + "px");
      element.style.setProperty("--motion-chip-x", (smooth.x * 5).toFixed(2) + "px");
      element.style.setProperty("--motion-chip-y", (smooth.y * 5).toFixed(2) + "px");
    }
  }, [elementRef]);

  const disable = useCallback(() => {
    window.removeEventListener("deviceorientation", onOrientation);
    sampleRef.current = { x: 0, y: 0 };
    const element = elementRef.current;
    if (element) {
      for (const name of ["--device-tilt-x", "--device-tilt-y", "--motion-back-x", "--motion-back-y", "--motion-front-x", "--motion-front-y", "--motion-chip-x", "--motion-chip-y"]) {
        element.style.setProperty(name, "0");
      }
    }
    setStatus("ready");
  }, [elementRef, onOrientation]);

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

      window.removeEventListener("deviceorientation", onOrientation);
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

  return { status, enable, disable };
}
