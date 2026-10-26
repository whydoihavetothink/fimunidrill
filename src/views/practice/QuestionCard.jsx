import { DIFF, DISPUTED, POSITION, QUESTIONS, SET_LISTS } from "../../lib/bank.js";
import { MASTER, entryOf, isFlagged, keyOf, statusOf } from "../../lib/progress.js";
import { bits, plural } from "../../lib/format.js";
import FlagButton from "../../components/FlagButton.jsx";
import OptionButton from "../../components/OptionButton.jsx";
import RichText from "../../components/RichText.jsx";
import SetsLabel from "../../components/SetsLabel.jsx";
import StatusPill from "../../components/StatusPill.jsx";
import DisputePanel from "./DisputePanel.jsx";

function optionResult({ key, sel }, j) {
  const right = (key >> j) & 1, picked = (sel >> j) & 1;
  if (right && picked) return "hit";
  if (right) return "miss";
  return picked ? "bad" : "idle";
}

function verdictText({ ok, key, sel }) {
  if (ok) return `All ${plural(bits(key), "correct option")} picked.`;
  if (!sel) return "You didn't pick anything. It counts as wrong.";
  const missed = bits(key & ~sel), wrongPicks = bits(sel & ~key);
  const parts = [];
  if (missed) parts.push(`missed ${plural(missed, "correct option")}`);
  if (wrongPicks) parts.push(`picked ${wrongPicks} wrong one${wrongPicks > 1 ? "s" : ""}`);
  return `You ${parts.join(" and ")}.`;
}

function AttemptHistory({ entry }) {
  const mastered = entry.b >= MASTER;
  return (
    <p className="history">
      Answered <span className="mono">{entry.n}×</span>, <span className="mono">{entry.c}</span> right,{" "}
      <span className="mono">{entry.w}</span> wrong. {mastered ? "Mastered." : "Toward mastered:"}
      {!mastered && (
        <span className="steps" aria-label={`${entry.b} of ${MASTER}`}>
          {Array.from({ length: MASTER }, (_, k) => <i key={k} className={k < entry.b ? "on" : undefined} />)}
        </span>
      )}
    </p>
  );
}

export default function QuestionCard({ P, practice, setKey, onFlag }) {
  const { cur: qi, order, sel, checked, result } = practice;
  const q = QUESTIONS[qi];
  const key = keyOf(P, qi, setKey);

  return (
    <section className="card">
      <div className="qmeta">
        <span className="qnum">
          #{POSITION[setKey].get(qi) ?? "?"}
          <span className="of"> / {SET_LISTS[setKey].length}</span>
        </span>
        <StatusPill status={statusOf(P, qi)} />
        {checked && DISPUTED[qi] && <span className="pill p-disp">Disputed key</span>}
        <SetsLabel question={q} />
        <span className="grow" />
        <FlagButton flagged={isFlagged(P, qi)} onToggle={() => onFlag(qi)} />
      </div>

      <div className="qtext" role="heading" aria-level={2}>
        <RichText text={q.q} />
      </div>
      <p className="hint">Select all that apply{P.prefs.count ? ` · ${bits(key)} correct` : ""}</p>

      <div className="opts" role="group" aria-label="Answers">
        {order.map((j, d) => (
          <OptionButton
            key={`${qi}-${j}`}
            number={d + 1}
            text={q.a[j]}
            pressed={sel.includes(j)}
            result={checked ? optionResult(result, j) : null}
            disputed={!!((DIFF[qi] >> j) & 1)}
            onToggle={() => practice.toggle(d)}
          />
        ))}
      </div>

      {checked ? (
        <>
          <div className="actions" aria-live="polite">
            <div className={`verdict ${result.ok ? "ok" : "no"}`}>
              <b>{result.ok ? "Correct" : "Not quite"}</b>
              <span>{verdictText(result)}</span>
            </div>
            <button type="button" id="act-main" className="btn primary" onClick={() => practice.next()}>
              Next question <kbd>Enter</kbd>
            </button>
          </div>
          <AttemptHistory entry={entryOf(P, qi)} />
          {DISPUTED[qi] && <DisputePanel P={P} qi={qi} setKey={setKey} onChoose={practice.regrade} />}
        </>
      ) : (
        <div className="actions">
          <button type="button" id="act-main" className="btn primary" onClick={practice.check}>
            {sel.length ? "Check answer" : "Show answer"} <kbd>Enter</kbd>
          </button>
          <button type="button" className="btn ghost" onClick={() => practice.next()}>
            Skip <kbd>S</kbd>
          </button>
        </div>
      )}
    </section>
  );
}
