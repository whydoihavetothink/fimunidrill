import { useRef, useState } from "react";
import { QUESTIONS, SET_LISTS } from "../lib/bank.js";
import { applyAnswer, entryOf, keyOf, markVisited, ownKey, withEntry } from "../lib/progress.js";
import { pickNext } from "../lib/picker.js";
import { maskOf, shuffle } from "../lib/format.js";

const IDLE = { cur: null, order: [], sel: [], checked: false, result: null, before: null };

// The practice session: current question, its shuffled answers, the selection and
// the graded result. Progress itself lives in the caller's state (P / setP).
export default function usePractice(P, setP) {
  const [state, setState] = useState(IDLE);
  const [session, setSession] = useState({ n: 0, c: 0 });
  const recent = useRef([]);
  const setKey = P.prefs.set;

  function show(qi) {
    if (qi == null) {
      setState(IDLE);
      return;
    }
    recent.current = [...recent.current.slice(-11), qi];
    setState({ ...IDLE, cur: qi, order: shuffle(QUESTIONS[qi].a.map((_, j) => j)) });
    setP((p) => markVisited(p, qi));
  }

  // `over` lets callers pass a set, mode or progress they just changed in the same event.
  function next(over = {}) {
    const s = over.setKey ?? setKey;
    const m = over.mode ?? P.prefs.mode;
    const { qi, cursor } = pickNext(over.progress ?? P, s, m, recent.current);
    if (cursor != null) setP((p) => ({ ...p, prefs: { ...p.prefs, cur: { ...p.prefs.cur, [s]: cursor } } }));
    show(qi);
  }

  function open(qi) {
    if (P.prefs.mode === "order") {
      const at = SET_LISTS[setKey].indexOf(qi);
      setP((p) => ({ ...p, prefs: { ...p.prefs, cur: { ...p.prefs.cur, [setKey]: at } } }));
    }
    show(qi);
  }

  function toggle(d) {
    if (state.cur == null || state.checked) return;
    const j = state.order[d];
    if (j == null) return;
    setState((s) => ({ ...s, sel: s.sel.includes(j) ? s.sel.filter((x) => x !== j) : [...s.sel, j] }));
  }

  function check() {
    if (state.cur == null || state.checked) return;
    const qi = state.cur;
    const key = keyOf(P, qi, setKey);
    const sel = maskOf(state.sel);
    const ok = sel === key;
    const before = { ...entryOf(P, qi) };
    setP((p) => withEntry(p, qi, (e) => applyAnswer(e, ok)));
    setState((s) => ({ ...s, checked: true, result: { ok, key, sel }, before }));
    setSession((s) => ({ n: s.n + 1, c: s.c + (ok ? 1 : 0) }));
  }

  // Grade the current attempt again with a different key (disputed questions).
  function regrade(mask) {
    const { cur: qi, result, before } = state;
    if (qi == null || !result) return;
    const ok = result.sel === mask;
    const base = { ...before };
    if (mask === ownKey(qi, setKey)) delete base.o;
    else base.o = mask;
    setP((p) =>
      withEntry(p, qi, (e) => {
        const updated = applyAnswer(base, ok);
        if (e.f) updated.f = 1;
        else delete updated.f;
        return updated;
      }),
    );
    setState((s) => ({ ...s, result: { ok, key: mask, sel: result.sel }, before: base }));
    setSession((s) => ({ n: s.n, c: s.c - (result.ok ? 1 : 0) + (ok ? 1 : 0) }));
  }

  function clear() {
    setState(IDLE);
  }

  function reset() {
    recent.current = [];
    setSession({ n: 0, c: 0 });
  }

  return { ...state, session, next, open, toggle, check, regrade, clear, reset };
}
