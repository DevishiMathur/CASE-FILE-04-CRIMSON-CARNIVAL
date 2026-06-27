import Link from "next/link";

export default function HuntPage() {
  const caseFiles = Array.from({ length: 9 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `Case-File-${num}`;
  });

  return (
    <main className="flex flex-col items-center min-h-screen w-full bg-black text-white pt-16 md:pt-24 px-6 pb-24">
      <h1 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-zinc-100 uppercase select-none mb-12 md:mb-16">
        Choose Case File
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {caseFiles.map((fileName, index) => {
          const num = String(index + 1).padStart(2, "0");
          return (
          <Link
            key={index}
            href={fileName === "Case-File-01" ? "/hunt/case-01" : "#"}
            className="flex items-center justify-center h-36 md:h-44 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] hover:-translate-y-1 group relative overflow-hidden"
          >
            {/* Subtle glow border effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <span className="font-mono text-xs md:text-sm tracking-[0.25em] text-zinc-400 group-hover:text-cyan-400 transition-colors uppercase duration-300">
              {fileName}
            </span>
          </Link>
          );
        })}
      </div>
    </main>
  );
}