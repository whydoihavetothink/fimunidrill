import RichText from "./RichText.jsx";

const TAGS = { hit: "Correct", miss: "Missed", bad: "Wrong pick" };

// One answer option. Before grading it shows its keyboard number; after grading,
// `result` is "hit" (picked, right), "miss" (right, not picked), "bad" (picked, wrong) or "idle".
export default function OptionButton({ number, text, pressed, result, disputed, onToggle }) {
  return (
    <button
      type="button"
      className={result ? `opt ${result}` : "opt"}
      aria-pressed={pressed}
      disabled={!!result}
      onClick={onToggle}
    >
      <span className="box" aria-hidden="true" />
      <span className="otext">
        <RichText text={text} />
      </span>
      {result ? (
        <span className="tag">
          {TAGS[result]}
          {disputed && <small>Sets disagree</small>}
        </span>
      ) : (
        <kbd>{number}</kbd>
      )}
    </button>
  );
}
