import { SET_BY_KEY, SET_LISTS } from "../../lib/bank.js";
import { STATUS_LABEL } from "../../lib/progress.js";
import { pct } from "../../lib/format.js";
import SegmentBar from "../../components/SegmentBar.jsx";

const ROWS = [
  ["mastered", "Mastered (3 in a row)"],
  ["ok", "Right, still learning"],
  ["wrong", STATUS_LABEL.wrong],
  ["seen", STATUS_LABEL.seen],
  ["new", STATUS_LABEL.new],
];

export default function ProgressSummary({ setKey, counts }) {
  const total = SET_LISTS[setKey].length;
  return (
    <section className="panel">
      <h3>{SET_BY_KEY[setKey].name}</h3>
      <div className="score">
        <b>{pct((counts.ok + counts.mastered) / total)}</b>
        <span>last answer right</span>
      </div>
      <SegmentBar counts={counts} total={total} />
      <dl className="legend">
        {ROWS.map(([key, label]) => (
          <div key={key} className="lrow">
            <dt>
              <span className={`sw c-${key}`} />
              {label}
            </dt>
            <dd>{counts[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
