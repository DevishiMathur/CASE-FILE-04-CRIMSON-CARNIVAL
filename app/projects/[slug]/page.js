import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectPlayer from "../../project-player";
import { getProject, projects } from "../../projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }) {
  const project = getProject(params.slug);

  if (!project) {
    return {
      title: "Challenge Not Found | Cryptic Hunt",
    };
  }

  return {
    title: `${project.title} | Cryptic Hunt`,
    description: project.description,
  };
}

export default function ProjectPage({ params }) {
  const project = getProject(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="play-shell">
      <header className="play-header">
        <Link href="/" className="back-link">
          Back
        </Link>
        <div>
          <p className="kicker">{project.eyebrow}</p>
          <h1>{project.title}</h1>
        </div>
        <a className="open-link" href={project.embed} target="_blank" rel="noreferrer">
          Fullscreen
        </a>
      </header>

      <ProjectPlayer project={project} />
    </main>
  );
}
