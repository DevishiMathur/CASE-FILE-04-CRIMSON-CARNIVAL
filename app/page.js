import Link from "next/link";
import CompletionCounter from "./completion-counter";
import { projects } from "./projects";

export default function HomePage() {
  return (
    <main className="site-shell">
      <section className="hero">
        <div>
          <h1>CRIMSON CARNIVAL</h1>
          <h2>Case File - 04</h2>
          <CompletionCounter total={projects.length} />
        </div>
      </section>

      <section className="project-grid" aria-label="Challenge routes">
        {projects.map((project) => (
          <Link className="project-card" href={project.href} key={project.slug}>
            <span>{project.eyebrow}</span>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <strong>Open challenge</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
