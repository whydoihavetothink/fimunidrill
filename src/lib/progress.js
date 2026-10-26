// Per-question progress. Entries are keyed by question id so they survive
// rebuilding the bank and are shared by every set containing the question.
//
// entry: { v: visited, n: attempts, c: right, w: wrong, b: right-in-a-row,
//          l: last answer right (1/0), t: last change, f: flagged, o: chosen key }
import { DISPUTED, QUESTIONS, SET_LISTS } from "./bank.js";
import { MODES } from "./modes.js";

export const MASTER = 3;

export const STATUS_LABEL = {
  new: "Not visited",
  seen: "Visited only",
  wrong: "Wrong",
  ok: "Right",
  mastered: "Mastered",
};

const EMPTY = { v: 0, n: 0, c: 0, w: 0, b: 0, t: 0 };

export function blankProgress() {
  return {
    v: 1,
    q: {},
    exams: [],
    prefs: { set: "A", mode: "smart", count: false, cur: {}, exam: { n: 20, from: "all", timed: false } },
  };
}

export function normalizeProgress(raw) {
  const out = blankProgress();
  if (!raw || typeof raw !== "object") return out;
  if (raw.q && typeof raw.q === "object") {
    for (const [id, e] of Object.entries(raw.q)) if (e && typeof e === "object") out.q[id] = { ...e };
  }
  if (Array.isArray(raw.exams)) {
    out.exams = raw.exams.filter((x) => x && typeof x.ts === "number").slice(0, 30);
  }
  const p = raw.prefs && typeof raw.prefs === "object" ? raw.prefs : {};
  if (SET_LISTS[p.set]) out.prefs.set = p.set;
  if (MODES[p.mode]) out.prefs.mode = p.mode;
  out.prefs.count = !!p.count;
  if (p.cur && typeof p.cur === "object") out.prefs.cur = { ...p.cur };
  if (p.exam && typeof p.exam === "object") out.prefs.exam = { ...out.prefs.exam, ...p.exam };
  return out;
}

// Combine two progress snapshots (used by import): the newer entry wins per question.
export function mergeProgress(a, b) {
  const out = normalizeProgress(a);
  for (const [id, y] of Object.entries(b.q)) {
    const x = out.q[id];
    if (!x) { out.q[id] = { ...y }; continue; }
    const win = (y.t || 0) > (x.t || 0) ? y : x;
    out.q[id] = { ...win, v: Math.max(x.v || 0, y.v || 0) };
  }
  const seen = new Set(out.exams.map((e) => e.ts));
  out.exams = [...out.exams, ...b.exams.filter((e) => !seen.has(e.ts))]
    .sort((p, q) => q.ts - p.ts)
    .slice(0, 30);
  return out;
}

export const entryOf = (P, qi) => P.q[QUESTIONS[qi].i] || EMPTY;

export function statusOf(P, qi) {
  const e = P.q[QUESTIONS[qi].i];
  if (!e || !e.n) return e && e.v ? "seen" : "new";
  if (e.l === 0) return "wrong";
  return e.b >= MASTER ? "mastered" : "ok";
}

export const isFlagged = (P, qi) => !!P.q[QUESTIONS[qi].i]?.f;

// The set's own key for a question (falls back to any set that has it).
export function ownKey(qi, setKey) {
  const k = QUESTIONS[qi].k;
  return k[setKey] != null ? k[setKey] : Object.values(k)[0];
}

// The key used for grading: the user's chosen key for disputed questions, else the set's.
export function keyOf(P, qi, setKey) {
  const e = P.q[QUESTIONS[qi].i];
  return e && e.o != null ? e.o : ownKey(qi, setKey);
}

export function withEntry(P, qi, update) {
  const id = QUESTIONS[qi].i;
  return { ...P, q: { ...P.q, [id]: update({ ...EMPTY, ...P.q[id] }) } };
}

export function applyAnswer(e, ok, now = Date.now()) {
  return {
    ...e,
    v: 1,
    n: (e.n || 0) + 1,
    c: (e.c || 0) + (ok ? 1 : 0),
    w: (e.w || 0) + (ok ? 0 : 1),
    b: ok ? Math.min((e.b || 0) + 1, 9) : 0,
    l: ok ? 1 : 0,
    t: now,
  };
}

export const markVisited = (P, qi) => (P.q[QUESTIONS[qi].i]?.v ? P : withEntry(P, qi, (e) => ({ ...e, v: 1 })));

export const toggleFlag = (P, qi) =>
  withEntry(P, qi, (e) => {
    const next = { ...e, t: Date.now() };
    if (next.f) delete next.f;
    else next.f = 1;
    return next;
  });

export function countStatuses(P, list) {
  const c = { new: 0, seen: 0, wrong: 0, ok: 0, mastered: 0, flagged: 0, disputed: 0, answered: 0 };
  for (const qi of list) {
    const s = statusOf(P, qi);
    c[s]++;
    if (s !== "new" && s !== "seen") c.answered++;
    if (isFlagged(P, qi)) c.flagged++;
    if (DISPUTED[qi]) c.disputed++;
  }
  return c;
}
