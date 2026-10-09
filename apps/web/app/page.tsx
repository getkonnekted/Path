import Link from "next/link";
import { davidPath } from "@path/path-engine/david";

export default function HomePage() {
  const firstSteps = davidPath.steps.slice(0, 4);

  return (
    <main>
      <header className="shell topbar">
        <Link className="brand" href="/" aria-label="PATH home">PA<span>TH</span></Link>
        <span className="top-link">A more thoughtful way to learn Scripture</span>
      </header>

      <section className="shell hero">
        <div>
          <div className="eyebrow">Scripture · Understanding · Practice</div>
          <h1>Don’t just read Scripture. <span style={{ color: "var(--green)" }}>Know it.</span></h1>
          <p className="hero-copy">
            PATH turns Bible reading into a learning journey. Explore the people and events,
            understand the story, remember what matters, and connect what you learn.
          </p>
          <Link className="primary-link" href="/path/life-of-david">Start The Life of David <span aria-hidden="true">↗</span></Link>
        </div>

        <aside className="path-card" aria-label="Preview of The Life of David learning path">
          <div className="card-label">Your first learning journey</div>
          <h2>{davidPath.title}</h2>
          <p>{davidPath.description}</p>
          <div className="progress-track" aria-label="Preview progress"><div className="progress-fill" /></div>
          <div className="step-list">
            {firstSteps.map((step, index) => (
              <div className="step" key={step.id}>
                <div className="step-number">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-ref">{step.scriptureReferences.join(" · ")}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="shell section" id="first-path">
        <div className="eyebrow">How PATH works</div>
        <h2>Learn it. Remember it. Connect it.</h2>
        <p className="section-copy">
          Progress should mean more than finishing a chapter. PATH is designed around
          understanding and recall, with Scripture at the centre and explanations clearly
          distinguished from the text.
        </p>
        <div className="feature-grid">
          <article className="feature">
            <h3>01 · Guided journeys</h3>
            <p>Follow a clear route through a person, book, theme, or moment in the biblical story.</p>
          </article>
          <article className="feature">
            <h3>02 · Active memory</h3>
            <p>Practise recognition, recall, explanation, and connection instead of relying on rereading alone.</p>
          </article>
          <article className="feature">
            <h3>03 · Connected Scripture</h3>
            <p>Discover how passages, people, places, and events relate across the wider biblical narrative.</p>
          </article>
        </div>
      </section>

      <footer className="shell footer">
        PATH · Know Scripture. Walk the path.
      </footer>
    </main>
  );
}
