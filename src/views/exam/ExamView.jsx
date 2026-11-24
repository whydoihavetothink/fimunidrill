import ExamSetup from "./ExamSetup.jsx";
import IsExam from "./IsExam.jsx";

export default function ExamView({ P, exam, setKey, now, actions }) {
  if (!exam) {
    return <ExamSetup P={P} setKey={setKey} onConfig={actions.config} onStart={actions.start} />;
  }
  return <IsExam exam={exam} now={now} actions={actions} />;
}
