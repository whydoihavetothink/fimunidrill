import { SETS } from "../lib/bank.js";

// Which source sets contain a question, e.g. "All · Mid · 2011".
export default function SetsLabel({ question }) {
  const names = SETS.filter((s) => question.k[s.key] != null).map((s) => s.short);
  return (
    <span className="insets" title="Sets containing this question">
      {names.join(" · ")}
    </span>
  );
}
