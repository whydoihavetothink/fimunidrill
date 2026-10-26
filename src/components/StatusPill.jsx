import { STATUS_LABEL } from "../lib/progress.js";

export default function StatusPill({ status }) {
  return <span className={`pill s-${status}`}>{STATUS_LABEL[status]}</span>;
}
