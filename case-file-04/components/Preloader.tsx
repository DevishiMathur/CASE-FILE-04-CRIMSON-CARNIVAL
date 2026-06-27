"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePreloader } from "./PreloaderContext";

export default function Preloader() {
  const {
    isLoading,
    isExiting,
    preloaderActive,
    startExperience,
    setPreloaderActive
  } = usePreloader();

  const [introCompleted, setIntroCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  const headphoneRef = useRef<HTMLDivElement>(null);

  // Split text helper to wrap each character in a span for GSAP targeting
  const splitText = (text: string, charClass: string) => {
    return text.split("").map((char, index) => {
      if (char === " ") {
        return (
          <span key={index} className="inline-block">
            &nbsp;
          </span>
        );
      }
      return (
        <span key={index} className={`${charClass} inline-block`}>
          {char}
        </span>
      );
    });
  };

  // 1. Entrance timeline
  useGSAP(() => {
    if (!preloaderActive) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Accessibility fallback: bypass cinematic motion, render immediately
      gsap.set([logoRef.current, glowRef.current, titleContainerRef.current, headphoneRef.current], {
        autoAlpha: 1,
        scale: 1,
        filter: "none"
      });
      gsap.set(".ieee-title", { autoAlpha: 1 });
      gsap.set(".ieee-char, .cryptic-char", {
        opacity: 1,
        y: 0,
        filter: "none"
      });
      setIntroCompleted(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIntroCompleted(true);
      }
    });

    // Initial styles set before paint
    gsap.set(logoRef.current, { scale: 0.9, autoAlpha: 0 });
    gsap.set(glowRef.current, { scale: 0.75, autoAlpha: 0 });
    gsap.set(".ieee-title", { autoAlpha: 1 });
    gsap.set(".ieee-char", { opacity: 0, y: 60 });
    gsap.set(titleContainerRef.current, { autoAlpha: 1, letterSpacing: "0.8em" });
    gsap.set(".cryptic-char", { opacity: 0, filter: "blur(12px)", scale: 1.15 });
    gsap.set(headphoneRef.current, { y: 15, scale: 0.95, autoAlpha: 0 });

    // Sequence 1: Logo fades in and scales
    tl.to(logoRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.2,
      ease: "power3.out"
    })
    .to(glowRef.current, {
      autoAlpha: 0.2,
      scale: 1.0,
      duration: 1.5,
      ease: "power2.out"
    }, "-=0.8");

    // Sequence 2: "IEEE CS MUJ" characters roll up (staggered)
    tl.to(".ieee-char", {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.8,
      ease: "power4.out"
    }, "-=0.8");

    // Sequence 3: "CRYPTIC HUNT" letters converge and sharpen (Option B)
    tl.to(titleContainerRef.current, {
      letterSpacing: "0.25em",
      duration: 2.2,
      ease: "power3.out"
    }, "-=0.4")
    .to(".cryptic-char", {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      stagger: 0.05,
      duration: 1.6,
      ease: "power2.out"
    }, "-=2.2");

    // Sequence 4: Headphone advisory fades in
    tl.to(headphoneRef.current, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.6");

    // Ambient background pulse for headphone advisory icon
    tl.call(() => {
      gsap.to(".headphone-glow", {
        opacity: 0.25,
        scale: 1.2,
        repeat: -1,
        yoyo: true,
        duration: 2.0,
        ease: "sine.inOut"
      });
    });

  }, { scope: containerRef });

  // 2. Loading -> Ready state button transition
  useGSAP(() => {
    if (introCompleted && preloaderActive) {
      // Animate parent state container in
      gsap.to(".btn-state-container", {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out"
      });

      // Animate button specifically if load finished
      if (!isLoading) {
        gsap.fromTo(".btn-container",
          { autoAlpha: 0, scale: 0.95 },
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }
        );
      }
    }
  }, { dependencies: [introCompleted, isLoading, preloaderActive], scope: containerRef });

  // 3. Exit timeline (triggered when user clicks button)
  useGSAP(() => {
    if (!isExiting || !preloaderActive) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setPreloaderActive(false);
      return;
    }

    const exitTl = gsap.timeline({
      onComplete: () => {
        setPreloaderActive(false);
      }
    });

    // Fade out preloader content elements first with small lift and blur
    exitTl.to([
      logoRef.current,
      glowRef.current,
      ".ieee-title",
      titleContainerRef.current,
      headphoneRef.current,
      ".btn-state-container"
    ], {
      opacity: 0,
      y: -20,
      scale: 0.95,
      filter: "blur(8px)",
      stagger: 0.04,
      duration: 0.6,
      ease: "power2.in"
    });

    // Dissolve the black background overlay
    exitTl.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "-=0.3");

    // Bypass container scope check to animate the external scroller blur transition
    const slideScroller = document.querySelector(".slide-scroller-container");
    if (slideScroller) {
      exitTl.fromTo(slideScroller, {
        filter: "blur(12px)",
        scale: 1.02
      }, {
        filter: "blur(0px)",
        scale: 1.0,
        duration: 1.0,
        ease: "power2.out"
      }, "-=0.8");
    }

  }, { dependencies: [isExiting, preloaderActive], scope: containerRef });

  if (!preloaderActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] select-none text-white overflow-hidden"
    >
      {/* Background visual treatments */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(10,10,15,0.4)_0%,rgba(0,0,0,1)_80%)]" />
      <div className="scanlines crt-flicker absolute inset-0 z-0 pointer-events-none opacity-50" />

      {/* Centered content wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        
        {/* IEEE Logo & Glow */}
        <div className="relative flex items-center justify-center mb-8 select-none pointer-events-none">
          <div
            ref={glowRef}
            className="logo-glow absolute w-36 h-36 bg-white/5 rounded-full blur-2xl"
            style={{ opacity: 0, visibility: "hidden" }}
          />
          <img
            ref={logoRef}
            src="/preloader-assets/Logo.png"
            alt="IEEE CS MUJ Logo"
            className="logo-img relative w-24 h-24 md:w-28 md:h-28 object-contain"
            style={{ opacity: 0, visibility: "hidden" }}
          />
        </div>

        {/* IEEE Title */}
        <div
          className="ieee-title text-zinc-500 font-sans text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase select-none mb-1 flex items-center justify-center"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {splitText("IEEE CS MUJ", "ieee-char")}
        </div>

        {/* Cryptic Hunt Title */}
        <h1
          ref={titleContainerRef}
          className="cryptic-title text-white font-serif text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.8em] select-none flex items-center justify-center whitespace-nowrap mb-6"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {splitText("PROJECT MAYHEM", "cryptic-char")}
        </h1>

        {/* Headphone Advice */}
        <div
          ref={headphoneRef}
          className="headphone-msg flex flex-col items-center mt-12"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <div className="relative flex items-center justify-center mb-3">
            <div className="headphone-glow absolute w-10 h-10 bg-white/5 rounded-full blur-md" />
            <svg
              className="relative w-7 h-7 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <span className="text-[10px] md:text-[11px] font-sans tracking-[0.25em] font-medium text-zinc-500 uppercase">
            Use Headphones For Best Experience
          </span>
        </div>

        {/* Button & Loading State Container */}
        <div
          className="btn-state-container h-16 flex items-center justify-center mt-8 w-full"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {!isLoading ? (
            <div className="btn-container" style={{ opacity: 0, visibility: "hidden" }}>
              <button
                onClick={startExperience}
                className="btn-continue relative px-8 py-3 bg-transparent border border-white/10 hover:border-white/40 text-white font-sans text-[11px] tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:bg-white/[0.02] cursor-pointer"
              >
                Continue With Audio
              </button>
            </div>
          ) : (
            <div className="text-zinc-600 font-sans text-[9px] tracking-[0.2em] uppercase animate-pulse select-none">
              [ ESTABLISHING SECURE CONNECTION ]
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
