"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const lessons = [
  {
    title: "A king no one expected",
    reference: "1 Samuel 16:1–13",
    kind: "READ",
    minutes: "5 min",
    body: "Samuel is sent to Jesse's household to anoint Israel's next king. The passage contrasts what people notice on the outside with what God sees in the heart. David, the youngest son who was tending the sheep, is brought in and anointed.",
    takeaway: "David's story begins away from the throne, in an ordinary family and an overlooked role.",
    prompt: "Before continuing, read 1 Samuel 16:1–13 in a Bible translation you have permission to use. Notice who is present, who is absent at first, and what Samuel learns about choosing a king."
  },
  {
    title: "Look beneath the surface",
    reference: "1 Samuel 16:6–13",
    kind: "EXPLORE",
    minutes: "4 min",
    body: "When Samuel sees Jesse's sons, he initially assumes appearance signals suitability. The passage redirects his attention: outward appearance is not the decisive measure. Read the surrounding verses carefully to see how the story makes that contrast.",
    takeaway: "Pay attention to the contrast the text itself makes; do not reduce the passage to a slogan detached from its setting.",
    prompt: "Reread verses 6–13. Which detail changes Samuel's initial expectation? Keep your observation grounded in the passage."
  },
  {
    title: "Put the story in order",
    reference: "1 Samuel 16:1–13",
    kind: "REMEMBER",
    minutes: "3 min",
    body: "Memory grows when you retrieve a story rather than only reread it. Try to recall the sequence: Samuel's mission, meeting Jesse's sons, the question about the remaining son, David being brought in, and the anointing.",
    takeaway: "A useful study habit is to retell the passage in your own words, then check the text for anything you missed.",
    prompt: "Close or look away from the passage and explain the sequence out loud. Then compare your retelling with the chapter."
  }
];

const questions = [
  {
    question: "Where was David when Samuel first arrived at Jesse's household?",
    options: ["Serving in Saul's palace", "Tending the sheep", "Preparing to fight Goliath", "Leading Israel's army"],
    answer: 1,
    explanation: "David was tending the sheep and had to be sent for. Read 1 Samuel 16:11 to check the detail."
  },
  {
    question: "What contrast is central to Samuel's lesson in 1 Samuel 16?",
    options: ["Wealth and poverty", "Youth and old age", "Outward appearance and the heart", "War and peace"],
    answer: 2,
    explanation: "The passage contrasts outward appearance with the heart. Revisit verses 6–7 and read them in context."
  },
  {
    question: "What is the best way to check whether you understood the passage?",
    options: ["Memorize a slogan only", "Assume you know it after one read", "Retell the events, then check the text", "Skip directly to the next chapter"],
    answer: 2,
    explanation: "Retrieving the story in your own words and checking it against the passage helps reveal what you remember and what needs another look."
  }
];

type SavedJourney = {
  activeLesson: number;
  visitedLessons: number[];
  quizCompleted: boolean;
  latestScore: number | null;
};

const STORAGE_KEY = "path:life-of-david:progress:v1";

export default function LessonExperience() {
  const [activeLesson, setActiveLesson] = useState(0);
  const [visitedLessons, setVisitedLessons] = useState<number[]>([0]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedJourney>;
        if (typeof saved.activeLesson === "number" && saved.activeLesson >= 0 && saved.activeLesson < lessons.length) {
          setActiveLesson(saved.activeLesson);
        }
        if (Array.isArray(saved.visitedLessons)) {
          setVisitedLessons(saved.visitedLessons.filter((index): index is number =>
            Number.isInteger(index) && index >= 0 && index < lessons.length
          ));
        }
        if (typeof saved.quizCompleted === "boolean") setQuizCompleted(saved.quizCompleted);
        if (typeof saved.latestScore === "number" && saved.latestScore >= 0 && saved.latestScore <= questions.length) {
          setLatestScore(saved.latestScore);
        }
      }
    } catch {
      // Storage may be disabled or contain an invalid older value; keep the session usable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved: SavedJourney = { activeLesson, visitedLessons, quizCompleted, latestScore };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Learning still works when the browser blocks local storage.
    }
  }, [activeLesson, visitedLessons, quizCompleted, latestScore, hydrated]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const lesson = lessons[activeLesson]!;
  const question = questions[questionIndex]!;
  const correctCount = answers.filter(Boolean).length;
  const percent = quizCompleted ? 100 : quizStarted ? 80 + Math.round((questionIndex / questions.length) * 20) : Math.round((visitedLessons.length / lessons.length) * 80);

  function visitLesson(index: number) {
    setActiveLesson(index);
    setVisitedLessons((previous) => previous.includes(index) ? previous : [...previous, index]);
  }

  function chooseAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setAnswers((previous) => [...previous, index === question.answer]);
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setSelected(null);
      return;
    }
    setQuizCompleted(true);
    setLatestScore(correctCount);
    setFinished(true);
  }

  function restartQuiz() {
    setQuizStarted(true);
    setQuestionIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  }

  return (
    <div className="learning-layout">
      <aside className="learning-sidebar">
        <div className="card-label">YOUR PATH</div>
        <div className="learning-progress-label"><span>Journey progress</span><strong>{percent}%</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: percent + "%" }} /></div>
        {lessons.map((item, index) => (
          <button
            className={"lesson-nav" + (activeLesson === index && !quizStarted ? " active" : "")}
            key={item.title}
            onClick={() => { visitLesson(index); setQuizStarted(false); setFinished(false); }}
          >
            <span className="lesson-nav-number">{visitedLessons.includes(index) ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <span><strong>{item.title}</strong><small>{item.kind} · {item.minutes}</small></span>
          </button>
        ))}
        <div className="sidebar-note">{hydrated ? "Progress is saved on this device, so you can return to this journey in the same browser." : "Restoring your learning progress…"}{latestScore !== null && <strong className="saved-score">Latest quiz: {latestScore} of {questions.length} correct</strong>}</div>
      </aside>

      <section className="lesson-panel" aria-live="polite">
        {!quizStarted && !finished && (
          <>
            <div className="lesson-meta"><span>{lesson.kind}</span><span>{lesson.minutes}</span></div>
            <h2>{lesson.title}</h2>
            <div className="scripture-reference">READ IN YOUR BIBLE · {lesson.reference}</div>
            <p className="lesson-body">{lesson.body}</p>
            <div className="insight-card"><span className="insight-label">KEY OBSERVATION</span><p>{lesson.takeaway}</p></div>
            <div className="reading-prompt"><strong>Try this</strong><p>{lesson.prompt}</p></div>
            <div className="lesson-actions">
              <button className="secondary-button" onClick={() => visitLesson((activeLesson + lessons.length - 1) % lessons.length)}>Previous lesson</button>
              {activeLesson < lessons.length - 1 ? (
                <button className="primary-button" onClick={() => visitLesson(activeLesson + 1)}>Next lesson <span aria-hidden="true">→</span></button>
              ) : (
                <button className="primary-button" onClick={() => { setQuizStarted(true); setQuestionIndex(0); setSelected(null); setAnswers([]); setFinished(false); }}>Test your understanding →</button>
              )}
            </div>
            <p className="content-note">PATH provides study prompts and summaries, not a replacement for Scripture. Open the referenced passage and make your own observations.</p>
          </>
        )}

        {quizStarted && !finished && (
          <>
            <div className="lesson-meta"><span>RECALL PRACTICE</span><span>Question {questionIndex + 1} of {questions.length}</span></div>
            <h2 className="quiz-heading">{question.question}</h2>
            <div className="answer-list">
              {question.options.map((option, index) => {
                const isChosen = selected === index;
                const isCorrect = index === question.answer;
                const resultClass = selected === null ? "" : isCorrect ? " correct" : isChosen ? " incorrect" : "";
                return <button key={option} className={"answer-option" + resultClass} onClick={() => chooseAnswer(index)} disabled={selected !== null}>
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
                  {selected !== null && isCorrect && <span className="answer-mark">✓</span>}
                </button>;
              })}
            </div>
            {selected !== null && <div className={"answer-feedback" + (selected === question.answer ? " feedback-correct" : "")}>
              <strong>{selected === question.answer ? "That’s right." : "Not quite — use this as a clue to revisit the passage."}</strong>
              <p>{question.explanation}</p>
            </div>}
            <div className="lesson-actions">
              <button className="secondary-button" onClick={() => { setQuizStarted(false); visitLesson(2); }}>Back to lessons</button>
              <button className="primary-button" onClick={nextQuestion} disabled={selected === null}>{questionIndex === questions.length - 1 ? "See my results →" : "Next question →"}</button>
            </div>
          </>
        )}

        {finished && (
          <div className="results-panel">
            <div className="results-icon">✓</div>
            <div className="eyebrow">PRACTICE COMPLETE</div>
            <h2>You showed up to learn.</h2>
            <p className="results-score">{latestScore ?? correctCount} <span>of {questions.length} correct</span></p>
            <p className="lesson-body">{(latestScore ?? correctCount) === questions.length ? "Excellent recall. Keep connecting the details to the passage itself." : "Good practice. Your missed answers are not a failure; they show what to revisit. Return to 1 Samuel 16 and try explaining the story in your own words."}</p>
            <div className="insight-card"><span className="insight-label">NEXT STEP</span><p>Read 1 Samuel 16 once more. Then explain why David's anointing matters in the wider story of Israel.</p></div>
            <div className="lesson-actions">
              <button className="secondary-button" onClick={() => { setFinished(false); setQuizStarted(false); visitLesson(0); }}>Review lessons</button>
              <button className="primary-button" onClick={restartQuiz}>Try the questions again ↻</button>
            </div>
            <p className="content-note">Your latest score is saved locally in this browser. It is not synced across devices, and no account is required.</p>
            <Link className="return-link" href="/">Return to PATH home ↗</Link>
          </div>
        )}
      </section>
    </div>
  );
}
