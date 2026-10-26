// Exam simulation: build a random paper, then grade it into progress + history.
import { QUESTIONS, SET_LISTS } from "./bank.js";
import { applyAnswer, keyOf, statusOf, withEntry } from "./progress.js";
import { maskOf, shuffle } from "./format.js";

export const SECONDS_PER_QUESTION = 60;

export function examSize(cfg, setKey) {
  const total = SET_LISTS[setKey].length;
  return cfg.n === "all" ? total : Math.min(cfg.n, total);
}

export function createExam(P, setKey, cfg) {
  const list = SET_LISTS[setKey];
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
    ids,
    orders: ids.map((qi) => shuffle(QUESTIONS[qi].a.map((_, j) => j))),
    sel: ids.map(() => []),
    idx: 0,
    start: Date.now(),
    limit: cfg.timed ? ids.length * SECONDS_PER_QUESTION : 0,
    done: false,
  };
}

export function validateExam(raw) {
  const ok =
    raw && Array.isArray(raw.ids) && raw.ids.every((qi) => QUESTIONS[qi]) &&
    Array.isArray(raw.sel) && Array.isArray(raw.orders) && SET_LISTS[raw.set];
  return ok ? raw : null;
}

export const timeLeft = (exam, now) => exam.limit - (now - exam.start) / 1000;

// Returns the updated progress and the finished exam with per-question results.
export function gradeExam(P, exam, now = Date.now()) {
  let progress = P;
  let right = 0, optRight = 0, optTotal = 0;
  const res = exam.ids.map((qi, k) => {
    const key = keyOf(P, qi, exam.set);
    const mask = maskOf(exam.sel[k]);
    const ok = mask === key;
    if (ok) right++;
    for (let j = 0; j < QUESTIONS[qi].a.length; j++) {
      optTotal++;
      if (((mask >> j) & 1) === ((key >> j) & 1)) optRight++;
    }
    progress = withEntry(progress, qi, (e) => applyAnswer(e, ok, now));
    return { ok, key, mask };
  });
  const end = exam.limit ? Math.min(now, exam.start + exam.limit * 1000) : now;
  const opt = optRight / optTotal;
  const summary = { ts: end, set: exam.set, n: exam.ids.length, c: right, opt: Math.round(opt * 1000) / 1000, dur: Math.round((end - exam.start) / 1000) };
  progress = { ...progress, exams: [summary, ...progress.exams].slice(0, 30) };
  return { progress, exam: { ...exam, done: true, end, res, score: { c: right, n: exam.ids.length, opt } } };
}
