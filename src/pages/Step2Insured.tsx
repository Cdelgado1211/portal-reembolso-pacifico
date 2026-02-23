import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { mockApi } from "../services/mockApi";
import { useFlow } from "../store/FlowContext";

type InsuredItem = {
  id: string;
  maskedName: string;
  relationship: string;
  ageRange: string;
};

const Step2Insured = () => {
  const { state, dispatch } = useFlow();
  const navigate = useNavigate();
  const [insuredList, setInsuredList] = useState<InsuredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await mockApi.getInsuredList(state.sessionToken, state.sessionExpiresAt);
        if (active) {
          setInsuredList(data);
          setLoading(false);
        }
      } catch (error) {
        if (!active) return;
        dispatch({ type: "CLEAR_SESSION" });
        dispatch({ type: "SET_STEP", payload: 1 });
        setErrorMessage("Tu sesión expiró. Ingresa nuevamente.");
        setLoading(false);
        navigate("/step1", { replace: true });
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [dispatch, navigate, state.sessionExpiresAt, state.sessionToken]);

  const handleSelect = (insuredId: string) => {
    dispatch({ type: "SET_INSURED", payload: insuredId });
    dispatch({ type: "SET_STEP", payload: 3 });
    navigate("/step3");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="pacifico-title">Paso 2: Selección del asegurado</h1>
        <p className="mt-2 text-sm text-pacifico-beige">
          Tus datos se muestran parcialmente por seguridad.
        </p>

        {errorMessage && <p className="mt-4 text-sm text-pacifico-danger">{errorMessage}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-pacifico-beige">Cargando asegurados...</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {insuredList.map((insured) => (
              <button
                key={insured.id}
                type="button"
                onClick={() => handleSelect(insured.id)}
                className="pacifico-card flex flex-col gap-3 p-5 text-left transition hover:border-pacifico-orange hover:shadow-pacifico"
              >
                <div>
                  <h3 className="text-lg font-semibold text-pacifico-navy">{insured.maskedName}</h3>
                  <p className="text-xs text-pacifico-beige">{insured.relationship}</p>
                </div>
                <span className="text-xs font-semibold text-pacifico-taupe-2">Rango de edad: {insured.ageRange}</span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Step2Insured;
