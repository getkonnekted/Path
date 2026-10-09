import Link from "next/link";
import { notFound } from "next/navigation";
import { davidPath } from "@path/path-engine/david";
import LessonExperience from "./lesson-experience";

export function generateStaticParams() {
  return [{ slug: davidPath.slug }];
}

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== davidPath.slug) notFound();

  return (
    <main>
      <header className="shell topbar">
        <Link className="brand" href="/" aria-label="PATH home">PA<span>TH</span></Link>
        <Link className="top-link" href="/">← All paths</Link>
      </header>
      <section className="shell lesson-shell">
        <div className="eyebrow">Your learning journey · {davidPath.estimatedMinutes} minutes</div>
        <h1 className="lesson-heading">{davidPath.title}<span className="lesson-subtitle">{davidPath.subtitle}</span></h1>
        <p className="lesson-intro">{davidPath.description}</p>
        <LessonExperience />
      </section>
      <footer className="shell footer">PATH · Know Scripture. Walk the path.</footer>
    </main>
  );
}
