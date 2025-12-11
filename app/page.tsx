"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/* ----------------- Data ----------------- */

const STATES_CAPITALS: Record<string, string> = {
  Alabama: "Montgomery",
  Alaska: "Juneau",
  Arizona: "Phoenix",
  Arkansas: "Little Rock",
  California: "Sacramento",
  Colorado: "Denver",
  Connecticut: "Hartford",
  Delaware: "Dover",
  Florida: "Tallahassee",
  Georgia: "Atlanta",
  Hawaii: "Honolulu",
  Idaho: "Boise",
  Illinois: "Springfield",
  Indiana: "Indianapolis",
  Iowa: "Des Moines",
  Kansas: "Topeka",
  Kentucky: "Frankfort",
  Louisiana: "Baton Rouge",
  Maine: "Augusta",
  Maryland: "Annapolis",
  Massachusetts: "Boston",
  Michigan: "Lansing",
  Minnesota: "Saint Paul",
  Mississippi: "Jackson",
  Missouri: "Jefferson City",
  Montana: "Helena",
  Nebraska: "Lincoln",
  Nevada: "Carson City",
  "New Hampshire": "Concord",
  "New Jersey": "Trenton",
  "New Mexico": "Santa Fe",
  "New York": "Albany",
  "North Carolina": "Raleigh",
  "North Dakota": "Bismarck",
  Ohio: "Columbus",
  Oklahoma: "Oklahoma City",
  Oregon: "Salem",
  Pennsylvania: "Harrisburg",
  "Rhode Island": "Providence",
  "South Carolina": "Columbia",
  "South Dakota": "Pierre",
  Tennessee: "Nashville",
  Texas: "Austin",
  Utah: "Salt Lake City",
  Vermont: "Montpelier",
  Virginia: "Richmond",
  Washington: "Olympia",
  "West Virginia": "Charleston",
  Wisconsin: "Madison",
  Wyoming: "Cheyenne"
};

type Coords = [number, number];

const STATE_COORDS: Record<string, Coords> = {
  Alabama: [696, 432],
  Alaska: [126, 531],
  Arizona: [203, 389],
  Arkansas: [582, 396],
  California: [75, 297],
  Colorado: [339, 288],
  Connecticut: [918, 191],
  Delaware: [885, 264],
  Florida: [813, 530],
  Georgia: [748, 429],
  Hawaii: [347, 606],
  Idaho: [199, 150],
  Illinois: [631, 266],
  Indiana: [688, 266],
  Iowa: [553, 226],
  Kansas: [470, 307],
  Kentucky: [715, 323],
  Louisiana: [584, 484],
  Maine: [950, 84],
  Maryland: [857, 256],
  Massachusetts: [927, 165],
  Michigan: [703, 177],
  Minnesota: [539, 139],
  Mississippi: [635, 445],
  Missouri: [581, 311],
  Montana: [306, 92],
  Nebraska: [451, 233],
  Nevada: [139, 250],
  "New Hampshire": [926, 145],
  "New Jersey": [895, 225],
  "New Mexico": [320, 398],
  "New York": [866, 156],
  "North Carolina": [830, 352],
  "North Dakota": [441, 96],
  Ohio: [747, 251],
  Oklahoma: [510, 385],
  Oregon: [108, 128],
  Pennsylvania: [830, 223],
  "Rhode Island": [936, 186],
  "South Carolina": [804, 404],
  "South Dakota": [436, 170],
  Tennessee: [693, 364],
  Texas: [453, 483],
  Utah: [230, 278],
  Vermont: [906, 120],
  Virginia: [836, 296],
  Washington: [129, 56],
  "West Virginia": [787, 286],
  Wisconsin: [616, 158],
  Wyoming: [309, 185]
};

const REF_WIDTH = 1024;
const REF_HEIGHT = 632;

/* ----------------- Types ----------------- */

interface QuestionRecord {
  correct_state: string;
  correct_capital: string;
  user_state: string;
  user_capital: string;
  skipped_state: boolean;
  skipped_capital: boolean;
}

interface ResultsLine {
  text: string;
  color: "default" | "green" | "red" | "blue" | "orange";
}

/* ----------------- Components ----------------- */

export default function Page() {
  const [phase, setPhase] = useState<"setup" | "quiz" | "results">("setup");

  const [statesInput, setStatesInput] = useState("");
  const [quizCapitals, setQuizCapitals] = useState(false);
  const [showWordBox, setShowWordBox] = useState(false);

  const [quizStates, setQuizStates] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [stateAnswer, setStateAnswer] = useState("");
  const [capitalAnswer, setCapitalAnswer] = useState("");

  const [showTimers, setShowTimers] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const [resultsLines, setResultsLines] = useState<ResultsLine[]>([]);
  const [missedStates, setMissedStates] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    if (phase !== "quiz") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  const totalElapsed = useMemo(() => {
    if (!quizStartTime) return 0;
    return (now - quizStartTime) / 1000;
  }, [quizStartTime, now]);

  const questionElapsed = useMemo(() => {
    if (!questionStartTime) return 0;
    return (now - questionStartTime) / 1000;
  }, [questionStartTime, now]);

  const currentStateName = quizStates[currentIndex] ?? "";

  // Start quiz from setup
  function handleStartQuiz() {
    let states: string[];
    if (!statesInput.trim()) {
      states = Object.keys(STATES_CAPITALS);
    } else {
      states = statesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase())
        .map((s) => s.replace(/\b\w/g, (m) => m.toUpperCase())); // title case-ish
    }

    const invalid = states.filter((s) => !STATES_CAPITALS[s]);
    if (invalid.length > 0) {
      alert("Invalid states: " + invalid.join(", "));
      return;
    }

    // unique & shuffle
    const uniqueStates = Array.from(new Set(states));
    const shuffled = [...uniqueStates].sort(() => Math.random() - 0.5);

    const newQuestions: QuestionRecord[] = shuffled.map((state) => ({
      correct_state: state,
      correct_capital: STATES_CAPITALS[state],
      user_state: "",
      user_capital: "",
      skipped_state: false,
      skipped_capital: false
    }));

    setQuizStates(shuffled);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setStateAnswer("");
    setCapitalAnswer("");
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setPhase("quiz");
  }

  function loadQuestionAt(index: number, qList = questions) {
    const rec = qList[index];
    if (!rec) return;
    setCurrentIndex(index);
    setStateAnswer(rec.user_state);
    setCapitalAnswer(rec.user_capital);
    setQuestionStartTime(Date.now());
  }

  function saveCurrentIntoQuestions(opts: { skipState: boolean; skipCapital: boolean }) {
    setQuestions((prev) => {
      const next = [...prev];
      const rec = { ...next[currentIndex] };

      if (opts.skipState) {
        rec.user_state = "";
        rec.skipped_state = true;
      } else {
        rec.user_state = stateAnswer.trim();
        rec.skipped_state = false;
      }

      if (quizCapitals) {
        if (opts.skipCapital) {
          rec.user_capital = "";
          rec.skipped_capital = true;
        } else {
          rec.user_capital = capitalAnswer.trim();
          rec.skipped_capital = false;
        }
      } else {
        rec.user_capital = "";
        rec.skipped_capital = false;
      }

      next[currentIndex] = rec;
      return next;
    });
  }

  function handleNext(opts: { skipState: boolean; skipCapital: boolean }) {
    saveCurrentIntoQuestions(opts);

    setTimeout(() => {
      setQuestions((qList) => {
        // after save, either go to next or results
        const atLast = currentIndex >= qList.length - 1;
        if (atLast) {
          computeResults(qList);
          setPhase("results");
          return qList;
        } else {
          loadQuestionAt(currentIndex + 1, qList);
          return qList;
        }
      });
    }, 0);
  }

  function handleBack() {
    if (currentIndex === 0) return;
    // auto-save but treat as non-skip
    saveCurrentIntoQuestions({ skipState: false, skipCapital: false });

    setTimeout(() => {
      setQuestions((qList) => {
        loadQuestionAt(currentIndex - 1, qList);
        return qList;
      });
    }, 0);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds * 10) % 10);
    return {
      mmss: `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      detail: `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(
        2,
        "0"
      )}.${tenths}`
    };
  }

  function scoreItem(user: string, correct: string) {
    if (!user) {
      return {
        score: 0,
        text: `NO ANSWER (Correct: ${correct}) (+0)`,
        color: "blue" as const
      };
    }
    if (user.toLowerCase() === correct.toLowerCase()) {
      return {
        score: 1,
        text: `CORRECT (+1) (Correct: ${correct})`,
        color: "green" as const
      };
    }
    return {
      score: 0,
      text: `WRONG (Your answer: ${user}) (Correct: ${correct}) (+0)`,
      color: "red" as const
    };
  }

  function computeResults(qList: QuestionRecord[]) {
    const lines: ResultsLine[] = [];
    const missed = new Set<string>();
    let totalScore = 0;

    qList.forEach((rec, i) => {
      lines.push({ text: `Question ${i + 1}: ${rec.correct_state}`, color: "default" });

      // state
      if (rec.skipped_state) {
        lines.push({
          text: `  State: SKIPPED / I don't know (+0) (Correct: ${rec.correct_state})`,
          color: "orange"
        });
        missed.add(rec.correct_state);
      } else {
        const s = scoreItem(rec.user_state, rec.correct_state);
        lines.push({ text: `  State: ${s.text}`, color: s.color });
        totalScore += s.score;
        if (s.score < 1) missed.add(rec.correct_state);
      }

      // capital
      if (quizCapitals) {
        if (rec.skipped_capital) {
          lines.push({
            text: `  Capital: SKIPPED / I don't know (+0) (Correct: ${rec.correct_capital})`,
            color: "orange"
          });
          missed.add(rec.correct_state);
        } else {
          const c = scoreItem(rec.user_capital, rec.correct_capital);
          lines.push({ text: `  Capital: ${c.text}`, color: c.color });
          totalScore += c.score;
          if (c.score < 1) missed.add(rec.correct_state);
        }
      }

      lines.push({ text: "", color: "default" });
    });

    const maxScore = qList.length * (quizCapitals ? 2 : 1);
    lines.unshift({
      text: `You scored ${totalScore} out of ${maxScore}.`,
      color: "default"
    });
    lines.unshift({ text: "=== Results ===", color: "default" });

    setResultsLines(lines);
    setMissedStates(Array.from(missed));
  }

  function restartWith(states: string[]) {
    const unique = Array.from(new Set(states));
    const shuffled = [...unique].sort(() => Math.random() - 0.5);
    const newQuestions: QuestionRecord[] = shuffled.map((state) => ({
      correct_state: state,
      correct_capital: STATES_CAPITALS[state],
      user_state: "",
      user_capital: "",
      skipped_state: false,
      skipped_capital: false
    }));

    setQuizStates(shuffled);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setStateAnswer("");
    setCapitalAnswer("");
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setPhase("quiz");
  }

  const { mmss: quizMmss } = formatTime(totalElapsed);
  const { detail: questionDetail } = formatTime(questionElapsed);

  // Map pin position as % of container based on reference coords
  const pinStyle = useMemo(() => {
    if (!currentStateName || !STATE_COORDS[currentStateName]) return undefined;
    const [x, y] = STATE_COORDS[currentStateName];
    return {
      left: `${(x / REF_WIDTH) * 100}%`,
      top: `${(y / REF_HEIGHT) * 100}%`
    };
  }, [currentStateName]);

  const allStatesInQuiz = quizStates;
  const capitalsInQuiz = useMemo(
    () => allStatesInQuiz.map((s) => STATES_CAPITALS[s]).sort(),
    [allStatesInQuiz]
  );

  /* ----------------- Render ----------------- */

  return (
    <div className="app-root">
      <main className="app-main">
        <div className="card" style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>US States &amp; Capitals Map Quiz</h1>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)" }}>
            Type a list of states (comma-separated), or leave blank to quiz on all 50.
          </p>

          {phase === "setup" && (
            <section style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ fontSize: "0.9rem" }}>
                States to quiz on:
                <input
                  type="text"
                  value={statesInput}
                  onChange={(e) => setStatesInput(e.target.value)}
                  placeholder="e.g. California, Texas, New York (or leave empty for ALL)"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={quizCapitals}
                  onChange={(e) => setQuizCapitals(e.target.checked)}
                />
                <span>Also quiz on capitals?</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={showWordBox}
                  onChange={(e) => setShowWordBox(e.target.checked)}
                />
                <span>Show word box (states &amp; capitals list)?</span>
              </label>

              <div style={{ marginTop: 8 }}>
                <button className="button button-primary" onClick={handleStartQuiz}>
                  Start Quiz
                </button>
              </div>
            </section>
          )}

          {phase === "quiz" && (
            <section style={{ marginTop: 12 }}>
              <div className="quiz-layout">
                <div className="quiz-map-card">
                  <div className="quiz-map-wrapper">
                    <div className="quiz-map-inner">
                      {/* We can embed an optimized static map image in public/ */}
                      <Image
                        src="/blank_us_map.png"
                        alt="Blank US map"
                        fill
                        style={{ objectFit: "contain" }}
                        priority
                      />
                      {pinStyle && <div className="map-pin" style={pinStyle} />}
                    </div>
                  </div>
                </div>

                <div className="quiz-answer-card">
                  <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Question</h2>
                  <div className="quiz-answer-inputs">
                    <div className="quiz-answer-field">
                      <label>What state is this?</label>
                      <input
                        type="text"
                        value={stateAnswer}
                        onChange={(e) => setStateAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleNext({ skipState: false, skipCapital: false });
                          }
                        }}
                      />
                    </div>

                    {quizCapitals && (
                      <div className="quiz-answer-field">
                        <label>What is its capital?</label>
                        <input
                          type="text"
                          value={capitalAnswer}
                          onChange={(e) => setCapitalAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleNext({ skipState: false, skipCapital: false });
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="quiz-buttons-row">
                    <button className="button" onClick={handleBack}>
                      ← Back
                    </button>
                    <button
                      className="button button-primary"
                      onClick={() => handleNext({ skipState: false, skipCapital: false })}
                    >
                      Next (Submit)
                    </button>
                    <button
                      className="button button-ghost"
                      onClick={() => handleNext({ skipState: true, skipCapital: false })}
                    >
                      Skip State
                    </button>
                    {quizCapitals && (
                      <button
                        className="button button-ghost"
                        onClick={() => handleNext({ skipState: false, skipCapital: true })}
                      >
                        Skip Capital
                      </button>
                    )}

                    <span className="quiz-questions-counter">
                      Question {currentIndex + 1}/{quizStates.length}
                    </span>
                  </div>

                  <div className="quiz-timers">
                    <label className="checkbox-row" style={{ marginTop: 0 }}>
                      <input
                        type="checkbox"
                        checked={showTimers}
                        onChange={(e) => setShowTimers(e.target.checked)}
                      />
                      <span>Show timers</span>
                    </label>
                    {showTimers && (
                      <>
                        <div className="quiz-timers-row">
                          <span>Question timer:</span>
                          <span>{questionDetail}</span>
                        </div>
                        <div className="quiz-timers-row">
                          <span>Quiz timer:</span>
                          <span>{quizMmss}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {showWordBox && (
                <WordBox
                  states={allStatesInQuiz}
                  capitals={capitalsInQuiz}
                />
              )}
            </section>
          )}

          {phase === "results" && (
            <>
              <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "0.95rem" }}>
                Review your answers, then choose to practice missed states or play again.
              </p>
            </>
          )}
        </div>

        {phase === "results" && (
          <ResultsOverlay
            lines={resultsLines}
            missedStates={missedStates}
            originalStates={Array.from(new Set(quizStates))}
            onPracticeMissed={() => {
              if (missedStates.length === 0) {
                alert("You did not miss any states.");
                return;
              }
              restartWith(missedStates);
            }}
            onPlayAgain={() => restartWith(Array.from(new Set(quizStates)))}
            onClose={() => {
              setPhase("setup");
              setStatesInput("");
            }}
          />
        )}
      </main>
    </div>
  );
}

/* ----------------- Word Box ----------------- */

function WordBox(props: { states: string[]; capitals: string[] }) {
  const { states, capitals } = props;
  const [struck, setStruck] = useState<Record<string, boolean>>({});

  function toggleText(text: string) {
    setStruck((prev) => ({ ...prev, [text]: !prev[text] }));
  }

  return (
    <div className="wordbox-window">
      <div className="wordbox-inner">
        <div className="wordbox-header">
          <span>Word Box</span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Tap entries to strike out
          </span>
        </div>
        <div className="wordbox-scroll">
          <div>
            <div className="wordbox-section-title">States</div>
            {states
              .slice()
              .sort()
              .map((s) => (
                <div
                  key={s}
                  className={`wordbox-item ${struck[s] ? "struck" : ""}`}
                  onClick={() => toggleText(s)}
                >
                  {s}
                </div>
              ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="wordbox-section-title">Capitals</div>
            {capitals.map((c) => (
              <div
                key={c}
                className={`wordbox-item ${struck[c] ? "struck" : ""}`}
                onClick={() => toggleText(c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Results Overlay ----------------- */

function ResultsOverlay(props: {
  lines: ResultsLine[];
  missedStates: string[];
  originalStates: string[];
  onPracticeMissed: () => void;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  const { lines, missedStates, onPracticeMissed, onPlayAgain, onClose } = props;

  function colorToCss(color: ResultsLine["color"]) {
    switch (color) {
      case "green":
        return "#4ade80";
      case "red":
        return "#f97373";
      case "blue":
        return "#60a5fa";
      case "orange":
        return "#f97316";
      default:
        return "#e5e7eb";
    }
  }

  return (
    <div className="results-overlay">
      <div className="card results-card">
        <h2 style={{ marginBottom: 4, fontSize: "1.1rem" }}>Quiz Results</h2>
        {missedStates.length > 0 ? (
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            You missed {missedStates.length} state(s). You can practice only those or replay the
            entire quiz.
          </p>
        ) : (
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            You answered all states correctly!
          </p>
        )}

        <div className="results-list">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="results-line"
              style={{ color: colorToCss(line.color) }}
            >
              {line.text}
            </div>
          ))}
        </div>

        <div className="results-buttons">
          {missedStates.length > 0 && (
            <button className="button" onClick={onPracticeMissed}>
              Practice Missed
            </button>
          )}
          <button className="button" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="button button-danger" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}