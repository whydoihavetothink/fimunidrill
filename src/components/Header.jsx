import { SETS, SET_LISTS } from "../lib/bank.js";
import { countStatuses } from "../lib/progress.js";
import SegmentBar from "./SegmentBar.jsx";

const VIEWS = [
  ["practice", "Practice"],
  ["exam", "Exam"],
  ["browse", "Browse"],
];

// Smart-card contact pad, the course's recurring subject.
function ChipMark() {
  return (
    <svg viewBox="0 0 34 26" width="38" height="29" aria-hidden="true">
      <rect className="pad" x="0.5" y="0.5" width="33" height="25" rx="5" />
      <g className="lines">
        <path d="M12 0.5V9M22 0.5V9M12 17V25.5M22 17V25.5M0.5 9H12M22 9H33.5M0.5 17H12M22 17H33.5" />
        <rect x="12" y="9" width="10" height="8" rx="1.5" />
      </g>
    </svg>
  );
}

function SetSwitcher({ P, active, locked, onChoose }) {
  return (
    <nav className="sets" aria-label="Question set">
      {SETS.map((s) => {
        const list = SET_LISTS[s.key];
        const c = countStatuses(P, list);
        return (
          <button
            key={s.key}
            type="button"
            className="setbtn"
            aria-pressed={active === s.key}
            disabled={locked && active !== s.key}
            title={locked && active !== s.key ? "Finish the exam or go to Practice to switch sets" : undefined}
            onClick={() => onChoose(s.key)}
          >
            <span className="nm">{s.name}</span>
            <span className="sub">{c.ok + c.mastered}/{list.length} right</span>
            <SegmentBar counts={c} total={list.length} className="meter" />
          </button>
        );
      })}
    </nav>
  );
}

export default function Header({ P, activeSet, setsLocked, view, onSet, onView }) {
  return (
    <header className="top">
      <div className="brand">
        <ChipMark />
        <div>
          <h1>PV157 Drill</h1>
          <p>Autentizace a řízení přístupu · FI MUNI</p>
        </div>
      </div>
      <SetSwitcher P={P} active={activeSet} locked={setsLocked} onChoose={onSet} />
      <nav className="views" aria-label="View">
        {VIEWS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={view === key} onClick={() => onView(key)}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
