import { LECTURES } from "../lib/bank.js";

// Restricts practice, exams or the browse list to one lecture.
export default function LecturePicker({ id, value, onChange, counts }) {
  return (
    <label className="lecpick" htmlFor={id}>
      <span className="lbl">Lecture</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">All lectures{counts ? ` (${counts.all})` : ""}</option>
        {LECTURES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.id} · {l.name}
            {counts ? ` (${counts[l.id] || 0})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
