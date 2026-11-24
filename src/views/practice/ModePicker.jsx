import { MODES } from "../../lib/modes.js";
import { SET_LISTS, QUESTIONS } from "../../lib/bank.js";
import LecturePicker from "../../components/LecturePicker.jsx";

export default function ModePicker({ mode, counts, onMode, setKey, lec, onLecture }) {
  const perLecture = { all: SET_LISTS[setKey].length };
  for (const qi of SET_LISTS[setKey]) if (QUESTIONS[qi].l) perLecture[QUESTIONS[qi].l] = (perLecture[QUESTIONS[qi].l] || 0) + 1;
  const counted = {
    new: counts.new + counts.seen,
    mistakes: counts.wrong,
    flagged: counts.flagged,
    disputed: counts.disputed,
  };
  return (
    <section className="panel">
      <h3>Practice</h3>
      <div className="modes">
        {Object.entries(MODES).map(([key, m]) =>
          key === "disputed" && !counts.disputed ? null : (
            <button key={key} type="button" className="chipbtn" aria-pressed={mode === key} onClick={() => onMode(key)}>
              {m.label}
              {counted[key] != null && <span className="n">{counted[key]}</span>}
            </button>
          ),
        )}
      </div>
      <p className="modedesc">{MODES[mode].desc}</p>
      <LecturePicker id="practice-lec" value={lec} onChange={onLecture} counts={perLecture} />
    </section>
  );
}
