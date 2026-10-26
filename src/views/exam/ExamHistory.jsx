import { SET_BY_KEY } from "../../lib/bank.js";
import { mmss, pct } from "../../lib/format.js";

export default function ExamHistory({ exams }) {
  if (!exams.length) return null;
  return (
    <section className="panel">
      <h3>Recent exams</h3>
      <ul className="hist">
        {exams.slice(0, 10).map((x) => {
          const share = x.c / x.n;
          return (
            <li key={x.ts}>
              <span>
                {new Date(x.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })} ·{" "}
                {SET_BY_KEY[x.set]?.name ?? x.set} · <span className="mono">{x.c}/{x.n}</span>
                <span className="muted"> in {mmss(x.dur)}</span>
              </span>
              <span className="hb">
                <i className={share < 0.5 ? "lowv" : undefined} style={{ width: `${share * 100}%` }} />
              </span>
              <span className="pc">{pct(share)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
