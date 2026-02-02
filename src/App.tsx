import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Stepper from "./components/Stepper";
import Step1Auth from "./pages/Step1Auth";
import Step2Insured from "./pages/Step2Insured";
import Step3Documents from "./pages/Step3Documents";
import Step4Confirm from "./pages/Step4Confirm";
import { useFlow } from "./store/FlowContext";
import { pathToStep, stepToPath } from "./router";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, resetFlow } = useFlow();
  const activeStep = pathToStep(location.pathname);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate(stepToPath(state.currentStep), { replace: true });
      return;
    }

    if (activeStep > state.currentStep) {
      navigate(stepToPath(state.currentStep), { replace: true });
    }
  }, [activeStep, location.pathname, navigate, state.currentStep]);

  const handleReset = () => {
    resetFlow();
    navigate("/step1");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onReset={handleReset} />
      <div className="border-b border-atlas-gray bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Stepper
            activeStep={activeStep}
            maxStep={state.currentStep}
            onStepChange={(step) => navigate(stepToPath(step))}
          />
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/step1" replace />} />
          <Route path="/step1" element={<Step1Auth />} />
          <Route path="/step2" element={<Step2Insured />} />
          <Route path="/step3" element={<Step3Documents />} />
          <Route path="/step4" element={<Step4Confirm />} />
          <Route path="*" element={<Navigate to="/step1" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
