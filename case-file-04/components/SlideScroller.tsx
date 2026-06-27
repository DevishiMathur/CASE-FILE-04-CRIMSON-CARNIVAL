"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useAudio } from "./AudioProvider";
import { usePreloader } from "./PreloaderContext";

// Register ScrollTrigger and GSAP React hook
gsap.registerPlugin(useGSAP, ScrollTrigger);

interface TextLine {
  text: string;
  type?: "normal" | "highlight" | "large" | "char-split";
}

interface Slide {
  image: string;
  title: string;
  lines: TextLine[];
}

export const storytellingSlides: Slide[] = [
  {
    image: "/Scroll-Images/01.png",
    title: "IMAGE 1 — NULL ARCHIVE",
    lines: [
      { text: "THE LORE", type: "large" },
      { text: "Every anomaly.", type: "normal" },
      { text: "Every unexplained event.", type: "normal" },
      { text: "Every impossible occurrence.", type: "normal" },
      { text: "For decades, they were stored here.", type: "normal" },
      { text: "Hidden from the public.", type: "normal" },
      { text: "Buried beneath layers of classification.", type: "normal" },
      { text: "The NULL ARCHIVE was never meant to be accessed.", type: "normal" },
      { text: "Until now.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/02.png",
    title: "IMAGE 2 — THE BREACH",
    lines: [
      { text: "The breach lasted exactly seventeen seconds.", type: "normal" },
      { text: "No alarms were triggered.", type: "normal" },
      { text: "No entry logs were recorded.", type: "normal" },
      { text: "Yet when the systems came back online...", type: "normal" },
      { text: "Entire investigations had vanished.", type: "normal" },
      { text: "Evidence was corrupted.", type: "normal" },
      { text: "Records were rewritten.", type: "normal" },
      { text: "Something had entered the archive.", type: "normal" },
      { text: "Something that should not exist.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/03.png",
    title: "IMAGE 3 — OMEGA ANALYSTS",
    lines: [
      { text: "Conventional recovery teams have failed.", type: "normal" },
      { text: "Automated restoration protocols have failed.", type: "normal" },
      { text: "The remaining data is unstable.", type: "normal" },
      { text: "You have been selected as an Omega Analyst.", type: "normal" },
      { text: "Your mission is simple:", type: "normal" },
      { text: "Recover the missing files.", type: "highlight" },
      { text: "Discover what happened.", type: "highlight" },
      { text: "Prevent it from happening again.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/04.png",
    title: "IMAGE 4 — CORRUPTED FILES",
    lines: [
      { text: "The archive contains dozens of anomaly reports.", type: "normal" },
      { text: "Most are incomplete.", type: "normal" },
      { text: "Some contradict themselves.", type: "normal" },
      { text: "Others appear to have never existed.", type: "normal" },
      { text: "Hidden within the corruption are fragments of truth.", type: "normal" },
      { text: "Find them.", type: "highlight" },
      { text: "Restore them.", type: "highlight" },
      { text: "Connect them.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/05.png",
    title: "IMAGE 5 — TIMELINE INSTABILITY",
    lines: [
      { text: "Initial analysis revealed a disturbing pattern.", type: "normal" },
      { text: "The missing files are connected.", type: "normal" },
      { text: "Not by location.", type: "normal" },
      { text: "Not by date.", type: "normal" },
      { text: "But by something else.", type: "normal" },
      { text: "A recurring distortion present in every case.", type: "normal" },
      { text: "A fracture in the timeline itself.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/06.png",
    title: "IMAGE 6 — FIRST GLIMPSE OF THE NULL EVENT",
    lines: [
      { text: "Several recovered records reference a single term.", type: "normal" },
      { text: "One that appears nowhere in official databases.", type: "normal" },
      { text: "One that should not exist.", type: "normal" },
      { text: "Witnesses describe impossible memories.", type: "normal" },
      { text: "Missing hours.", type: "normal" },
      { text: "Repeating days.", type: "normal" },
      { text: "Entire locations erased without explanation.", type: "normal" },
      { text: "All connected to:", type: "normal" },
      { text: "THE NULL EVENT", type: "char-split" }
    ]
  },
  {
    image: "/Scroll-Images/07.png",
    title: "IMAGE 7 — THE TRUTH IS HIDDEN",
    lines: [
      { text: "Every recovered case file restores part of the archive.", type: "normal" },
      { text: "Every solved investigation reveals another piece of the puzzle.", type: "normal" },
      { text: "The truth has been fragmented.", type: "normal" },
      { text: "Hidden across dozens of anomalies.", type: "normal" },
      { text: "Waiting to be reconstructed.", type: "highlight" }
    ]
  },
  {
    image: "/Scroll-Images/08.png",
    title: "IMAGE 8 — START OF THE HUNT",
    lines: [
      { text: "The archive is unstable.", type: "normal" },
      { text: "Time is running out.", type: "normal" },
      { text: "The first corrupted case file is ready for analysis.", type: "normal" },
      { text: "Somewhere within it lies the first clue.", type: "normal" },
      { text: "Recover the evidence.", type: "normal" },
      { text: "Restore the record.", type: "normal" },
      { text: "Uncover the truth.", type: "normal" },
      { text: "Begin Investigation.", type: "large" }
    ]
  }
];

export default function SlideScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSFX } = useAudio();
  const { preloaderActive } = usePreloader();
  const handleStartInvestigation = () => {
    playSFX("glitch");
  };

  useGSAP(() => {
    if (preloaderActive) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // ─────────────────────────────────────────────────────────────
      // ACCESSIBILITY FALLBACK: REDUCED MOTION TIMELINE
      // ─────────────────────────────────────────────────────────────
      gsap.set(".start-investigation-btn-container", { opacity: 0, display: "none" });
      const fallbackSnapPoints: number[] = [0];
      const fallbackTotalDuration = storytellingSlides.length;
      storytellingSlides.forEach((slide, i) => {
        const tStart = i;
        const lineCount = slide.lines.length;
        const step = 0.8 / Math.max(lineCount, 1);
        slide.lines.forEach((_, lIdx) => {
          if (i === 0 && lIdx === 0) return;
          const isLastLine = lIdx === lineCount - 1;
          const lineMid = isLastLine
            ? tStart + 0.95 - 0.5 * step
            : tStart + 0.1 + (lIdx + 0.5) * step;
          fallbackSnapPoints.push(lineMid / fallbackTotalDuration);
        });
      });
      if (fallbackSnapPoints[fallbackSnapPoints.length - 1] < 0.99) {
        fallbackSnapPoints.push(1);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${storytellingSlides.length * 4.5 * window.innerHeight}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          snap: {
            snapTo: fallbackSnapPoints,
            duration: { min: 0.2, max: 0.6 },
            delay: 0.12,
            ease: "power1.inOut"
          }
        }
      });

      storytellingSlides.forEach((slide, i) => {
        const tStart = i;

        if (i > 0) {
          tl.to(`.slide-img-${i - 1}`, { opacity: 0, duration: 0.4 }, tStart);
          tl.to(`.slide-text-container-${i - 1}`, { 
            opacity: 0, 
            backdropFilter: "blur(0px)",
            duration: 0.25 
          }, tStart + 0.1);
          tl.set(`.slide-text-container-${i - 1}`, { display: "none" }, tStart + 0.35);

          tl.set(`.slide-text-container-${i}`, { display: "flex" }, tStart + 0.1);
          tl.to(`.slide-img-${i}`, { opacity: 1, duration: 0.4 }, tStart);
          tl.to(`.slide-text-container-${i}`, { 
            opacity: 1, 
            backdropFilter: "blur(16px)",
            duration: 0.25 
          }, tStart + 0.1);
          tl.call(() => {
            const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
            if (isForward) playSFX("slide");
          }, undefined, tStart);
        } else {
          tl.set(".slide-text-container-0", { 
            display: "flex", 
            opacity: 1,
            backdropFilter: "blur(16px)"
          }, 0);
        }

        const lineCount = slide.lines.length;
        const step = 0.8 / Math.max(lineCount, 1);
        slide.lines.forEach((line, lIdx) => {
          const lineStart = tStart + 0.1 + lIdx * step;
          const lineEnd = lineStart + step;
          const isInitialLore = i === 0 && lIdx === 0;
          const isLastLine = lIdx === lineCount - 1;
          
          tl.set(`.slide-text-${i}-line-${lIdx}`, { opacity: isInitialLore ? 1 : 0 }, tStart);
          if (isInitialLore) {
            const fadeOutDur = Math.min(0.1, step * 0.35);
            tl.to(`.slide-text-${i}-line-${lIdx}`, { opacity: 0, duration: fadeOutDur }, lineEnd - fadeOutDur);
          } else {
            tl.call(() => {
              const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
              if (isForward) {
                const isGlitch = line.type === "char-split" ||
                  line.text === "Something that should not exist." ||
                  line.text === "The remaining data is unstable." ||
                  line.text === "Hidden within the corruption are fragments of truth." ||
                  line.text === "A recurring distortion present in every case." ||
                  line.text === "A fracture in the timeline itself." ||
                  line.text === "One that should not exist." ||
                  line.text === "The truth has been fragmented." ||
                  line.text === "The archive is unstable.";
                if (isGlitch) {
                  playSFX("glitch");
                } else {
                  playSFX("text");
                }
              }
            }, undefined, lineStart);
            const fadeInDur = Math.min(0.1, step * 0.25);
            const fadeOutDur = Math.min(0.08, step * 0.20);
            tl.to(`.slide-text-${i}-line-${lIdx}`, { opacity: 1, duration: fadeInDur }, lineStart);
            if (!isLastLine) {
              tl.to(`.slide-text-${i}-line-${lIdx}`, { opacity: 0, duration: fadeOutDur }, lineEnd - fadeOutDur);
            }
          }
        });
      });

      const fallbackLastSlideIdx = storytellingSlides.length - 1;
      const fallbackLastSlideStart = fallbackLastSlideIdx;
      const fallbackLastLineStep = 0.8 / storytellingSlides[fallbackLastSlideIdx].lines.length;
      const fallbackBtnFadeStart = fallbackLastSlideStart + 0.1 + (storytellingSlides[fallbackLastSlideIdx].lines.length - 1) * fallbackLastLineStep;
      
      tl.set(".start-investigation-btn-container", { display: "flex" }, fallbackBtnFadeStart);
      tl.fromTo(".start-investigation-btn-container", 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3 }, 
        fallbackBtnFadeStart
      );

      return;
    }

    // ─────────────────────────────────────────────────────────────
    // DYNAMIC CINEMATIC STORYTELLING TIMELINE (60FPS)
    // ─────────────────────────────────────────────────────────────


    // Initialize initial slide visibility states
    gsap.set(".start-investigation-btn-container", { opacity: 0, display: "none" });
    gsap.set(".slide-text-container-0", { 
      opacity: 1,
      scale: 1,
      backdropFilter: "blur(16px)"
    });
    storytellingSlides[0].lines.forEach((_, lIdx) => {
      gsap.set(`.slide-text-0-line-${lIdx}`, { opacity: lIdx === 0 ? 1 : 0 });
    });

    const snapPoints: number[] = [0];
    const totalDuration = storytellingSlides.length * 10;
    storytellingSlides.forEach((slide, sIdx) => {
      const tStart = sIdx * 10;
      const lineCount = slide.lines.length;
      const availableTime = 7.2;
      const step = availableTime / Math.max(lineCount, 1);
      slide.lines.forEach((_, lIdx) => {
        if (sIdx === 0 && lIdx === 0) return;
        const isLastLine = lIdx === lineCount - 1;
        const lineMid = isLastLine
          ? tStart + 9.2 - 0.5 * step
          : tStart + 1.2 + (lIdx + 0.5) * step;
        snapPoints.push(lineMid / totalDuration);
      });
    });
    if (snapPoints[snapPoints.length - 1] < 0.99) {
      snapPoints.push(1);
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${storytellingSlides.length * 9 * window.innerHeight}`, // smooth vertical pinning duration
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.2, max: 0.6 },
          delay: 0.12,
          ease: "power1.inOut"
        }
      }
    });

    tl.addLabel("end", totalDuration);

    // Dynamically generate ScrollTrigger timings for each slide
    storytellingSlides.forEach((slide, sIdx) => {
      const tStart = sIdx * 10;

      // 1. Image & text-container transitions
      if (sIdx > 0) {
        // Transition previous slide out
        tl.to(`.slide-img-${sIdx - 1}`, { opacity: 0, duration: 1.2, ease: "power2.inOut" }, tStart);
        tl.to(`.slide-text-container-${sIdx - 1}`, { 
          opacity: 0, 
          scale: 0.95,
          backdropFilter: "blur(0px)",
          duration: 0.6, 
          ease: "power2.in" 
        }, tStart + 1.0);
        tl.set(`.slide-text-container-${sIdx - 1}`, { display: "none" }, tStart + 1.6);

        // Transition current slide in
        tl.set(`.slide-text-container-${sIdx}`, { display: "flex" }, tStart + 1.0);
        tl.fromTo(`.slide-img-${sIdx}`, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.inOut" }, tStart);
        tl.fromTo(`.slide-text-container-${sIdx}`, 
          { opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }, 
          { opacity: 1, scale: 1, backdropFilter: "blur(16px)", duration: 0.6, ease: "power2.out" }, 
          tStart + 1.0
        );
        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          if (isForward) playSFX("slide");
        }, undefined, tStart);
      }

      // 2. Sequential line-by-line reveal animation
      const lineCount = slide.lines.length;
      const availableTime = 7.2; // reveals happen inside this window
      const step = availableTime / Math.max(lineCount, 1);

      slide.lines.forEach((line, lIdx) => {
        const lineStart = tStart + 1.2 + lIdx * step;
        const lineEnd = lineStart + step;
        const isInitialLore = sIdx === 0 && lIdx === 0;
        const isLastLine = lIdx === lineCount - 1;

        if (line.type === "char-split") {
          // Staggered letter-by-letter reveal for high-impact keywords (e.g. AETHERION)
          const charCount = line.text.length;
          const charFadeInDur = Math.min(0.4, step * 0.30);
          const charStaggerIn = Math.min(0.025, (step * 0.1) / Math.max(charCount, 1));
          const charFadeOutDur = Math.min(0.3, step * 0.20);
          const charStaggerOut = Math.min(0.015, (step * 0.05) / Math.max(charCount, 1));

          tl.set(`.slide-text-${sIdx}-line-${lIdx}`, { opacity: 1 }, lineStart);
          tl.call(() => {
            const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
            if (isForward) playSFX("glitch");
          }, undefined, lineStart);
          tl.fromTo(
            `.slide-text-${sIdx}-line-${lIdx} .aetherion-char`,
            { opacity: 0, scale: 1.8, y: 10, filter: "blur(8px)" },
            { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", stagger: charStaggerIn, duration: charFadeInDur, ease: "power2.out" },
            lineStart
          );
          
          if (!isLastLine) {
            // Fade out before next line starts
            const fadeOutStart = lineEnd - (charCount * charStaggerOut + charFadeOutDur);
            tl.to(
              `.slide-text-${sIdx}-line-${lIdx} .aetherion-char`,
              { opacity: 0, scale: 0.9, y: -10, filter: "blur(6px)", stagger: charStaggerOut, duration: charFadeOutDur, ease: "power2.in" },
              Math.max(lineStart + charFadeInDur, fadeOutStart)
            );
            tl.set(`.slide-text-${sIdx}-line-${lIdx}`, { opacity: 0 }, lineEnd);
          }
        } else {
          // Standard fade, slide upward, and blur-in reveal
          if (isInitialLore) {
            // Already visible, only fade out at the end of its block
            const fadeOutDur = Math.min(0.25, step * 0.20);
            tl.to(
              `.slide-text-${sIdx}-line-${lIdx}`,
              { opacity: 0, y: -15, filter: "blur(6px)", duration: fadeOutDur, ease: "power2.in" },
              lineEnd - fadeOutDur
            );
          } else {
            tl.call(() => {
              const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
              if (isForward) {
                const isGlitch = line.text === "Something that should not exist." ||
                  line.text === "The remaining data is unstable." ||
                  line.text === "Hidden within the corruption are fragments of truth." ||
                  line.text === "A recurring distortion present in every case." ||
                  line.text === "A fracture in the timeline itself." ||
                  line.text === "One that should not exist." ||
                  line.text === "The truth has been fragmented." ||
                  line.text === "The archive is unstable.";
                if (isGlitch) {
                  playSFX("glitch");
                } else {
                  playSFX("text");
                }
              }
            }, undefined, lineStart);

            const fadeInDur = Math.min(0.3, step * 0.25);
            const fadeOutDur = Math.min(0.25, step * 0.20);

            tl.fromTo(
              `.slide-text-${sIdx}-line-${lIdx}`,
              { opacity: 0, y: 15, filter: "blur(6px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", duration: fadeInDur, ease: "power2.out" },
              lineStart
            );
            if (!isLastLine) {
              // Fade out before next line starts
              tl.to(
                `.slide-text-${sIdx}-line-${lIdx}`,
                { opacity: 0, y: -15, filter: "blur(6px)", duration: fadeOutDur, ease: "power2.in" },
                lineEnd - fadeOutDur
              );
            }
          }
        }
      });
    });

    // Add Start Investigation button fade-in at the end
    const lastSlideIdx = storytellingSlides.length - 1;
    const lastSlideStart = lastSlideIdx * 10;
    const lastLineStep = 7.2 / storytellingSlides[lastSlideIdx].lines.length;
    const btnFadeStart = lastSlideStart + 1.2 + (storytellingSlides[lastSlideIdx].lines.length - 1) * lastLineStep;
    
    tl.set(".start-investigation-btn-container", { display: "flex" }, btnFadeStart);
    tl.fromTo(".start-investigation-btn-container", 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 
      btnFadeStart
    );

    // ─────────────────────────────────────────────────────────────
    // MOUSE PARALLAX EFFECT FOR BACKGROUND IMAGES
    // ─────────────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      
      gsap.to(".slide-img", {
        x: xOffset * 10,
        y: yOffset * 10,
        duration: 1.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };

  }, { 
    dependencies: [preloaderActive],
    scope: containerRef,
    revertOnUpdate: true
  });

  return (
    <div
      ref={containerRef}
      className="slide-scroller-container relative w-full h-screen overflow-hidden bg-[#050508] select-none text-white font-sans"
      style={{
        filter: preloaderActive ? "blur(12px)" : "none"
      }}
    >


      {/* Image Layer Stack */}
      <div className="absolute inset-0 w-full h-full z-0 bg-[#020204]">
        {storytellingSlides.map((slide, i) => (
          <img
            key={i}
            src={encodeURI(slide.image)}
            alt={slide.title}
            className={`slide-img slide-img-${i} absolute inset-0 w-full h-full object-cover pointer-events-none select-none scale-105`}
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Atmospheric overlays (vignetting + screen space filters) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#050508]/95 via-transparent to-[#050508]/40" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(5,5,8,0.85)_100%)]" />
      <div className="scanlines crt-flicker absolute inset-0 z-10 pointer-events-none" />

      {/* Text Sequences Container */}
      <div className="absolute inset-0 z-30 flex flex-col justify-start pt-6 md:pt-8 px-6 md:px-12 pointer-events-none select-none">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative h-20 md:h-24">
          {storytellingSlides.map((slide, sIdx) => (
            <div
              key={sIdx}
              className={`slide-text-container-${sIdx} absolute inset-0 flex items-center justify-center ${sIdx === 0 ? "opacity-100" : "opacity-0"} px-6 py-3 bg-black/35 border border-white/10 rounded-full shadow-2xl`}
              style={{
                display: sIdx === 0 ? "flex" : "none",
                backdropFilter: sIdx === 0 ? "blur(16px)" : "blur(0px)",
                WebkitBackdropFilter: sIdx === 0 ? "blur(16px)" : "blur(0px)",
              }}
            >
              {slide.lines.map((line, lIdx) => {
                let lineClass = "";

                if (line.type === "highlight") {
                  lineClass = "text-lg md:text-xl font-sans tracking-wide text-zinc-200 font-medium text-center leading-relaxed max-w-2xl px-4";
                } else if (line.type === "large") {
                  lineClass = "text-xl md:text-3xl font-serif text-white tracking-[0.2em] font-black text-center leading-normal uppercase max-w-2xl px-4";
                } else if (line.type === "char-split") {
                  lineClass = "text-2xl md:text-5xl font-serif text-white tracking-[0.25em] font-extrabold uppercase flex justify-center flex-wrap max-w-2xl px-4";
                } else {
                  lineClass = "text-sm md:text-base font-sans tracking-[0.18em] text-zinc-400 font-light text-center leading-relaxed max-w-2xl px-4";
                }

                const isInitialLore = sIdx === 0 && lIdx === 0;
                return (
                  <div
                    key={lIdx}
                    className={`slide-text-${sIdx}-line-${lIdx} absolute inset-0 flex items-center justify-center ${isInitialLore ? "opacity-100" : "opacity-0"}`}
                  >
                    {line.type === "char-split" ? (
                      <div className={lineClass}>
                        {line.text.split(" ").map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className="inline-block whitespace-nowrap mr-[0.5em] last:mr-0"
                          >
                            {word.split("").map((char, cIdx) => (
                              <span
                                key={cIdx}
                                className="aetherion-char inline-block"
                              >
                                {char}
                              </span>
                            ))}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={lineClass}>
                        {line.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Start Investigation Button Container */}
      <div className="start-investigation-btn-container absolute bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-auto" style={{ display: "none", opacity: 0 }}>
        <Link
          href="/hunt"
          onClick={handleStartInvestigation}
          className="relative px-10 py-4 bg-transparent border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-sans text-[11px] tracking-[0.25em] uppercase rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:bg-cyan-500/[0.03] cursor-pointer active:scale-95 flex items-center gap-3 group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse group-hover:scale-125 transition-transform" />
          Start Investigation
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse group-hover:scale-125 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
