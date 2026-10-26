import { STATUS_LABEL } from "../lib/progress.js";

const SEGMENTS = [
  ["mastered", "var(--ok)"],
  ["ok", "var(--ok-mid)"],
  ["wrong", "var(--bad)"],
  ["seen", "var(--line-strong)"],
];

// Stacked bar of question statuses; the empty remainder is "not visited".
export default function SegmentBar({ counts, total, className = "bar" }) {
  const label = SEGMENTS.map(([k]) => `${counts[k]} ${STATUS_LABEL[k].toLowerCase()}`).join(", ") + `, ${counts.new} not visited`;
  return (
    <span className={className} role="img" aria-label={label}>
      {SEGMENTS.filter(([k]) => counts[k]).map(([k, color]) => (
        <i key={k} style={{ width: `${(counts[k] / total) * 100}%`, background: color }} title={`${STATUS_LABEL[k]}: ${counts[k]}`} />
      ))}
    </span>
  );
}
