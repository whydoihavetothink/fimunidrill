import { MODES } from "../../lib/modes.js";

export default function ModePicker({ mode, counts, onMode }) {
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
    </section>
  );
}
