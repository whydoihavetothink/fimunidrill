// The merged question bank plus everything derived from it once at startup.
//
// questions.json  the three FI MUNI Drill sets (see scripts/build-questions.mjs)
// explain.json    per-question explanation checked against the lecture slides, keyed by id
// extra.json      questions that none of the three sets contain, written from the slides
//
// Every question that has an explanation also gets the slide-checked key as set "S".
import data from "../data/questions.json";
import explain from "../data/explain.json";
import extra from "../data/extra.json";

export const LECTURES = [
  { id: "L02", name: "Tajné informace", file: "PV157_2026_L02_TajneInfo_final.pdf" },
  { id: "L03", name: "Tokeny a čipové karty", file: "PV157_2026_L03_Tokeny_final.pdf" },
  { id: "L04", name: "Biometriky", file: "PV157_2026_L04a6_Biometriky_final.pdf" },
  { id: "L05", name: "Autentizace dat a právo", file: "PV157_2026_L05_data_pravo_final.pdf" },
  { id: "L06", name: "Kontext, lokace, počítače", file: "PV157_2026_L06_ContextLocation_Computers_final.pdf" },
  { id: "L07", name: "Autentizační protokoly", file: "PV157_2026_L07_Protokoly_final.pdf" },
  { id: "L08", name: "Řízení přístupu", file: "PV157_2026_L0809_AC_final.pdf" },
  { id: "L10", name: "Příklady autentizace", file: "PV157_2026_L10_PrikladyAutentizace_final.pdf" },
];
export const LECTURE_BY_ID = Object.fromEntries(LECTURES.map((l) => [l.id, l]));

const toMask = (indices) => indices.reduce((m, j) => m | (1 << j), 0);

function attach(q, e) {
  if (!e) return q;
  return {
    ...q,
    k: { S: toMask(e.key), ...q.k },
    l: LECTURE_BY_ID[e.lecture] ? e.lecture : null,
    e: { src: e.src || [], conf: e.conf, why: e.why, opts: e.opts || [], note: e.note || "" },
  };
}

const base = data.questions.map((q) => attach(q, explain[q.i]));
const added = extra.map((x) => attach({ i: x.i, q: x.q, a: x.a, k: {}, p: {}, isNew: true }, x));

export const QUESTIONS = [...base, ...added];

const lectureRank = (qi) => {
  const r = LECTURES.findIndex((l) => l.id === QUESTIONS[qi].l);
  return r < 0 ? LECTURES.length : r;
};
const withKey = (key) => QUESTIONS.map((q, qi) => (q.k[key] != null ? qi : -1)).filter((qi) => qi >= 0);

export const SET_LISTS = {
  S: withKey("S").sort((a, b) => lectureRank(a) - lectureRank(b) || a - b),
  ...data.sets,
  N: added.map((_, n) => base.length + n),
};

export const SETS = [
  { key: "S", name: "Everything · slide key", short: "Slides" },
  { key: "A", name: "PV157 All", short: "All" },
  { key: "M", name: "Midterm", short: "Mid" },
  { key: "B", name: "Midterm 2011", short: "2011" },
  { key: "N", name: "New from slides", short: "New" },
].filter((s) => SET_LISTS[s.key]?.length);
export const SET_BY_KEY = Object.fromEntries(SETS.map((s) => [s.key, s]));
export const DEFAULT_SET = SETS[0].key;

// Sets whose keys are their own; "N" only lists questions graded with the slide key.
export const KEY_SETS = SETS.filter((s) => s.key !== "N");
export const keySetFor = (setKey) => (setKey === "N" ? "S" : setKey);

// 1-based position of each question within each set, as in the original drill.
export const POSITION = Object.fromEntries(
  SETS.map((s) => [s.key, new Map(SET_LISTS[s.key].map((qi, n) => [qi, n + 1]))]),
);

export const inLecture = (qi, lec) => !lec || lec === "all" || QUESTIONS[qi].l === lec;

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
  for (const s of KEY_SETS) if (q.k[s.key] != null) add(q.k[s.key], s.name);
  for (const [s, masks] of Object.entries(q.x || {})) {
    for (const m of masks) add(m, `${SET_BY_KEY[s].name} (duplicate entry)`);
  }
  return list;
});

export const DISPUTED = VARIANTS.map((v) => v.length > 1);

// Bit j is set when the sets disagree on whether answer j is correct.
export const DIFF = VARIANTS.map((v) => v.reduce((acc, x) => acc | (x.mask ^ v[0].mask), 0));
