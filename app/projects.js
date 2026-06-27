export const projects = [
  {
    slug: "grid-5x5",
    title: "Broken Ticket: 5x5",
    eyebrow: "Puzzle Grid",
    description: "Reassemble the carnival ticket from 25 pieces and verify the hidden QR phrase.",
    href: "/projects/grid-5x5",
    embed: "/projects/grid-5x5/index.html",
  },
  {
    slug: "audio-game",
    title: "Escape The Loop",
    eyebrow: "Audio Signal",
    description: "Tune the frequency, gain, and noise controls to reveal the stabilized signal.",
    href: "/projects/audio-game",
    embed: "/projects/audio-game/index.html",
  },
  {
    slug: "steganography",
    title: "Find What's Hidden",
    eyebrow: "Steganography",
    description: "Solve the image, zero-width text, and audio clues hidden across three prompts.",
    href: "/projects/steganography",
    embed: "/projects/steganography/index.html",
  },
  {
    slug: "technical",
    title: "Cryptic Shooting Range",
    eyebrow: "Technical",
    description: "Evaluate network and assembly-style targets to synchronize all challenge ranges.",
    href: "/projects/technical",
    embed: "/projects/technical/index.html",
  },
];

export function getProject(slug) {
  return projects.find((project) => project.slug === slug);
}
