"use client";

import { useEffect } from "react";

const STORAGE_KEY = "case4.completedProjects";

function markComplete(slug) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const completed = Array.isArray(parsed) ? parsed : [];

    if (!completed.includes(slug)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed, slug]));
    }
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([slug]));
  }
}

export default function ProjectPlayer({ project }) {
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === "cryptic-hunt-complete" && event.data.slug) {
        markComplete(event.data.slug);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      className="project-frame"
      title={project.title}
      src={project.embed}
      allow="autoplay; microphone; clipboard-read; clipboard-write"
    />
  );
}
