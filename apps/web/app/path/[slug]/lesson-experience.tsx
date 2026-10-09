"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

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

type CloudProgress = {
  active_step_id: string | null;
  completed_step_ids: string[];
  latest_score: number | null;
  quiz_total: number | null;
};

const STEP_IDS = ["read", "explore", "remember"] as const;

const STORAGE_KEY = "path:life-of-david:progress:v1";

export default function LessonExperience() {
  const session = authClient.useSession();
  const signedIn = Boolean(session.data?.user);
  const [activeLesson, setActiveLesson] = useState(0);
  const [visitedLessons, setVisitedLessons] = useState<number[]>([0]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cloudProgress, setCloudProgress] = useState<CloudProgress | null>(null);
  const [syncAvailable, setSyncAvailable] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

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

  useEffect(() => {
    if (!hydrated || !signedIn) {
      setSyncAvailable(false);
      setCloudProgress(null);
      setCloudEnabled(false);
      return;
    }
    let cancelled = false;
    fetch("/api/progress/life-of-david", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setSyncMessage(result.error || "Cloud progress is not available right now.");
          return;
        }
        setCloudProgress(result.progress ?? null);
        setSyncAvailable(true);
        setSyncMessage("");
      })
      .catch(() => {
        if (!cancelled) setSyncMessage("Could not reach cloud progress. Your device progress is safe.");
      });
    return () => { cancelled = true; };
  }, [hydrated, signedIn]);

  async function syncProgress() {
    setSyncPending(true);
    setSyncMessage("");
    const completedStepIds = Array.from(new Set([
      ...visitedLessons.map((index) => STEP_IDS[index]).filter((step): step is typeof STEP_IDS[number] => Boolean(step)),
      ...(cloudProgress?.completed_step_ids ?? [])
    ]));
    const shouldUseCloudActiveStep = visitedLessons.length === 1 && activeLesson === 0 && cloudProgress?.active_step_id;
    const activeStepId = shouldUseCloudActiveStep ? cloudProgress.active_step_id : STEP_IDS[activeLesson];
    const scoreToKeep = latestScore ?? cloudProgress?.latest_score ?? null;
    const totalToKeep = scoreToKeep === null ? null : (latestScore !== null ? questions.length : cloudProgress?.quiz_total ?? questions.length);

    try {
      const response = await fetch("/api/progress/life-of-david", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          activeStepId,
          completedStepIds,
          latestScore: scoreToKeep,
          quizTotal: totalToKeep
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setSyncMessage(result.error || "Could not sync progress. Your device progress is safe.");
        return;
      }
      setCloudProgress(result.progress ?? null);
      if (shouldUseCloudActiveStep) {
        const remoteIndex = STEP_IDS.indexOf(cloudProgress?.active_step_id as typeof STEP_IDS[number]);
        if (remoteIndex >= 0) {
          setActiveLesson(remoteIndex);
          setVisitedLessons((previous) => Array.from(new Set([...previous, remoteIndex])));
        }
      }
      if (latestScore === null && typeof cloudProgress?.latest_score === "number") {
        setLatestScore(cloudProgress.latest_score);
        setQuizCompleted(true);
      }
      setCloudEnabled(true);
      setSyncMessage("Progress is connected to your PATH account. This device remains available offline.");
    } catch {
      setSyncMessage("Could not sync progress. Your device progress is safe.");
    } finally {
      setSyncPending(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !signedIn || !cloudEnabled) return;
    const completedStepIds = visitedLessons.map((index) => STEP_IDS[index]).filter((step): step is typeof STEP_IDS[number] => Boolean(step));
    fetch("/api/progress/life-of-david", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        activeStepId: STEP_IDS[activeLesson],
        completedStepIds,
        latestScore,
        quizTotal: latestScore === null ? null : questions.length
      })
    }).then(async (response) => {
      if (response.ok) {
        const result = await response.json();
        setCloudProgress(result.progress ?? null);
      }
    }).catch(() => {
      setSyncMessage("Cloud sync is temporarily unavailable. Your device progress is still saved.");
    });
  }, [activeLesson, visitedLessons, latestScore, hydrated, signedIn, cloudEnabled]);

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
    const wasCorrect = index === question.answer;
    setSelected(index);
    setAnswers((previous) => [...previous, wasCorrect]);
    if (signedIn && cloudEnabled) {
      fetch("/api/progress/life-of-david/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemId: "david-quiz-" + (questionIndex + 1),
          responseMode: "recognize",
          wasCorrect
        })
      }).catch(() => {
        setSyncMessage("A recall attempt could not sync. Your local quiz still works.");
      });
    }
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
        <div className="sidebar-note">
          {hydrated ? "Progress is saved on this device." : "Restoring your learning progress…"}
          {latestScore !== null && <strong className="saved-score">Latest quiz: {latestScore} of {questions.length} correct</strong>}
          {signedIn ? (
            <div className="cloud-sync">
              <button className="sync-button" onClick={syncProgress} disabled={!syncAvailable || syncPending}>
                {syncPending ? "Syncing…" : cloudEnabled ? "Sync progress again" : cloudProgress ? "Merge device + account progress" : "Save progress to account"}
              </button>
              {syncMessage && <p role="status" className="sync-message">{syncMessage}</p>}
            </div>
          ) : (
            <p className="sync-message"><Link href="/auth/sign-in">Sign in</Link> to connect progress across devices.</p>
          )}
        </div>
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
            <p className="content-note">{cloudEnabled ? "Your progress is saved on this device and connected to your PATH account." : "Your latest score is saved locally in this browser. Connect your account from the journey sidebar to sync progress across devices."}</p>
            <Link className="return-link" href="/">Return to PATH home ↗</Link>
          </div>
        )}
      </section>
    </div>
  );
}
