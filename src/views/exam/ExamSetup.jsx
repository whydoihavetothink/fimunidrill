import { QUESTIONS, SET_BY_KEY } from "../../lib/bank.js";
import { IS_MINUTES, IS_QUESTIONS, SECONDS_PER_QUESTION, examSize, poolOf } from "../../lib/exam.js";
import { countStatuses } from "../../lib/progress.js";
import { mmss } from "../../lib/format.js";
import LecturePicker from "../../components/LecturePicker.jsx";
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
  const cfg = { lec: "all", ...P.prefs.exam };
  const all = { ...cfg, lec: "all" };
  const pool = poolOf(setKey, cfg);
  const notMastered = pool.length - countStatuses(P, pool).mastered;
  const n = examSize(cfg, setKey);
  const perLecture = { all: poolOf(setKey, all).length };
  for (const qi of poolOf(setKey, all)) if (QUESTIONS[qi].l) perLecture[QUESTIONS[qi].l] = (perLecture[QUESTIONS[qi].l] || 0) + 1;
  const isPreset = cfg.n === IS_QUESTIONS && cfg.timed && cfg.from === "all";
  return (
    <>
      <section className="card">
        <h2 className="title">Exam · cvičný odpovědník</h2>
        <p className="lead">
          Random questions from {SET_BY_KEY[setKey].name} on one page, like the IS MUNI odpovědník: {IS_QUESTIONS} questions
          in {IS_MINUTES} minutes by default. Answers stay hidden until you hand in; the review then marks every option
          and explains each question you didn't get fully right, with the lecture slide it comes from. A question counts
          only if your selection matches the key exactly. Results also update your practice progress.
        </p>
        <div className="actions">
          <button
            type="button"
            className={isPreset ? "btn primary" : "btn"}
            onClick={() => onConfig({ n: IS_QUESTIONS, timed: true, from: "all" })}
          >
            IS preset · {IS_QUESTIONS} questions / {IS_MINUTES} min
          </button>
        </div>
        <div className="field">
          <span className="lbl">Lecture</span>
          <LecturePicker id="exam-lec" value={cfg.lec} onChange={(lec) => onConfig({ lec })} counts={perLecture} />
        </div>
        <Choice label="Questions" field="n" value={cfg.n} onConfig={onConfig}
          options={[[IS_QUESTIONS, String(IS_QUESTIONS)], [15, "15"], [20, "20"], [30, "30"], ["all", `All ${pool.length}`]]} />
        <Choice label="Pick from" field="from" value={cfg.from} onConfig={onConfig}
          options={[["all", "Whole set"], ["weak", `Not yet mastered · ${notMastered}`]]} />
        <Choice label="Time limit" field="timed" value={cfg.timed} onConfig={onConfig}
          options={[[false, "None"], [true, `IS pace, ${mmss(SECONDS_PER_QUESTION)} per question · ${mmss(n * SECONDS_PER_QUESTION)}`]]} />
        <div className="actions">
          <button type="button" className="btn primary" disabled={!n} onClick={onStart}>Start {n}-question test</button>
        </div>
      </section>
      <ExamHistory exams={P.exams} />
    </>
  );
}
