import ExamResults from "./ExamResults.jsx";
import ExamRunner from "./ExamRunner.jsx";
import ExamSetup from "./ExamSetup.jsx";

export default function ExamView({ P, exam, setKey, now, actions }) {
  if (!exam) {
    return <ExamSetup P={P} setKey={setKey} onConfig={actions.config} onStart={actions.start} />;
  }
  if (exam.done) {
    return <ExamResults exam={exam} onPracticeMistakes={actions.practiceMistakes} onNew={actions.close} />;
  }
  return (
    <ExamRunner
      P={P}
      exam={exam}
      now={now}
      onToggle={actions.toggle}
      onGo={actions.go}
      onSubmit={actions.submit}
      onFlag={actions.flag}
      onQuit={actions.close}
    />
  );
}
