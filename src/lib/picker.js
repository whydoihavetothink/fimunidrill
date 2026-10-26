// Chooses the next practice question for a set and mode.
import { DISPUTED, SET_LISTS } from "./bank.js";
import { entryOf, isFlagged, statusOf } from "./progress.js";
import { randomItem } from "./format.js";

export function poolFor(P, setKey, mode) {
  const list = SET_LISTS[setKey];
  switch (mode) {
    case "new": return list.filter((qi) => !entryOf(P, qi).n);
    case "mistakes": return list.filter((qi) => statusOf(P, qi) === "wrong");
    case "flagged": return list.filter((qi) => isFlagged(P, qi));
    case "disputed": return list.filter((qi) => DISPUTED[qi]);
    default: return list;
  }
}

// Returns { qi, cursor }. `qi` is null when the mode has nothing left;
// `cursor` is set only in "order" mode and should be saved to prefs.cur.
export function pickNext(P, setKey, mode, recent) {
  const list = poolFor(P, setKey, mode);
  if (!list.length) return { qi: null, cursor: null };

  if (mode === "order") {
    const cursor = ((P.prefs.cur[setKey] ?? -1) + 1) % list.length;
    return { qi: list[cursor], cursor };
  }

  // Don't repeat what was just on screen unless nothing else is left.
  const avoid = new Set(recent.slice(-Math.min(5, Math.floor(list.length / 2))));
  const fresh = (arr) => {
    const f = arr.filter((qi) => !avoid.has(qi));
    return f.length ? f : arr;
  };
  if (mode !== "smart") return { qi: randomItem(fresh(list)), cursor: null };

  const wrong = [], unanswered = [], learning = [], mastered = [];
  for (const qi of list) {
    const s = statusOf(P, qi);
    (s === "wrong" ? wrong : s === "ok" ? learning : s === "mastered" ? mastered : unanswered).push(qi);
  }
  // Lowest streak first, then the one answered longest ago, with a little randomness.
  const due = (arr) => {
    const sorted = fresh(arr).sort((a, b) => {
      const x = entryOf(P, a), y = entryOf(P, b);
      return x.b - y.b || x.t - y.t;
    });
    return randomItem(sorted.slice(0, 3));
  };
  const wrongReady = wrong.some((qi) => !avoid.has(qi));
  const r = Math.random();
  let qi;
  if (wrongReady && (r < 0.3 || (!unanswered.length && !learning.length))) qi = randomItem(fresh(wrong));
  else if (unanswered.length && (r < 0.8 || !learning.length)) qi = randomItem(fresh(unanswered));
  else if (learning.length) qi = due(learning);
  else if (wrong.length) qi = randomItem(fresh(wrong));
  else qi = due(mastered);
  return { qi, cursor: null };
}
