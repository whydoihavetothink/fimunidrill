import { useEffect, useState } from "react";
import { POSITION, QUESTIONS, SET_BY_KEY } from "../../lib/bank.js";
import { timeLeft } from "../../lib/exam.js";
import { bits, mmss } from "../../lib/format.js";
import { isFlagged, keyOf } from "../../lib/progress.js";
import FlagButton from "../../components/FlagButton.jsx";
import KeyHints from "../../components/KeyHints.jsx";
import OptionButton from "../../components/OptionButton.jsx";
import RichText from "../../components/RichText.jsx";

export default function ExamRunner({ P, exam, now, onToggle, onGo, onSubmit, onFlag, onQuit }) {
  const [confirm, setConfirm] = useState(null); // null | "submit" | "quit"
  const { idx, ids, sel, orders } = exam;
  const qi = ids[idx];
  const q = QUESTIONS[qi];
  const answered = sel.filter((s) => s.length).length;
  const open = ids.length - answered;
  const left = exam.limit ? timeLeft(exam, now) : null;
  const last = idx === ids.length - 1;

  // Moving to another question (buttons or arrow keys) dismisses a pending confirmation.
  useEffect(() => setConfirm(null), [idx]);

  const go = (k) => onGo(k);
  const submit = () => (open ? setConfirm("submit") : onSubmit());

  return (
    <>
      <section className="panel">
        <div className="exambar">
          <span className="qnum">Question {idx + 1}<span className="of"> of {ids.length}</span></span>
          <span className="muted">{answered} answered</span>
          <span className="grow" />
          <span className="muted">{exam.limit ? "Time left" : "Time"}</span>
          <span className={`timer${left != null && left <= 60 ? " low" : ""}`}>
            {mmss(left != null ? left : (now - exam.start) / 1000)}
          </span>
          <button type="button" className="btn small primary" onClick={submit}>Submit exam</button>
        </div>
        <div className="palette">
          {ids.map((qi2, k) => (
            <button
              key={k}
              type="button"
              className={`pcell${sel[k].length ? " done" : ""}${k === idx ? " cur" : ""}${isFlagged(P, qi2) ? " flag" : ""}`}
              aria-label={`Question ${k + 1}${sel[k].length ? ", answered" : ""}`}
              onClick={() => go(k)}
            >
              {k + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="qmeta">
          <span className="insets">{SET_BY_KEY[exam.set].name} #{POSITION[exam.set].get(qi)}</span>
          <span className="grow" />
          <FlagButton flagged={isFlagged(P, qi)} onToggle={() => onFlag(qi)} />
        </div>
        <div className="qtext" role="heading" aria-level={2}>
          <RichText text={q.q} />
        </div>
        <p className="hint">Select all that apply{P.prefs.count ? ` · ${bits(keyOf(P, qi, exam.set))} correct` : ""}</p>
        <div className="opts" role="group" aria-label="Answers">
          {orders[idx].map((j, d) => (
            <OptionButton key={`${idx}-${j}`} number={d + 1} text={q.a[j]} pressed={sel[idx].includes(j)} onToggle={() => onToggle(d)} />
          ))}
        </div>
        <div className="actions">
          <button type="button" className="btn" disabled={idx === 0} onClick={() => go(idx - 1)}>← Previous</button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={() => setConfirm("quit")}>Quit</button>
          {last ? (
            <button type="button" id="act-main" className="btn primary" onClick={submit}>Submit exam</button>
          ) : (
            <button type="button" id="act-main" className="btn primary" onClick={() => go(idx + 1)}>Next →</button>
          )}
        </div>
      </section>

      {confirm === "submit" && (
        <div className="confirm">
          <span>{open === 1 ? "1 question has" : `${open} questions have`} no answer and will count as wrong.</span>
          <div className="row">
            <button type="button" className="btn small danger" onClick={() => { setConfirm(null); onSubmit(); }}>Submit anyway</button>
            <button type="button" className="btn small" onClick={() => setConfirm(null)}>Keep answering</button>
          </div>
        </div>
      )}
      {confirm === "quit" && (
        <div className="confirm">
          <span>Quit without grading? Your answers in this exam are discarded and nothing is recorded.</span>
          <div className="row">
            <button type="button" className="btn small danger" onClick={onQuit}>Quit exam</button>
            <button type="button" className="btn small" onClick={() => setConfirm(null)}>Keep answering</button>
          </div>
        </div>
      )}

      <KeyHints options={q.a.length}>
        <kbd>←</kbd> <kbd>→</kbd> move · <kbd>Enter</kbd> next · <kbd>F</kbd> flag
      </KeyHints>
    </>
  );
}
