export const MODES = {
  smart: {
    label: "Smart",
    desc: "Mixes new questions with your mistakes and the ones you are still learning. Three right answers in a row marks a question as mastered.",
  },
  new: { label: "New", desc: "Only questions you have never answered." },
  mistakes: { label: "Mistakes", desc: "Questions whose last answer was wrong. Answer one right to clear it." },
  flagged: { label: "Flagged", desc: "Questions you flagged for review. Press F on any question to flag it." },
  disputed: { label: "Disputed", desc: "Questions where the source sets disagree on which answers are correct." },
  order: { label: "In order", desc: "Every question in the order of the original set." },
};
