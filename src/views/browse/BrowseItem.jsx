import { DIFF, DISPUTED, LECTURE_BY_ID, POSITION, QUESTIONS } from "../../lib/bank.js";
import { isFlagged, keyOf, statusOf } from "../../lib/progress.js";
import AnswerList from "../../components/AnswerList.jsx";
import Explanation from "../../components/Explanation.jsx";
import RichText from "../../components/RichText.jsx";
import SetsLabel from "../../components/SetsLabel.jsx";
import StatusPill from "../../components/StatusPill.jsx";

export default function BrowseItem({ P, qi, setKey, term, showAnswers, onOpen }) {
  const q = QUESTIONS[qi];
  return (
    <article className="bitem">
      <div className="bhead">
        <span className="qnum">#{POSITION[setKey].get(qi)}</span>
        <StatusPill status={statusOf(P, qi)} />
        {DISPUTED[qi] && <span className="pill p-disp">Disputed key</span>}
        {isFlagged(P, qi) && <span className="pill p-disp">Flagged</span>}
        {q.l && <span className="pill p-lec" title={LECTURE_BY_ID[q.l].name}>{q.l}</span>}
        {q.isNew && <span className="pill p-new">New</span>}
        <SetsLabel question={q} />
        <span className="grow" />
        <button type="button" className="btn small" onClick={() => onOpen(qi)}>Practice</button>
      </div>
      <div className="bq">
        <RichText text={q.q} highlight={term || null} />
      </div>
      {showAnswers && (
        <AnswerList question={q} keyMask={keyOf(P, qi, setKey)} diff={DIFF[qi]} highlight={term || null} />
      )}
      {showAnswers && q.e && (
        <details className="bexplain">
          <summary>Vysvětlení a zdroj</summary>
          <Explanation qi={qi} setKey={setKey} gradedWith={keyOf(P, qi, setKey)} showOptions />
        </details>
      )}
    </article>
  );
}
