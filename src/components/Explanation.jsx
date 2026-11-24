import { LECTURE_BY_ID, QUESTIONS, SET_BY_KEY, keySetFor } from "../lib/bank.js";

// "L03 · Tokeny a čipové karty, slajdy 12, 14 (PV157_2026_L03_Tokeny_final.pdf)"
export function SourceList({ src }) {
  if (!src?.length) return null;
  return (
    <ul className="src">
      {src.map((s, n) => {
        const lec = LECTURE_BY_ID[s.l];
        const slides = s.s || [];
        return (
          <li key={n}>
            <b>{s.l}</b>
            {lec ? ` · ${lec.name}` : ""}
            {slides.length ? `, ${slides.length > 1 ? "slajdy" : "slajd"} ${slides.join(", ")}` : ""}
            {lec && <span className="file"> ({lec.file})</span>}
          </li>
        );
      })}
    </ul>
  );
}

// Why the slide key is what it is, the source slides, and (optionally) one reason per option.
// `gradedWith` is the key used for grading; a note appears when it differs from the slides.
export default function Explanation({ qi, setKey, gradedWith, showOptions = false }) {
  const q = QUESTIONS[qi];
  const e = q.e;
  if (!e) return null;
  const slideKey = q.k.S;
  const keySet = keySetFor(setKey);
  const differs = gradedWith != null && slideKey != null && gradedWith !== slideKey;
  return (
    <section className="explain" aria-label="Vysvětlení">
      <div className="exhead">
        <h3>Vysvětlení</h3>
        {e.conf === "reasoned" && (
          <span className="pill p-reason" title="Slajdy odpověď přímo neuvádějí; vysvětlení je odvozené z jejich obsahu.">
            odvozeno
          </span>
        )}
      </div>
      <p className="why">{e.why}</p>
      {showOptions && e.opts.length === q.a.length && (
        <ol className="exopts">
          {q.a.map((text, j) => {
            const right = (slideKey >> j) & 1;
            return (
              <li key={j} className={right ? "r" : "w"}>
                <span className="ic" aria-hidden="true">{right ? "✓" : "✗"}</span>
                <span>
                  <span className="otxt">{text}</span>
                  <span className="oreason">{e.opts[j]}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {e.note && <p className="exnote">{e.note}</p>}
      {differs && (
        <p className="exnote">
          Hodnoceno klíčem sady {SET_BY_KEY[keySet]?.name ?? keySet}, který se od slajdů liší. Vysvětlení odpovídá
          klíči podle slajdů.
        </p>
      )}
      <div className="exsrc">
        <span className="lbl">Zdroj</span>
        <SourceList src={e.src} />
      </div>
    </section>
  );
}
