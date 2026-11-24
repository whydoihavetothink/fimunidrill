# PV157 Drill

Exam practice for PV157 (Autentizace a řízení přístupu). It uses the PV157 All, Midterm and Midterm 2011 question sets from [FI MUNI Drill](https://fimudrill.github.io/fi-muni-drill/).

On top of those sets:

- **Explanations.** Every question has a Czech explanation checked against the 2026 lecture slides: why the answer is right, one reason per option, and the lecture + slide numbers it comes from. They open automatically when you answer wrong (and on request when you're right), in the exam review, and in Browse. Data: `src/data/explain.json`, keyed by question id, so it survives `npm run questions`.
- **Slide key.** The *Everything · slide key* set holds all questions graded by the key the slides support. The 16 questions where it differs from an original set are shown as disputed, with a note saying why.
- **New questions.** *New from slides* has 78 questions on slide content none of the original sets cover (mostly L07 protocols, L08 access control, L10 examples). Data: `src/data/extra.json`.
- **Lecture filter** for practice, exams and Browse.
- **Exam** in the format of the IS MUNI odpovědník from `PV157_kviz.html`: 8 questions / 18 minutes by default, all on one page, then a review that marks each option (✓ ✕ ↳) and explains every question that wasn't fully right.

```sh
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

- `npm run build`: production build into `dist/`. `npm run preview` serves it.
- `npm run questions`: re-downloads the three datasets and regenerates `src/data/questions.json`. Pass a directory to read local copies instead: `npm run questions -- ./downloads`.

## Deploying to GitHub Pages

The build is plain static files, and asset paths are relative, so it works at any URL path. `.github/workflows/deploy.yml` builds the app and publishes it on every push to `main`.

1. Create a GitHub repo and push this folder to its `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push again, or run the workflow from the **Actions** tab.

The repo name decides the URL:

- A repo named `pv157-drill` is served at `https://whydoihavetothink.github.io/pv157-drill/`.
- A repo named `whydoihavetothink.github.io` is served at the root, `https://whydoihavetothink.github.io/`.

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
