import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import useKeydown, { isOtherButton } from "./hooks/useKeydown.js";
import useNow from "./hooks/useNow.js";
import usePractice from "./hooks/usePractice.js";
import useStoredState from "./hooks/useStoredState.js";
import { POSITION, SET_LISTS } from "./lib/bank.js";
import { createExam, gradeExam, timeLeft, validateExam } from "./lib/exam.js";
import { blankProgress, countStatuses, mergeProgress, normalizeProgress, toggleFlag } from "./lib/progress.js";
import BrowseView from "./views/browse/BrowseView.jsx";
import ExamView from "./views/exam/ExamView.jsx";
import PracticeView from "./views/practice/PracticeView.jsx";
import Sidebar from "./views/practice/Sidebar.jsx";

const PROGRESS_KEY = "pv157drill:v1";
const EXAM_KEY = "pv157drill:exam";

export default function App() {
  const [P, setP] = useStoredState(PROGRESS_KEY, blankProgress, normalizeProgress);
  const [exam, setExam] = useStoredState(EXAM_KEY, null, validateExam);
  const [view, setView] = useState(() => (exam && !exam.done ? "exam" : "practice"));
  const [browse, setBrowse] = useState({ q: "", f: "all", lec: "all", answers: true });
  const practice = usePractice(P, setP);
  const examRunning = !!exam && !exam.done;
  const now = useNow(1000, examRunning);
  const graded = useRef(null);

  const setKey = P.prefs.set;
  const counts = countStatuses(P, SET_LISTS[setKey]);
  const setPrefs = (patch) => setP((p) => ({ ...p, prefs: { ...p.prefs, ...patch } }));
  const flag = (qi) => setP((p) => toggleFlag(p, qi));

  // Pick the first question on load.
  useEffect(() => {
    if (view === "practice") practice.next();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- navigation -----
  function chooseView(v) {
    setView(v);
    if (v === "practice" && (practice.cur == null || !POSITION[setKey].has(practice.cur))) practice.next();
  }

  function chooseSet(k) {
    if (k === setKey) return;
    setPrefs({ set: k });
    if (view === "practice") practice.next({ setKey: k });
    else practice.clear();
  }

  function chooseMode(m) {
    setPrefs({ mode: m });
    setView("practice");
    practice.next({ mode: m });
  }

  function chooseLecture(lec) {
    setPrefs({ lec });
    setView("practice");
    practice.next({ lec });
  }

  function openQuestion(qi) {
    setView("practice");
    practice.open(qi);
  }

  // ----- progress settings -----
  function importProgress(raw) {
    const incoming = normalizeProgress(raw);
    const n = Object.keys(incoming.q).length;
    if (!n && !incoming.exams.length) throw new Error("no progress in file");
    setP((p) => mergeProgress(p, incoming));
    return `Imported progress for ${n} questions.`;
  }

  function resetProgress() {
    const fresh = { ...blankProgress(), prefs: { ...P.prefs, cur: {} } };
    setP(fresh);
    practice.reset();
    practice.next({ progress: fresh });
  }

  // ----- exam -----
  function submitExam(expired = false) {
    if (!examRunning || graded.current === exam.start) return;
    graded.current = exam.start;
    const result = gradeExam(P, exam, Date.now(), expired);
    setP(result.progress);
    setExam(result.exam);
    window.scrollTo({ top: 0 });
  }

  const examActions = {
    config: (patch) => setPrefs({ exam: { ...P.prefs.exam, ...patch } }),
    start: () => {
      setExam(createExam(P, setKey, P.prefs.exam));
      window.scrollTo({ top: 0 });
    },
    // Tick or untick option j (original index) of question k.
    check: (k, j, on) =>
      setExam((ex) => {
        if (!ex || ex.done) return ex;
        const cur = ex.sel[k].filter((x) => x !== j);
        const picked = on ? [...cur, j].sort((a, b) => a - b) : cur;
        return { ...ex, idx: k, sel: ex.sel.map((s, n) => (n === k ? picked : s)) };
      }),
    submit: () => submitExam(false),
    // Leave a running test without handing it in; the Exam tab brings it back.
    leave: () => chooseView("practice"),
    restart: () => {
      setExam(createExam(P, exam ? exam.set : setKey, { ...P.prefs.exam, lec: exam?.lec ?? P.prefs.exam.lec }));
      window.scrollTo({ top: 0 });
    },
    close: () => {
      setExam(null);
      chooseView("practice");
    },
    practiceMistakes: () => {
      const s = exam.set;
      setExam(null);
      setPrefs({ set: s, mode: "mistakes", lec: "all" });
      setView("practice");
      practice.next({ setKey: s, mode: "mistakes", lec: "all" });
    },
  };

  // Hand the paper in when the time limit runs out (also right after reloading).
  useEffect(() => {
    if (examRunning && exam.limit && timeLeft(exam, now) <= 0) submitExam(true);
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- keyboard -----
  useKeydown((e) => {
    const k = e.key.toLowerCase();
    if (view === "practice" && practice.cur != null) {
      if (/^[1-9]$/.test(k)) { e.preventDefault(); practice.toggle(+k - 1); }
      else if (k === "enter") {
        if (isOtherButton(e)) return;
        e.preventDefault();
        if (practice.checked) practice.next();
        else practice.check();
      }
      else if (k === "f") { e.preventDefault(); flag(practice.cur); }
      else if (k === "s" && !practice.checked) { e.preventDefault(); practice.next(); }
    }
  });

  const lockSets = view === "exam" && examRunning;

  // A test in progress or under review takes the whole page, like the IS odpovědník.
  if (view === "exam" && exam) {
    return <ExamView P={P} exam={exam} setKey={setKey} now={now} actions={examActions} />;
  }

  return (
    <div className="app">
      <Header
        P={P}
        activeSet={lockSets ? exam.set : setKey}
        setsLocked={lockSets}
        view={view}
        onSet={chooseSet}
        onView={chooseView}
      />

      {view === "practice" ? (
        <div className="layout">
          <main className="main">
            <PracticeView
              P={P}
              practice={practice}
              setKey={setKey}
              wrongCount={counts.wrong}
              onFlag={flag}
              onMode={chooseMode}
              onExam={() => chooseView("exam")}
            />
          </main>
          <Sidebar
            P={P}
            setKey={setKey}
            counts={counts}
            current={practice.cur}
            session={practice.session}
            onMode={chooseMode}
            onLecture={chooseLecture}
            onOpen={openQuestion}
            onToggleCount={(on) => setPrefs({ count: on })}
            onImport={importProgress}
            onReset={resetProgress}
          />
        </div>
      ) : (
        <div className="layout single">
          <main className="main">
            {view === "exam" ? (
              <ExamView P={P} exam={exam} setKey={setKey} now={now} actions={examActions} />
            ) : (
              <BrowseView
                P={P}
                setKey={setKey}
                browse={browse}
                onChange={(patch) => setBrowse((b) => ({ ...b, ...patch }))}
                onOpen={openQuestion}
              />
            )}
          </main>
        </div>
      )}

      <footer className="foot">
        Questions from the PV157 All, Midterm and Midterm 2011 sets of{" "}
        <a href="https://fimudrill.github.io/fi-muni-drill/">FI MUNI Drill</a>. Duplicates are merged, so progress on a
        question counts in every set that contains it. Explanations and the “slide key” are checked against the 2026
        lecture slides (L02–L10); 78 extra questions were written from those slides.
      </footer>
    </div>
  );
}
