import { useRef, useState } from "react";
import { pct } from "../../lib/format.js";

function download(P) {
  const blob = new Blob([JSON.stringify(P, null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pv157-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SettingsPanel({ P, session, onToggleCount, onImport, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  async function importFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      setMessage(onImport(JSON.parse(await file.text())));
    } catch {
      setMessage("That file isn't a PV157 Drill progress export.");
    }
  }

  return (
    <section className="panel sidefoot">
      <p className="note">
        This session: <span className="mono">{session.n}</span> answered
        {session.n > 0 && <>, <span className="mono">{pct(session.c / session.n)}</span> right</>}.
      </p>
      <label className="toggle" htmlFor="pref-count">
        <input id="pref-count" type="checkbox" checked={P.prefs.count} onChange={(e) => onToggleCount(e.target.checked)} />
        Show how many answers are correct
      </label>
      <p className="note">Progress is saved in this browser. Export it to keep a backup or move it to another device.</p>
      <div className="row">
        <button type="button" className="btn small" onClick={() => download(P)}>Export progress</button>
        <button type="button" className="btn small" onClick={() => fileRef.current.click()}>Import…</button>
        <input ref={fileRef} id="import-file" type="file" accept="application/json,.json" hidden onChange={importFile} />
      </div>
      {message && <p className="note" role="status">{message}</p>}
      {confirming ? (
        <div className="confirm">
          <span>Erase all answers, flags and exam results in every set? This can't be undone.</span>
          <div className="row">
            <button type="button" className="btn small danger" onClick={() => { setConfirming(false); setMessage(""); onReset(); }}>
              Erase progress
            </button>
            <button type="button" className="btn small" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn small ghost start" onClick={() => setConfirming(true)}>Reset progress…</button>
      )}
    </section>
  );
}
