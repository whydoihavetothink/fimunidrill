import { useEffect, useRef } from "react";
import { QUESTIONS } from "../../lib/bank.js";
import KeyHints from "../../components/KeyHints.jsx";
import EmptyState from "./EmptyState.jsx";
import QuestionCard from "./QuestionCard.jsx";

export default function PracticeView({ P, practice, setKey, wrongCount, onFlag, onMode, onExam }) {
  const ref = useRef(null);

  // Bring a new question into view when the previous one was scrolled past.
  useEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [practice.cur]);

  return (
    <div className="stack" ref={ref}>
      {practice.cur == null ? (
        <EmptyState mode={P.prefs.mode} wrongCount={wrongCount} onMode={onMode} onExam={onExam} />
      ) : (
        <>
          <QuestionCard P={P} practice={practice} setKey={setKey} onFlag={onFlag} />
          <KeyHints options={QUESTIONS[practice.cur].a.length}>
            <kbd>Enter</kbd> check / next · <kbd>S</kbd> skip · <kbd>F</kbd> flag
          </KeyHints>
        </>
      )}
    </div>
  );
}
