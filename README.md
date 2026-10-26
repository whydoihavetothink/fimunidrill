# PV157 Drill

Exam practice for PV157 (Autentizace a řízení přístupu). It uses the PV157 All, Midterm and Midterm 2011 question sets from [FI MUNI Drill](https://fimudrill.github.io/fi-muni-drill/).

```sh
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

- `npm run build`: production build into `dist/`. `npm run preview` serves it.
- `npm run questions`: re-downloads the three datasets and regenerates `src/data/questions.json`. Pass a directory to read local copies instead: `npm run questions -- ./downloads`.

Progress is stored in the browser (localStorage). Use **Export progress** and **Import…** in the sidebar to back it up or move it to another browser.

## Layout

```
scripts/build-questions.mjs   merges the datasets: duplicates folded, per-set answer keys kept
src/
  App.jsx                     app state, navigation, keyboard shortcuts
  lib/                        plain logic, no React
    bank.js                   question bank plus derived data (positions, search text, key conflicts)
    progress.js               per-question progress: status, grading key, updates, import merge
    picker.js, modes.js       practice modes and choosing the next question
    exam.js                   building and grading an exam
    format.js                 small helpers
  hooks/                      usePractice, useStoredState, useKeydown, useNow
  components/                 shared UI: header, option button, answer list, status pill…
  views/practice/             question card, disputed-key panel, sidebar (summary, modes, map, settings)
  views/exam/                 setup, runner, results, history
  views/browse/               searchable list of all questions
  styles/                     CSS split by area
```
