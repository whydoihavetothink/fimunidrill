// The merged question bank plus everything derived from it once at startup.
import data from "../data/questions.json";

export const QUESTIONS = data.questions;
export const SET_LISTS = data.sets;

export const SETS = [
  { key: "A", name: "PV157 All", short: "All" },
  { key: "M", name: "Midterm", short: "Mid" },
  { key: "B", name: "Midterm 2011", short: "2011" },
];
export const SET_BY_KEY = Object.fromEntries(SETS.map((s) => [s.key, s]));

// 1-based position of each question within each set, as in the original drill.
export const POSITION = Object.fromEntries(
  SETS.map((s) => [s.key, new Map(SET_LISTS[s.key].map((qi, n) => [qi, n + 1]))]),
);

export const fold = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const SEARCH_TEXT = QUESTIONS.map((q) => fold(q.q + " \u0001 " + q.a.join(" \u0001 ")));

// Every distinct answer key a question has across sets, with the sets that use it.
export const VARIANTS = QUESTIONS.map((q) => {
  const list = [];
  const add = (mask, label) => {
    let v = list.find((x) => x.mask === mask);
    if (!v) list.push((v = { mask, labels: [] }));
    if (!v.labels.includes(label)) v.labels.push(label);
  };
  for (const s of SETS) if (q.k[s.key] != null) add(q.k[s.key], s.name);
  for (const [s, masks] of Object.entries(q.x || {})) {
    for (const m of masks) add(m, `${SET_BY_KEY[s].name} (duplicate entry)`);
  }
  return list;
});

export const DISPUTED = VARIANTS.map((v) => v.length > 1);

// Bit j is set when the sets disagree on whether answer j is correct.
export const DIFF = VARIANTS.map((v) => v.reduce((acc, x) => acc | (x.mask ^ v[0].mask), 0));
