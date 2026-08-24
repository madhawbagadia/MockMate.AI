import { useState } from "react";
import Step1SetUp from "../components/Step1Setup";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report
          report={interviewData}
          onRestart={() => {
            setInterviewData(null);
            setStep(1);
          }}
        />
      )}
    </div>
  );
}

export default InterviewPage;