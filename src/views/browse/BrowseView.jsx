import { useDeferredValue } from "react";
import { DISPUTED, SEARCH_TEXT, SET_LISTS, fold } from "../../lib/bank.js";
import { isFlagged, statusOf } from "../../lib/progress.js";
import BrowseItem from "./BrowseItem.jsx";

const FILTERS = [
  ["all", "All"],
  ["unanswered", "Not answered"],
  ["wrong", "Wrong"],
  ["ok", "Right"],
  ["mastered", "Mastered"],
  ["flagged", "Flagged"],
  ["disputed", "Disputed"],
];

function matches(P, qi, filter) {
  const status = statusOf(P, qi);
  switch (filter) {
    case "all": return true;
    case "flagged": return isFlagged(P, qi);
    case "disputed": return DISPUTED[qi];
    case "unanswered": return status === "new" || status === "seen";
    default: return status === filter;
  }
}

export default function BrowseView({ P, setKey, browse, onChange, onOpen }) {
  const query = useDeferredValue(browse.q);
  const term = fold(query.trim());
  const list = SET_LISTS[setKey];
  const items = list.filter((qi) => (!term || SEARCH_TEXT[qi].includes(term)) && matches(P, qi, browse.f));

  return (
    <>
      <section className="btools">
        <input
          id="browse-search"
          className="search"
          type="search"
          placeholder="Search questions and answers (diacritics optional)"
          autoComplete="off"
          value={browse.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
        <div className="btoolrow">
          <div className="seg">
            {FILTERS.map(([key, label]) => (
              <button key={key} type="button" className="chipbtn" aria-pressed={browse.f === key} onClick={() => onChange({ f: key })}>
                {label}
              </button>
            ))}
          </div>
          <label className="toggle" htmlFor="browse-answers">
            <input id="browse-answers" type="checkbox" checked={browse.answers} onChange={(e) => onChange({ answers: e.target.checked })} />
            Show answers
          </label>
        </div>
        <p className="bcount">{items.length} of {list.length} questions</p>
      </section>
      <div className="blist">
        {items.map((qi) => (
          <BrowseItem key={qi} P={P} qi={qi} setKey={setKey} term={term} showAnswers={browse.answers} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}
