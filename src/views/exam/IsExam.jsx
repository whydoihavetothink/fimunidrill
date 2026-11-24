// The exam as an IS MUNI "odpovědník", following PV157_kviz.html: every question on one
// page, a sidebar with the unanswered count, countdown and question grid, then a dark
// review page that marks each option and explains every question that was not fully right.
import { useState } from "react";
import { LECTURE_BY_ID, QUESTIONS, SET_BY_KEY } from "../../lib/bank.js";
import { timeLeft } from "../../lib/exam.js";
import { mmss } from "../../lib/format.js";
import RichText from "../../components/RichText.jsx";
import { SourceList } from "../../components/Explanation.jsx";

const goTo = (k) => document.getElementById(`is-q-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Header({ review }) {
  return (
    <>
      <div className="is-header">
        <div className="is-logo">MUNI</div>
        <div className="is-sublogo">PV157<br />Cvičný odpovědník</div>
      </div>
      <div className="is-crumb">
        <b>iS</b> &nbsp;›&nbsp; Student &nbsp;›&nbsp; Cvičný test &nbsp;›&nbsp; {review ? "Prohlídka" : "Odpovídání"}
      </div>
      <h1 className="is-page-title">Cvičný test – {review ? "prohlídka" : "odpovídání"}</h1>
    </>
  );
}

function scopeText(exam) {
  const set = SET_BY_KEY[exam.set]?.name ?? exam.set;
  const lec = exam.lec && exam.lec !== "all" ? ` · ${exam.lec} ${LECTURE_BY_ID[exam.lec]?.name ?? ""}` : "";
  return set + lec;
}

function Answering({ exam, now, actions }) {
  const [cur, setCur] = useState(0);
  const [toast, setToast] = useState(null);
  const open = exam.sel.filter((s) => !s.length).length;
  const left = exam.limit ? timeLeft(exam, now) : null;
  const jump = (k) => { setCur(k); goTo(k); };
  const submit = () => {
    const msg = open ? `Nevyplněných otázek: ${open}. Opravdu odevzdat test?` : "Opravdu odevzdat test?";
    if (window.confirm(msg)) actions.submit();
  };
  const save = () => {
    setToast("Uloženo v prohlížeči.");
    setTimeout(() => setToast(null), 2400);
  };
  const fresh = () => {
    if (window.confirm("Rozpracovaný test bude nahrazen. Vytvořit nový test?")) actions.restart();
  };

  return (
    <div className="is-screen is-answer">
      <div className="is-layout">
        <aside className="is-side">
          <div className="is-side-label">Nevyplněno otázek</div>
          <div className="is-stat"><span>celkem</span><b>{open}</b></div>
          <button type="button" className="is-sidebtn" onClick={save}>Průběžně uložit</button>
          <button type="button" className="is-sidebtn" onClick={actions.leave}>Zavřít</button>
          <button type="button" className="is-sidebtn is-submit" onClick={submit}>Odevzdat</button>
          <div className={`is-clockbox${left != null && left < 120 ? " warning" : ""}`}>
            <span>{left != null ? "Zbývající čas" : "Uplynulý čas"}</span>
            <strong>{mmss(left != null ? left : (now - exam.start) / 1000)}</strong>
          </div>
          <div className="is-qnav-title">Otázky</div>
          <div className="is-qgrid">
            {exam.ids.map((_, k) => (
              <button
                key={k}
                type="button"
                className={`is-qbtn${exam.sel[k].length ? " marked" : ""}${k === cur ? " current" : ""}`}
                aria-label={`Přejít na otázku ${k + 1}`}
                onClick={() => jump(k)}
              >
                {k + 1}
              </button>
            ))}
          </div>
          <button type="button" className="is-sidebtn" style={{ marginTop: 16 }} onClick={fresh}>Nový test</button>
        </aside>
        <main className="is-main">
          <Header review={false} />
          <div className="is-block-label">Parametry odpovědníku</div>
          <div className="is-parameter">
            <div><strong>{exam.ids.length} OTÁZEK</strong></div>
            <div>
              {exam.limit ? <>Časový limit: <strong>{mmss(exam.limit)}</strong></> : "Bez časového limitu"} · Možností
              může být správně více. · {scopeText(exam)}
            </div>
          </div>
          <div className="is-block-label">Organizační pokyny</div>
          <div className="is-instructions">
            Zaškrtni všechny správné odpovědi. Mezi otázkami se můžeš vracet. Odevzdáním test ukončíš. Otázka se počítá
            jako správná, jen když zaškrtneš přesně všechny správné možnosti.
          </div>
          {exam.ids.map((qi, k) => {
            const q = QUESTIONS[qi];
            return (
              <section className="is-question" id={`is-q-${k}`} key={k}>
                <div className="is-question-heading">
                  <span className="is-question-index">{k + 1}.</span>
                  <div className="is-question-title"><RichText text={q.q} /></div>
                </div>
                <div className="is-question-desc">Zaškrtněte všechny správné možnosti:</div>
                <div className="is-choices">
                  {exam.orders[k].map((j) => (
                    <label className="is-choice" key={j}>
                      <input
                        type="checkbox"
                        checked={exam.sel[k].includes(j)}
                        onChange={(e) => { setCur(k); actions.check(k, j, e.target.checked); }}
                      />
                      <span><RichText text={q.a[j]} /></span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
          <div className="is-tail"><button type="button" onClick={submit}>Odevzdat</button></div>
        </main>
      </div>
      {toast && <div className="is-toast" role="status">{toast}</div>}
    </div>
  );
}

const STATUS = { good: "Celá otázka správně", partial: "Částečně správně", wrong: "Nesprávně" };

function Review({ exam, actions }) {
  const [cur, setCur] = useState(0);
  const { score, res, ids } = exam;
  const jump = (k) => { setCur(k); goTo(k); };
  const misses = res.filter((r) => !r.ok).length;
  return (
    <div className="is-screen is-review">
      <div className="is-layout">
        <aside className="is-side">
          <div className="is-qnav-title">Otázky</div>
          <select className="is-select" value={cur} onChange={(e) => jump(+e.target.value)} aria-label="Přejít na otázku">
            {ids.map((_, k) => <option key={k} value={k}>Otázka {k + 1}</option>)}
          </select>
          <div className="is-qgrid">
            {res.map((r, k) => (
              <button key={k} type="button" className={`is-qbtn ${r.v}${k === cur ? " current" : ""}`} onClick={() => jump(k)}>
                {k + 1}
              </button>
            ))}
          </div>
          <div className="is-stat" style={{ marginTop: 18 }}><span>Správně</span><b>{score.c} / {score.n}</b></div>
          {misses > 0 && <button type="button" className="is-sidebtn" onClick={actions.practiceMistakes}>Procvičit chyby</button>}
          <button type="button" className="is-sidebtn" onClick={actions.close}>Zpět ke studiu</button>
          <button type="button" className="is-sidebtn" onClick={actions.restart}>Nový test</button>
        </aside>
        <main className="is-main">
          <Header review />
          <div className="is-block-label">Výsledek testu</div>
          <div className="is-review-summary">
            <strong>Správně {score.c} z {score.n} otázek</strong>
            <div className="is-review-sub">
              Částečně: {score.p ?? 0} · Nesprávně: {score.n - score.c - (score.p ?? 0)} · Čas {mmss((exam.end - exam.start) / 1000)}
              {exam.expired ? " · Čas vypršel" : ""} · {scopeText(exam)}
            </div>
          </div>
          <div className="is-legend">
            <span><i className="is-swatch good" />Celá správně</span>
            <span><i className="is-swatch partial" />Částečně správně</span>
            <span><i className="is-swatch wrong" />Nesprávně / bez odpovědi</span>
          </div>
          <div className="is-block-label">Prohlídka odpovědí</div>
          {ids.map((qi, k) => {
            const q = QUESTIONS[qi], r = res[k], e = q.e;
            const slideKey = q.k.S;
            return (
              <section className="is-question" id={`is-q-${k}`} key={k}>
                <div className="is-review-card">
                  <div className="is-question-heading">
                    <div className="is-question-index">{k + 1}.</div>
                    <div className="is-question-title"><RichText text={q.q} /></div>
                  </div>
                  <div className="is-question-desc">Zaškrtněte všechny správné možnosti:</div>
                  <div className="is-choices">
                    {exam.orders[k].map((j) => {
                      const right = (r.key >> j) & 1, picked = (r.mask >> j) & 1;
                      const st = right && picked ? "good" : picked ? "wrong" : right ? "missed" : "";
                      const mark = st === "good" ? "✓" : st === "wrong" ? "✕" : st === "missed" ? "↳" : "□";
                      return (
                        <div className={`is-choice ${st}`} key={j}>
                          <span className="is-review-marker">{mark}</span>
                          <span>
                            <RichText text={q.a[j]} />
                            {e && r.v !== "good" && e.opts[j] && <span className="is-reason">{e.opts[j]}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {e ? (
                    <details className="is-hint" open={r.v !== "good"}>
                      <summary>Vysvětlení otázky</summary>
                      <p>{e.why}</p>
                      {r.v === "good" && (
                        <ul className="is-optlist">
                          {exam.orders[k].map((j) => <li key={j}><i>{q.a[j]}</i> — {e.opts[j]}</li>)}
                        </ul>
                      )}
                      {e.note && <p><b>Poznámka:</b> {e.note}</p>}
                      {slideKey != null && slideKey !== r.key && (
                        <p><b>Pozor:</b> test byl hodnocen klíčem sady {SET_BY_KEY[exam.set]?.name}, který se od slajdů liší.</p>
                      )}
                      {e.conf === "reasoned" && <p className="is-muted">Slajdy odpověď přímo neuvádějí, vysvětlení je odvozené.</p>}
                      <div className="is-source"><b>Zdroj:</b> <SourceList src={e.src} /></div>
                    </details>
                  ) : null}
                </div>
                <div className={`is-question-foot ${r.v}`}>{STATUS[r.v]}</div>
              </section>
            );
          })}
          <div className="is-footer">
            <button type="button" onClick={actions.close}>Zpět ke studiu</button>
            <button type="button" onClick={actions.restart}>Nový test</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function IsExam({ exam, now, actions }) {
  return exam.done ? <Review exam={exam} actions={actions} /> : <Answering exam={exam} now={now} actions={actions} />;
}
