import { SET_BY_KEY, SET_LISTS } from "../../lib/bank.js";
import { SECONDS_PER_QUESTION, examSize } from "../../lib/exam.js";
import { countStatuses } from "../../lib/progress.js";
import { mmss } from "../../lib/format.js";
import ExamHistory from "./ExamHistory.jsx";

function Choice({ label, field, value, options, onConfig }) {
  return (
    <div className="field">
      <span className="lbl">{label}</span>
      <div className="seg">
        {options.map(([val, text]) => (
          <button key={String(val)} type="button" className="chipbtn" aria-pressed={value === val} onClick={() => onConfig({ [field]: val })}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExamSetup({ P, setKey, onConfig, onStart }) {
  const cfg = P.prefs.exam;
  const total = SET_LISTS[setKey].length;
  const notMastered = total - countStatuses(P, SET_LISTS[setKey]).mastered;
  const n = examSize(cfg, setKey);
  return (
    <>
      <section className="card">
        <h2 className="title">Exam simulation</h2>
        <p className="lead">
          Random questions from {SET_BY_KEY[setKey].name}, with answers hidden until you submit. A question counts only if
          your selection matches the key exactly. Results also update your practice progress.
        </p>
        <Choice label="Questions" field="n" value={cfg.n} onConfig={onConfig}
          options={[[10, "10"], [20, "20"], [30, "30"], ["all", `All ${total}`]]} />
        <Choice label="Pick from" field="from" value={cfg.from} onConfig={onConfig}
          options={[["all", "Whole set"], ["weak", `Not yet mastered · ${notMastered}`]]} />
        <Choice label="Time limit" field="timed" value={cfg.timed} onConfig={onConfig}
          options={[[false, "None"], [true, `1 min per question · ${mmss(n * SECONDS_PER_QUESTION)}`]]} />
        <div className="actions">
          <button type="button" className="btn primary" onClick={onStart}>Start {n}-question exam</button>
        </div>
      </section>
      <ExamHistory exams={P.exams} />
    </>
  );
}
