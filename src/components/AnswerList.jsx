import RichText from "./RichText.jsx";

// Read-only answers with the correct ones ticked; optionally the user's picks.
export default function AnswerList({ question, keyMask, picked = null, diff = 0, highlight = null }) {
  return (
    <ul className="ans">
      {question.a.map((text, j) => {
        const right = (keyMask >> j) & 1;
        const mine = picked != null && (picked >> j) & 1;
        return (
          <li key={j} className={(right ? "r" : "") + (mine ? " pick" : "")}>
            <span className="ic" aria-hidden="true">{right ? "✓" : mine ? "✗" : "–"}</span>
            <span>
              <RichText text={text} highlight={highlight} />
              {mine ? <span className="you">your pick</span> : null}
              {(diff >> j) & 1 ? <span className="dnote">sets disagree</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
