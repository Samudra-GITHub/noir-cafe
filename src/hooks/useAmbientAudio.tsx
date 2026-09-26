"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/**
 * Ambient audio architecture.
 *
 * Muted by default. Sound only ever starts from a user gesture (the toggle),
 * which also satisfies browser autoplay policies. The preference is kept for
 * the session; if it was on, audio resumes on the visitor's next interaction.
 *
 * Source: pass `src` for a recorded loop (e.g. /audio/room-tone.mp3). Without
 * one, a soft café room tone is synthesised with the Web Audio API — warm
 * brown noise under a low-pass filter with a slow "breathing" swell — so the
 * architecture works before any recording exists. Fades in/out over ~1.2s and
 * pauses while the tab is hidden.
 */

type AmbientAudio = { enabled: boolean; supported: boolean; toggle: () => void };

const PREF_KEY = "noir:sound";
const TARGET_GAIN = 0.12;
const FADE_S = 1.2;

const AmbientAudioContext = createContext<AmbientAudio>({ enabled: false, supported: false, toggle: () => {} });

function createRoomTone(ctx: AudioContext) {
  const seconds = 4;
  const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // brown noise
      data[i] = last * 3.2;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 520;

  // Slow swell, like a room breathing.
  const swell = ctx.createGain();
  swell.gain.value = 0.85;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.15;
  lfo.connect(lfoDepth).connect(swell.gain);

  source.connect(lowpass).connect(swell);
  source.start();
  lfo.start();
  return swell;
}

export function AmbientAudioProvider({ src, children }: { src?: string; children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const supported = useSyncExternalStore(
    () => () => {},
    () => "AudioContext" in window,
    () => true,
  );
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    if (src) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
      ctx.createMediaElementSource(audio).connect(master);
    } else {
      createRoomTone(ctx).connect(master);
    }
    ctxRef.current = ctx;
    gainRef.current = master;
  }, [src]);

  const ramp = useCallback((to: number) => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + FADE_S);
  }, []);

  const start = useCallback(async () => {
    ensureGraph();
    await ctxRef.current?.resume();
    await audioRef.current?.play().catch(() => {});
    ramp(TARGET_GAIN);
  }, [ensureGraph, ramp]);

  const stop = useCallback(() => {
    ramp(0);
    window.setTimeout(() => {
      if (gainRef.current && gainRef.current.gain.value < 0.01) {
        audioRef.current?.pause();
        void ctxRef.current?.suspend();
      }
    }, FADE_S * 1000 + 50);
  }, [ramp]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) void start();
    else stop();
    try {
      sessionStorage.setItem(PREF_KEY, next ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
  }, [start, stop]);

  // Resume a remembered "on" preference at the first interaction.
  useEffect(() => {
    let wanted = false;
    try {
      wanted = sessionStorage.getItem(PREF_KEY) === "on";
    } catch {
      /* ignore */
    }
    if (!wanted) return;
    const resume = () => {
      enabledRef.current = true;
      setEnabled(true);
      void start();
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [start]);

  // Pause with the tab.
  useEffect(() => {
    const onVisibility = () => {
      if (!enabled) return;
      if (document.hidden) stop();
      else void start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, start, stop]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  const value = useMemo(() => ({ enabled, supported, toggle }), [enabled, supported, toggle]);
  return <AmbientAudioContext.Provider value={value}>{children}</AmbientAudioContext.Provider>;
}

/** Read and control the ambient sound from anywhere below the provider. */
export function useAmbientAudio() {
  return useContext(AmbientAudioContext);
}
