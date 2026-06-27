"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type SFXType = "slide" | "text" | "glitch";

interface AudioContextType {
  isMuted: boolean;
  audioEnabled: boolean;
  toggleMute: () => void;
  playSFX: (type: SFXType) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Web Audio API Synthesizer Class
class SciFiAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private synthBgmGain: GainNode | null = null;
  private customBgmGain: GainNode | null = null;

  // BGM nodes
  private bgmOscs: OscillatorNode[] = [];
  private bgmLfo: OscillatorNode | null = null;

  // Custom BGM file nodes
  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private isBgmPlaying: boolean = false;

  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private lastSFXPlayTimes: Record<SFXType, number> = {
    slide: 0,
    text: 0,
    glitch: 0,
  };

  init() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API is not supported in this browser.");
        return;
      }

      this.ctx = new AudioContextClass();

      // Master volume node
      this.masterGain = this.ctx.createGain();
      // BGM volume node
      this.bgmGain = this.ctx.createGain();
      // SFX volume node
      this.sfxGain = this.ctx.createGain();

      // Transition gains for cross-fading BGM sources
      this.synthBgmGain = this.ctx.createGain();
      this.customBgmGain = this.ctx.createGain();

      // Configure volumes
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      this.synthBgmGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.customBgmGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Connect nodes
      this.synthBgmGain.connect(this.bgmGain);
      this.customBgmGain.connect(this.bgmGain);
      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;

      // Start BGM manager (starts synthesized fallback and initiates custom MP3 fetch)
      this.startBGM();
    } catch (error) {
      console.error("Failed to initialize SciFiAudioManager:", error);
    }
  }

  private startBGM() {
    if (!this.ctx) return;

    // 1. Instantly start synthesized sci-fi background drone
    this.startAmbientBGM();

    // 2. Fetch and prefetch the high-quality custom background track
    this.loadCustomBGM();
  }

  private async loadCustomBGM() {
    if (!this.ctx || !this.bgmGain) return;

    const ctx = this.ctx;

    try {
      const response = await fetch("/audio/story-start2.mp3");
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();

      // Decode file
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bgmBuffer = decodedBuffer;

      console.log("Successfully loaded custom BGM: /audio/story-start2.mp3");

      // Cross-fade immediately if active
      if (this.isInitialized && !this.isMuted) {
        this.transitionToCustomBGM();
      }
    } catch (err) {
      console.warn("Could not load custom BGM file, playing synthesized drone:", err);
    }
  }

  private transitionToCustomBGM() {
    if (!this.ctx || !this.bgmBuffer || !this.customBgmGain || !this.synthBgmGain || this.isBgmPlaying) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Set custom BGM gain to zero before starting
    this.customBgmGain.gain.cancelScheduledValues(now);
    this.customBgmGain.gain.setValueAtTime(0, now);

    const source = ctx.createBufferSource();
    source.buffer = this.bgmBuffer;
    source.loop = true;

    source.connect(this.customBgmGain);
    source.start(now);
    this.bgmSource = source;
    this.isBgmPlaying = true;

    // Cross-fade over 2.5 seconds
    this.customBgmGain.gain.linearRampToValueAtTime(1.0, now + 2.5);
    this.synthBgmGain.gain.cancelScheduledValues(now);
    this.synthBgmGain.gain.linearRampToValueAtTime(0.0, now + 2.5);

    // Stop oscillators to free up CPU after transition finishes
    setTimeout(() => {
      if (this.bgmOscs.length > 0) {
        this.bgmOscs.forEach(osc => {
          try { osc.stop(); } catch (e) { }
        });
        this.bgmOscs = [];
      }
      if (this.bgmLfo) {
        try { this.bgmLfo.stop(); } catch (e) { }
        this.bgmLfo = null;
      }
    }, 2700);
  }

  private startAmbientBGM() {
    if (!this.ctx || !this.synthBgmGain) return;

    const now = this.ctx.currentTime;

    // Create LFO to modulate filter cutoff
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, now); // 12.5 seconds per oscillation cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, now); // modulate cutoff by +/- 120 Hz

    lfo.connect(lfoGain);
    lfo.start(now);
    this.bgmLfo = lfo;

    // Filter for a warm, analog drone feeling
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(2.5, now);
    filter.frequency.setValueAtTime(180, now); // base frequency 180Hz
    lfoGain.connect(filter.frequency);

    // Spatial delay effect
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.35, now);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.18, now);

    delay.connect(delayGain);
    delayGain.connect(delay); // feedback loop

    // Osc 1: Sub bass (55Hz / G1 note)
    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(55, now);
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.4, now);
    osc1.connect(gain1).connect(filter);

    // Osc 2: Mid-drone triangle (110Hz / G2 note)
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110, now);
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.25, now);
    osc2.connect(gain2).connect(filter);

    // Osc 3: Fifth harmonic sawtooth (165Hz / D3 note)
    const osc3 = this.ctx.createOscillator();
    osc3.type = "sawtooth";
    osc3.frequency.setValueAtTime(165, now);
    const gain3 = this.ctx.createGain();
    gain3.gain.setValueAtTime(0.08, now);
    osc3.connect(gain3).connect(filter);

    // Connect filter to synth BGM gain and delay
    filter.connect(this.synthBgmGain);
    filter.connect(delay).connect(this.synthBgmGain);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    this.bgmOscs = [osc1, osc2, osc3];
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (mute) {
      // Fade out master volume smoothly over 0.5s to prevent audio pops
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
    } else {
      // Resume AudioContext if browser suspended it
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      // Fade in master volume smoothly over 1.2s
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(1.0, now + 1.2);

      // Transition to custom BGM if loaded in background and not yet playing
      if (this.bgmBuffer && !this.isBgmPlaying) {
        this.transitionToCustomBGM();
      }
    }
  }

  playSFX(type: SFXType) {
    if (!this.isInitialized || !this.ctx || !this.sfxGain || this.isMuted) return;

    // Check AudioContext state, resume if necessary (e.g. state was suspended)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const realTime = Date.now();

    // Throttling checks to avoid acoustic clutter
    if (type === "slide" && realTime - this.lastSFXPlayTimes.slide < 800) return;
    if (type === "text" && realTime - this.lastSFXPlayTimes.text < 180) return;
    if (type === "glitch" && realTime - this.lastSFXPlayTimes.glitch < 1200) return;

    this.lastSFXPlayTimes[type] = realTime;

    if (type === "slide") {
      this.synthesizeSlideSFX(now);
    } else if (type === "text") {
      this.synthesizeTextSFX(now);
    } else if (type === "glitch") {
      this.synthesizeGlitchSFX(now);
    }
  }

  private synthesizeSlideSFX(now: number) {
    if (!this.ctx || !this.sfxGain) return;

    const duration = 1.2;

    // 1. Sub Drop Sweep (low physical rumble)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + duration);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain).connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // 2. Bandpass White Noise Sweep (cinematic woosh)
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with random noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(2.2, now);
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(850, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(90, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.24, now + 0.4);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(filter).connect(noiseGain).connect(this.sfxGain);
    noiseNode.start(now);
    noiseNode.stop(now + duration);
  }

  private synthesizeTextSFX(now: number) {
    if (!this.ctx || !this.sfxGain) return;

    const duration = 0.04;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Rapid pitch sweep down creates a high-tech click/reveal feedback
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    gain.gain.setValueAtTime(0.04, now); // subtle volume
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  private synthesizeGlitchSFX(now: number) {
    if (!this.ctx || !this.sfxGain) return;

    const ctx = this.ctx;
    const sfxGain = this.sfxGain;

    const duration = 2.0;

    // 1. Heavy Sub Growl Foundation (Bold & Dark physical impact)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = "sawtooth";
    subOsc.frequency.setValueAtTime(55, now); // Low G1
    subOsc.frequency.linearRampToValueAtTime(40, now + duration); // sweeps down to G0 rumble

    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(90, now); // steep cut to keep it dark and bassy
    subFilter.Q.setValueAtTime(3.0, now);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.42, now + 0.15); // quick fade in
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subFilter).connect(subGain).connect(sfxGain);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // 2. High-resonance Lowpass Filter for the main anomaly chord
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(5.0, now); // high resonance for sweeping metallic growl
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.exponentialRampToValueAtTime(110, now + duration); // dark sweep down

    // 3. Feedback delay line for spacious, dark ambient echo
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.18, now);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.36, now); // stronger feedback tail

    delay.connect(delayGain).connect(sfxGain);
    delayGain.connect(delay);

    filter.connect(sfxGain);
    filter.connect(delay); // connect filter out to both dry gain and delay line

    // Pitch values (G2, D3, G3, Bb3, D4, G4 - G minor chord spanning frequencies)
    const frequencies = [98.00, 146.83, 196.00, 233.08, 293.66, 392.00];

    frequencies.forEach((freq, idx) => {
      // Stagger start times slightly for cascading temporal anomaly effect
      const startTime = now + idx * 0.06;
      const oscDuration = duration - (idx * 0.06);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sawtooth waves for higher registers, triangle/sine for lower
      osc.type = idx < 2 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime);

      // Fast FM pitch modulation (distortion growl)
      const vibrato = ctx.createOscillator();
      vibrato.frequency.setValueAtTime(32, startTime); // fast vibrato (32Hz)
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.setValueAtTime(14, startTime); // deep modulation (14Hz pitch swing)

      vibrato.connect(vibratoGain).connect(osc.frequency);
      vibrato.start(startTime);
      vibrato.stop(startTime + oscDuration);

      // Volume envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.05); // punchy volume fade-in
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + oscDuration - 0.2);

      osc.connect(gain).connect(filter); // route through sweeping lowpass filter

      osc.start(startTime);
      osc.stop(startTime + oscDuration);
    });
  }

  destroy() {
    try {
      this.bgmOscs.forEach(osc => {
        try { osc.stop(); } catch (e) { }
      });
      if (this.bgmLfo) {
        try { this.bgmLfo.stop(); } catch (e) { }
      }
      if (this.bgmSource) {
        try { this.bgmSource.stop(); } catch (e) { }
      }
      if (this.ctx) {
        this.ctx.close();
      }
    } catch (e) {
      console.warn("Cleanup warning: ", e);
    }
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const managerRef = useRef<SciFiAudioManager | null>(null);

  // Initialize manager on client mount
  useEffect(() => {
    managerRef.current = new SciFiAudioManager();
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
      }
    };
  }, []);

  const toggleMute = () => {
    if (!managerRef.current) return;

    if (!audioEnabled) {
      // First click: Initialize and start
      managerRef.current.init();
      managerRef.current.setMute(false);
      setAudioEnabled(true);
      setIsMuted(false);
    } else {
      // Toggle
      const newMutedState = !isMuted;
      managerRef.current.setMute(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const playSFX = (type: SFXType) => {
    if (managerRef.current) {
      managerRef.current.playSFX(type);
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, audioEnabled, toggleMute, playSFX }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
