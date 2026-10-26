import { DIFF, QUESTIONS, SET_BY_KEY } from "../../lib/bank.js";
import { mmss, pct } from "../../lib/format.js";
import AnswerList from "../../components/AnswerList.jsx";
import RichText from "../../components/RichText.jsx";

export default function ExamResults({ exam, onPracticeMistakes, onNew }) {
  const { score, res, ids } = exam;
  const misses = res.filter((r) => !r.ok).length;
  return (
    <>
      <section className="card">
        <h2 className="title">Exam result</h2>
        <div className="bigscore">
          <b>{score.c}<small> / {score.n}</small></b>
          <span className="muted">{pct(score.c / score.n)} fully correct</span>
        </div>
        <div className="stats3">
          <span><span className="mono">{pct(score.opt)}</span> of options marked right</span>
          <span>Time <span className="mono">{mmss((exam.end - exam.start) / 1000)}</span></span>
          <span>{SET_BY_KEY[exam.set].name}</span>
        </div>
        <div className="palette">
          {res.map((r, k) => (
            <span key={k} className={`pcell ${r.ok ? "r-ok" : "r-no"}`}>{k + 1}</span>
          ))}
        </div>
        <div className="actions">
          {misses > 0 && (
            <button type="button" className="btn primary" onClick={onPracticeMistakes}>Practice mistakes</button>
          )}
          <button type="button" className={misses ? "btn" : "btn primary"} onClick={onNew}>New exam</button>
        </div>
      </section>

      {ids.map((qi, k) => {
        const r = res[k];
        return (
          <details key={k} className={`rev ${r.ok ? "ok" : "no"}`} open={!r.ok}>
            <summary>
              <span className="rk" aria-label={r.ok ? "Correct" : "Wrong"}>{r.ok ? "✓" : "✗"}</span>
              <span className="rn">{k + 1}</span>
              <span className="rq"><RichText text={QUESTIONS[qi].q} /></span>
            </summary>
            <div className="rbody">
              <AnswerList question={QUESTIONS[qi]} keyMask={r.key} picked={r.mask} diff={DIFF[qi]} />
            </div>
          </details>
        );
      })}
    </>
  );
}
