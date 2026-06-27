"use client";

import { useAudio } from "./AudioProvider";
import { useState } from "react";

export default function AudioControl() {
  const { isMuted, audioEnabled, toggleMute } = useAudio();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={toggleMute}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-4 right-4 md:top-6 md:right-8 z-50 flex items-center justify-center gap-2.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 bg-black/45 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-white/30 hover:bg-black/70 select-none group"
      aria-label={audioEnabled && !isMuted ? "Mute audio" : "Enable audio"}
    >
      {/* Tooltip Text - reveals on hover */}
      <span className={`text-[10px] md:text-xs font-sans tracking-[0.15em] font-bold text-zinc-400 transition-all duration-300 overflow-hidden whitespace-nowrap group-hover:text-white uppercase ${
        isHovered ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0"
      }`}>
        {!audioEnabled ? "Enable Audio" : isMuted ? "Unmute" : "Mute"}
      </span>

      {/* Visualizer Container */}
      <div className="flex items-end justify-center h-3.5 w-4.5 gap-[2.5px] pointer-events-none select-none">
        <span className={`w-[2px] rounded-full transition-all duration-300 ${
          !audioEnabled || isMuted ? "h-1 bg-white/20" : "eq-bar-1 h-3 bg-white"
        }`} />
        <span className={`w-[2px] rounded-full transition-all duration-300 ${
          !audioEnabled || isMuted ? "h-1 bg-white/20" : "eq-bar-2 h-3.5 bg-white"
        }`} />
        <span className={`w-[2px] rounded-full transition-all duration-300 ${
          !audioEnabled || isMuted ? "h-1 bg-white/20" : "eq-bar-3 h-2 bg-white"
        }`} />
        <span className={`w-[2px] rounded-full transition-all duration-300 ${
          !audioEnabled || isMuted ? "h-1 bg-white/20" : "eq-bar-4 h-3 bg-white"
        }`} />
      </div>
    </button>
  );
}
