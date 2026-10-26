// Downloads the three PV157 datasets from FI MUNI Drill and merges them into
// src/data/questions.json: duplicates (including truncated or typo'd copies) are
// folded together, and each question keeps the answer key of every set it is in.
//
//   npm run questions            fetch from the web
//   npm run questions -- <dir>   read the JSON files from a local directory

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "https://fimudrill.github.io/fi-muni-drill/datasets/";
const SETS = [
  ["A", "questions_PV157.json"],
  ["M", "questions_PV157_midterm.json"],
  ["B", "questions_PV157_midterm_2011.json"],
];
const MATCH = 0.88;
const OUT = fileURLToPath(new URL("../src/data/questions.json", import.meta.url));

// Keep line breaks (one question contains an ASCII table), trim everything else.
function clean(text) {
  text = text.normalize("NFC").replace(/\r/g, "");
  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((ln) => ln.trimEnd())
      .map((ln) => (ln.startsWith(" ") ? ln.slice(1) : ln))
      .join("\n")
      .trim();
  }
  return text.replace(/\s+/g, " ").trim();
}

const stripNumber = (text) => text.replace(/^\d+\s*[.)]\s*/, "");

function norm(text) {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[ .:;?]+|[ .:;?]+$/g, "");
}

// Port of Python's difflib.SequenceMatcher(None, a, b).ratio(), autojunk included,
// so fuzzy matches stay identical to the original merge.
function ratio(a, b) {
  const la = a.length, lb = b.length;
  if (!la && !lb) return 1;
  const b2j = new Map();
  for (let j = 0; j < lb; j++) {
    if (!b2j.has(b[j])) b2j.set(b[j], []);
    b2j.get(b[j]).push(j);
  }
  if (lb >= 200) {
    const ntest = Math.floor(lb / 100) + 1;
    for (const [c, idx] of [...b2j]) if (idx.length > ntest) b2j.delete(c);
  }
  const longest = (alo, ahi, blo, bhi) => {
    let besti = alo, bestj = blo, bestsize = 0;
    let j2len = new Map();
    for (let i = alo; i < ahi; i++) {
      const next = new Map();
      for (const j of b2j.get(a[i]) || []) {
        if (j < blo) continue;
        if (j >= bhi) break;
        const k = (j2len.get(j - 1) || 0) + 1;
        next.set(j, k);
        if (k > bestsize) { besti = i - k + 1; bestj = j - k + 1; bestsize = k; }
      }
      j2len = next;
    }
    while (besti > alo && bestj > blo && a[besti - 1] === b[bestj - 1]) { besti--; bestj--; bestsize++; }
    while (besti + bestsize < ahi && bestj + bestsize < bhi && a[besti + bestsize] === b[bestj + bestsize]) bestsize++;
    return [besti, bestj, bestsize];
  };
  let matches = 0;
  const queue = [[0, la, 0, lb]];
  while (queue.length) {
    const [alo, ahi, blo, bhi] = queue.pop();
    const [i, j, k] = longest(alo, ahi, blo, bhi);
    if (!k) continue;
    matches += k;
    if (alo < i && blo < j) queue.push([alo, i, blo, j]);
    if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi]);
  }
  return (2 * matches) / (la + lb);
}

const similar = (a, b) => a === b || ratio(a, b) >= MATCH;

// Map each answer in `small` to a distinct answer in `big`, or return null.
function matchAnswers(small, big) {
  const used = new Set(), mapping = [];
  for (const s of small) {
    let best = null, bestR = 0;
    big.forEach((b, j) => {
      if (used.has(j)) return;
      const r = s === b ? 1 : ratio(s, b);
      if (r > bestR) { best = j; bestR = r; }
    });
    if (best === null || bestR < MATCH) return null;
    used.add(best);
    mapping.push(best);
  }
  return mapping;
}

async function load(dir, file) {
  if (dir) return JSON.parse(await readFile(`${dir}/${file}`, "utf8"));
  const res = await fetch(BASE + file);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const dir = process.argv[2];
  const entries = [];
  for (const [key, file] of SETS) {
    const data = await load(dir, file);
    data.forEach((item, pos) => {
      entries.push({
        set: key,
        pos,
        stem: clean(stripNumber(item.name)),
        answers: item.answers.map((a) => [clean(a.body), Boolean(a.right)]),
      });
    });
  }

  // Biggest answer lists first so subsets (truncated scrapes) fold into the full version.
  const order = entries.map((_, i) => i).sort((x, y) => {
    const a = entries[x], b = entries[y];
    return (b.answers.length - a.answers.length) || ("AMB".indexOf(a.set) - "AMB".indexOf(b.set)) || (a.pos - b.pos);
  });
  const clusters = [];
  for (const i of order) {
    const e = entries[i];
    const ns = norm(e.stem);
    const na = e.answers.map(([body]) => norm(body));
    let placed = false;
    for (const c of clusters) {
      if (!similar(ns, c.nstem)) continue;
      const mapping = matchAnswers(na, c.nanswers);
      if (!mapping) continue;
      c.members.push([e, mapping]);
      placed = true;
      break;
    }
    if (!placed) {
      clusters.push({ nstem: ns, nanswers: na, stem: e.stem, answers: e.answers.map(([b]) => b), members: [[e, na.map((_, j) => j)]] });
    }
  }

  const bank = [];
  let disputed = 0;
  for (const c of clusters) {
    const base = c.members[0][0].answers.map(([, r]) => r);
    const keys = {}, pos = {}, extra = {};
    const members = [...c.members].sort((x, y) => x[0].pos - y[0].pos);
    for (const [e, mapping] of members) {
      const flags = [...base];
      e.answers.forEach(([, right], n) => { flags[mapping[n]] = right; });
      const mask = flags.reduce((m, f, j) => (f ? m | (1 << j) : m), 0);
      if (e.set in keys) {
        if (keys[e.set] !== mask && !(extra[e.set] || []).includes(mask)) (extra[e.set] ||= []).push(mask);
        continue;
      }
      keys[e.set] = mask;
      pos[e.set] = e.pos;
    }
    if (new Set(Object.values(keys)).size > 1 || Object.keys(extra).length) disputed++;
    const id = createHash("sha1").update(c.nstem + "\x1f" + [...c.nanswers].sort().join("\x1f"), "utf8").digest("hex").slice(0, 10);
    const q = { i: id, q: c.stem, a: c.answers, k: keys, p: pos };
    if (Object.keys(extra).length) q.x = extra;
    bank.push(q);
  }

  const ids = new Set(bank.map((q) => q.i));
  if (ids.size !== bank.length) throw new Error("question id collision");
  const sets = {};
  for (const [key] of SETS) {
    sets[key] = bank
      .map((q, idx) => [q.p[key], idx])
      .filter(([p]) => p !== undefined)
      .sort((x, y) => x[0] - y[0] || x[1] - y[1])
      .map(([, idx]) => idx);
  }

  await writeFile(OUT, JSON.stringify({ questions: bank, sets }, null, 1) + "\n");
  console.log(`${entries.length} entries -> ${bank.length} unique questions, ${disputed} with conflicting keys`,
    Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, v.length])));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
