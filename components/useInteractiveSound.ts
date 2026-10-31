"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

export type InterfaceTone = "tap" | "success" | "open" | "toggle" | "hover";

const SOUND_SETTING_KEY = "athar-maaroof-sound";

export function useInteractiveSound() {
  // Sound is enabled on first use; the visitor can mute it and the choice is remembered.
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SOUND_SETTING_KEY);
      if (saved === "0") setEnabled(false);
      if (saved === "1") setEnabled(true);
    } catch {
      // Storage may be unavailable; the current session preference still works.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_SETTING_KEY, enabled ? "1" : "0");
    } catch {
      // Storage is optional.
    }
  }, [enabled]);

  const play = useCallback((type: InterfaceTone = "tap", force = false) => {
    if (!enabled && !force) return;
    try {
      if (typeof window === "undefined" || !window.AudioContext) return;
      const context = audioRef.current ?? (audioRef.current = new window.AudioContext());
      if (context.state === "suspended") void context.resume();

      const oscillator = context.createOscillator();
      const overtone = context.createOscillator();
      const gain = context.createGain();
      const blend = context.createGain();
      const now = context.currentTime;
      const tones: Record<InterfaceTone, [number, number]> = {
        tap: [620, 790],
        success: [660, 990],
        open: [490, 710],
        toggle: [420, 610],
        hover: [820, 930]
      };
      const [start, end] = tones[type];
      const peak: Record<InterfaceTone, number> = {
        tap: 0.105,
        success: 0.135,
        open: 0.115,
        toggle: 0.095,
        hover: 0.038
      };
      const duration = type === "success" ? 0.28 : type === "hover" ? 0.075 : 0.17;

      oscillator.type = type === "success" || type === "hover" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + Math.min(0.12, duration * 0.7));

      overtone.type = "sine";
      overtone.frequency.setValueAtTime(start * 2.01, now);
      overtone.frequency.exponentialRampToValueAtTime(end * 2, now + Math.min(0.1, duration * 0.65));
      blend.gain.setValueAtTime(type === "hover" ? 0.13 : 0.18, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak[type], now + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      overtone.connect(blend);
      blend.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      overtone.start(now);
      oscillator.stop(now + duration + 0.01);
      overtone.stop(now + duration + 0.01);
    } catch {
      // Audio feedback must never block a user action.
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
    if (!enabled || event.pointerType !== "mouse") return;
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
    setEnabled((current) => {
      const next = !current;
      if (next) play("toggle", true);
      return next;
    });
  }, [play]);

  useEffect(() => () => {
    void audioRef.current?.close();
  }, []);

  return { enabled, setEnabled, play, onInteraction, onHover, toggle };
}
