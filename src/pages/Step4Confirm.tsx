import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useFlow } from "../store/FlowContext";

const Step4Confirm = () => {
  const { state, resetFlow, dispatch } = useFlow();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.claimNumber) {
      dispatch({ type: "SET_STEP", payload: 3 });
      navigate("/step3", { replace: true });
    }
  }, [dispatch, navigate, state.claimNumber]);

  const handleNew = () => {
    resetFlow();
    navigate("/step1");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="atlas-title">Confirmación</h1>
        <div className="mt-4 rounded-lg border border-atlas-gray bg-white px-4 py-4">
          <p className="text-sm text-atlas-taupe-2">Número de registro:</p>
          <p className="mt-1 text-lg font-semibold text-atlas-navy">{state.claimNumber}</p>
          <p className="mt-3 text-sm text-atlas-beige">Te enviamos una confirmación por email.</p>
        </div>
        <button type="button" className="atlas-button-primary mt-6" onClick={handleNew}>
          Iniciar nuevo registro
        </button>
      </Card>
    </div>
  );
};

export default Step4Confirm;
