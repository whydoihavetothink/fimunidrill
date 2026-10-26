import ModePicker from "./ModePicker.jsx";
import ProgressSummary from "./ProgressSummary.jsx";
import QuestionMap from "./QuestionMap.jsx";
import SettingsPanel from "./SettingsPanel.jsx";

export default function Sidebar({ P, setKey, counts, current, session, onMode, onOpen, onToggleCount, onImport, onReset }) {
  return (
    <aside className="side">
      <ProgressSummary setKey={setKey} counts={counts} />
      <ModePicker mode={P.prefs.mode} counts={counts} onMode={onMode} />
      <QuestionMap P={P} setKey={setKey} current={current} onOpen={onOpen} />
      <SettingsPanel P={P} session={session} onToggleCount={onToggleCount} onImport={onImport} onReset={onReset} />
    </aside>
  );
}
