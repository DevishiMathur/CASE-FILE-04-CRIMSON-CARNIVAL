"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "case4.completedProjects";

function readCompleted() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function CompletionCounter({ total }) {
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const sync = () => setCompleted(readCompleted());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="completion-counter" aria-live="polite">
      <span>Completed</span>
      <strong>
        {completed.length}/{total}
      </strong>
    </div>
  );
}
