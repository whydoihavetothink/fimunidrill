const TEXT = {
  new: ["Every question here has an answer", "You've answered each question in this set at least once. Review your mistakes or let Smart mode bring back the ones you're still learning."],
  mistakes: ["No open mistakes", "Questions you get wrong land here until you answer them right."],
  flagged: ["Nothing flagged yet", "Press F, or use the Flag button on a question, to save it here for later."],
  disputed: ["No disputed keys in this set", "All source sets agree on the answers for these questions."],
};

// Shown when the selected practice mode has no questions left.
export default function EmptyState({ mode, wrongCount, onMode, onExam }) {
  const [title, body] = TEXT[mode] || ["No questions", "This set is empty."];
  return (
    <section className="card empty">
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="row">
        <button type="button" className="btn primary" onClick={() => onMode("smart")}>Smart practice</button>
        {wrongCount > 0 && mode !== "mistakes" && (
          <button type="button" className="btn" onClick={() => onMode("mistakes")}>Mistakes ({wrongCount})</button>
        )}
        <button type="button" className="btn" onClick={onExam}>Take an exam</button>
      </div>
    </section>
  );
}
