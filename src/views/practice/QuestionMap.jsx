import { SET_LISTS } from "../../lib/bank.js";
import { STATUS_LABEL, isFlagged, statusOf } from "../../lib/progress.js";

const LEGEND = [
  ["c-new", "Not visited"],
  ["c-seen", "Visited"],
  ["c-wrong", "Wrong"],
  ["c-ok", "Right"],
  ["c-mastered", "Mastered"],
  ["fl", "Flagged"],
];

// One square per question in set order, coloured by status; click to open it.
export default function QuestionMap({ P, setKey, current, onOpen }) {
  return (
    <section className="panel">
      <h3>Question map</h3>
      <div className="map">
        {SET_LISTS[setKey].map((qi, n) => {
          const status = statusOf(P, qi);
          const flagged = isFlagged(P, qi);
          const cls = `cell s-${status}${flagged ? " flag" : ""}${qi === current ? " cur" : ""}`;
          return (
            <button
              key={qi}
              type="button"
              className={cls}
              title={`#${n + 1} · ${STATUS_LABEL[status]}${flagged ? " · flagged" : ""}`}
              aria-label={`Question ${n + 1}, ${STATUS_LABEL[status]}`}
              onClick={() => onOpen(qi)}
            >
              {n + 1}
            </button>
          );
        })}
      </div>
      <div className="maplegend">
        {LEGEND.map(([cls, label]) => (
          <span key={cls}>
            <i className={cls} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
