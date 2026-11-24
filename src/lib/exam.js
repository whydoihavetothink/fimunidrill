// Exam simulation in the style of an IS MUNI "odpovědník": a random paper shown on one
// page, a countdown, then a review with explanations. Grading feeds practice progress.
import { QUESTIONS, SET_LISTS, inLecture } from "./bank.js";
import { applyAnswer, keyOf, statusOf, withEntry } from "./progress.js";
import { bits, maskOf, shuffle } from "./format.js";

// The IS practice test this mirrors: 8 questions in 18 minutes.
export const IS_QUESTIONS = 8;
export const IS_MINUTES = 18;
export const SECONDS_PER_QUESTION = (IS_MINUTES * 60) / IS_QUESTIONS;

export const poolOf = (setKey, cfg) => SET_LISTS[setKey].filter((qi) => inLecture(qi, cfg.lec));

export function examSize(cfg, setKey) {
  const total = poolOf(setKey, cfg).length;
  return cfg.n === "all" ? total : Math.min(cfg.n, total);
}

export function createExam(P, setKey, cfg) {
  const list = poolOf(setKey, cfg);
  const want = examSize(cfg, setKey);
  let ids;
  if (cfg.from === "weak") {
    // Questions not yet mastered first, topped up with mastered ones if there are too few.
    const weak = shuffle(list.filter((qi) => statusOf(P, qi) !== "mastered"));
    const rest = shuffle(list.filter((qi) => statusOf(P, qi) === "mastered"));
    ids = shuffle(weak.concat(rest).slice(0, want));
  } else {
    ids = shuffle(list).slice(0, want);
  }
  return {
    set: setKey,
    lec: cfg.lec || "all",
    ids,
    orders: ids.map((qi) => shuffle(QUESTIONS[qi].a.map((_, j) => j))),
    sel: ids.map(() => []),
    idx: 0,
    start: Date.now(),
    limit: cfg.timed ? Math.round(ids.length * SECONDS_PER_QUESTION) : 0,
    done: false,
  };
}

export function validateExam(raw) {
  const ok =
    raw && Array.isArray(raw.ids) && raw.ids.every((qi) => QUESTIONS[qi]) &&
    Array.isArray(raw.sel) && Array.isArray(raw.orders) && SET_LISTS[raw.set] &&
    raw.orders.every((o, k) => Array.isArray(o) && o.length === QUESTIONS[raw.ids[k]].a.length);
  return ok ? raw : null;
}

export const timeLeft = (exam, now) => exam.limit - (now - exam.start) / 1000;

// "good" = exactly the key, "partial" = at least one correct option picked, else "wrong" (as in IS).
export function verdictOf(key, mask) {
  if (mask === key) return "good";
  return bits(mask & key) ? "partial" : "wrong";
}

// Returns the updated progress and the finished exam with per-question results.
export function gradeExam(P, exam, now = Date.now(), expired = false) {
  let progress = P;
  let right = 0, partial = 0, optRight = 0, optTotal = 0;
  const res = exam.ids.map((qi, k) => {
    const key = keyOf(P, qi, exam.set);
    const mask = maskOf(exam.sel[k]);
    const v = verdictOf(key, mask);
    const ok = v === "good";
    if (ok) right++;
    else if (v === "partial") partial++;
    for (let j = 0; j < QUESTIONS[qi].a.length; j++) {
      optTotal++;
      if (((mask >> j) & 1) === ((key >> j) & 1)) optRight++;
    }
    progress = withEntry(progress, qi, (e) => applyAnswer(e, ok, now));
    return { ok, v, key, mask };
  });
  const end = exam.limit ? Math.min(now, exam.start + exam.limit * 1000) : now;
  const opt = optRight / optTotal;
  const summary = { ts: end, set: exam.set, n: exam.ids.length, c: right, opt: Math.round(opt * 1000) / 1000, dur: Math.round((end - exam.start) / 1000) };
  progress = { ...progress, exams: [summary, ...progress.exams].slice(0, 30) };
  return {
    progress,
    exam: { ...exam, done: true, end, expired, res, score: { c: right, p: partial, n: exam.ids.length, opt } },
  };
}
