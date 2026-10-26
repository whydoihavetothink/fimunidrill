export default function FlagButton({ flagged, onToggle }) {
  return (
    <button type="button" className="flagbtn" aria-pressed={flagged} onClick={onToggle} title="Flag for review (F)">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 14.5V2.2M3.5 2.5h8.2l-1.8 3.2 1.8 3.3H3.5" strokeLinejoin="round" />
      </svg>
      {flagged ? "Flagged" : "Flag"}
    </button>
  );
}
