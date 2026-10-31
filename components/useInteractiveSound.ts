"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

export type InterfaceTone = "tap" | "success" | "open" | "toggle" | "hover";

export function useInteractiveSound() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const play = useCallback((type: InterfaceTone = "tap", force = false) => {
    if (!enabled && !force) return;
    try {
      if (typeof window === "undefined" || !window.AudioContext) return;
      const context = audioRef.current ?? (audioRef.current = new window.AudioContext());
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const tones: Record<InterfaceTone, [number, number]> = {
        tap: [520, 680],
        success: [620, 880],
        open: [440, 620],
        toggle: [360, 540],
        hover: [760, 820]
      };
      const [start, end] = tones[type];
      oscillator.type = type === "success" || type === "hover" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(type === "hover" ? 0.009 : type === "tap" ? 0.025 : 0.04, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "success" ? 0.24 : type === "hover" ? 0.07 : 0.15));
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + (type === "success" ? 0.25 : type === "hover" ? 0.08 : 0.16));
    } catch {
      // Audio feedback is optional. Browser restrictions must never block a user action.
    }
  }, [enabled]);

  const onInteraction = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!enabled) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest("button, a, input, select, textarea, [role='button']");
    if (!control || control.hasAttribute("disabled") || control.getAttribute("aria-disabled") === "true") return;
    if (control.getAttribute("data-sound") === "manual") return;
    const tone = control.getAttribute("data-sound") === "open" ? "open" : "tap";
    play(tone);
  }, [enabled, play]);

  const onHover = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType === "touch") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest("button, a, input, select, textarea, [role='button']");
    if (!control || control.hasAttribute("disabled") || control.getAttribute("aria-disabled") === "true") return;
    const previous = event.relatedTarget;
    if (previous instanceof Node && control.contains(previous)) return;
    if (control.getAttribute("data-sound") === "manual") return;
    play("hover");
  }, [enabled, play]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    play("toggle", true);
  }, [enabled, play]);

  useEffect(() => () => {
    void audioRef.current?.close();
  }, []);

  return { enabled, setEnabled, play, onInteraction, onHover, toggle };
}
