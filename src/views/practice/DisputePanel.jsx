import { QUESTIONS, SET_BY_KEY, VARIANTS } from "../../lib/bank.js";
import { entryOf, keyOf } from "../../lib/progress.js";

const clip = (text) => (text.length > 90 ? text.slice(0, 88) + "…" : text);

// Shown after answering a question whose answer key differs between source sets.
export default function DisputePanel({ P, qi, setKey, onChoose }) {
  const q = QUESTIONS[qi];
  const inUse = keyOf(P, qi, setKey);
  const chosen = entryOf(P, qi).o != null;
  return (
    <div className="dispute">
      <p>
        <b>The source sets disagree on this key. </b>
        {chosen
          ? "You chose the key marked “In use”; it is used for grading from now on."
          : `Graded with the ${SET_BY_KEY[setKey].name} key. If your notes say otherwise, pick the version you trust.`}
      </p>
      {VARIANTS[qi].map((v) => (
        <div className="variant" key={v.mask}>
          <div className="vsets">{v.labels.join(", ")}</div>
          <ul>
            {q.a.map((text, j) => ((v.mask >> j) & 1 ? <li key={j}>{clip(text)}</li> : null))}
          </ul>
          {v.mask === inUse ? (
            <span className="using">In use</span>
          ) : (
            <button type="button" className="btn small" onClick={() => onChoose(v.mask)}>
              Use this key
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
