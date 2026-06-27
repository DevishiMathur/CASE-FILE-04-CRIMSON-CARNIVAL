"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import { storytellingSlides } from "./SlideScroller";
import { useAudio } from "./AudioProvider";
import AudioControl from "./AudioControl";
import Preloader from "./Preloader";

interface PreloaderContextType {
  isLoading: boolean;
  isExiting: boolean;
  preloaderActive: boolean;
  loadedCount: number;
  totalCount: number;
  startExperience: () => void;
  setPreloaderActive: (active: boolean) => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const { toggleMute } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // Define assets to preload
  const imageAssets = [
    "/preloader-assets/Logo.png",
    ...storytellingSlides.map(slide => encodeURI(slide.image))
  ];
  
  const audioAssets = [
    "/audio/story-start2.mp3"
  ];

  const totalCount = imageAssets.length + audioAssets.length + 1; // +1 for fonts
  const loadingStartedRef = useRef(false);

  useEffect(() => {
    // Avoid double-execution in dev React strict mode
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    let loadedItems = 0;

    const onItemLoaded = () => {
      loadedItems += 1;
      setLoadedCount(loadedItems);
      if (loadedItems >= totalCount) {
        setIsLoading(false);
      }
    };

    // 1. Preload Images
    imageAssets.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = onItemLoaded;
      img.onerror = () => {
        console.warn(`Preloader: Failed to load image ${src}`);
        onItemLoaded(); // resolve anyway to avoid blocking
      };
    });

    // 2. Preload Audio (fetches so it populates browser HTTP cache)
    audioAssets.forEach((src) => {
      fetch(src)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP status ${response.status}`);
          onItemLoaded();
        })
        .catch((err) => {
          console.warn(`Preloader: Failed to preload audio ${src}`, err);
          onItemLoaded(); // resolve anyway
        });
    });

    // 3. Preload Fonts
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => {
          onItemLoaded();
        })
        .catch((err) => {
          console.warn("Preloader: Font loading failed", err);
          onItemLoaded();
        });
    } else {
      // Fallback if Font Loading API is unsupported
      onItemLoaded();
    }
  }, []);

  const startExperience = () => {
    if (isLoading) return;
    
    // Unlock and initialize AudioContext
    toggleMute();
    
    // Signal the preloader component to play its exit animation
    setIsExiting(true);
  };

  return (
    <PreloaderContext.Provider
      value={{
        isLoading,
        isExiting,
        preloaderActive,
        loadedCount,
        totalCount,
        startExperience,
        setPreloaderActive
      }}
    >
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
}

export function PreloaderLayout({ children }: { children: React.ReactNode }) {
  const { preloaderActive } = usePreloader();
  const pathname = usePathname();

  // If we are on the case-01 route, we skip the preloader entirely.
  // The user explicitly requested to remove the repeated preloader on this route.
  const isCaseRoute = pathname?.startsWith('/hunt/case-01');

  if (isCaseRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {!preloaderActive && <AudioControl />}
      {children}
      {<Preloader />}
    </>
  );
}
