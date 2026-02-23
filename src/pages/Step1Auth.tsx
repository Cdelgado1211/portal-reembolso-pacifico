import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { mockApi } from "../services/mockApi";
import { useFlow } from "../store/FlowContext";

const Step1Auth = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useFlow();
  const [policyNumber, setPolicyNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ policyNumber?: string; dateOfBirth?: string; captcha?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = useMemo(() => {
    if (!state.lockUntil) return false;
    return Date.now() < state.lockUntil;
  }, [state.lockUntil]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLocked || isSubmitting) return;

    const nextErrors: typeof fieldErrors = {};
    if (!policyNumber.trim()) {
      nextErrors.policyNumber = "Ingresa tu número de póliza.";
    }
    if (!dateOfBirth) {
      nextErrors.dateOfBirth = "Selecciona tu fecha de nacimiento.";
    }
    if (!captchaChecked) {
      nextErrors.captcha = "Confirma el captcha para continuar.";
    }
    setFieldErrors(nextErrors);
    setErrorMessage("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const response = await mockApi.authenticate(policyNumber.trim(), dateOfBirth, captchaChecked);
    if (response.success) {
      dispatch({ type: "SET_SESSION", payload: { token: response.sessionToken, expiresAt: response.expiresAt } });
      dispatch({ type: "SET_STEP", payload: 2 });
      dispatch({ type: "SET_ATTEMPT_COUNT", payload: 0 });
      dispatch({ type: "SET_LOCK_UNTIL", payload: null });
      setIsSubmitting(false);
      navigate("/step2");
      return;
    }

    const nextAttempt = state.attemptCount + 1;
    dispatch({ type: "SET_ATTEMPT_COUNT", payload: nextAttempt });
    if (nextAttempt >= 3) {
      dispatch({ type: "SET_LOCK_UNTIL", payload: Date.now() + 24 * 60 * 60 * 1000 });
    }
    setErrorMessage("No pudimos verificar la información. Por favor intenta de nuevo.");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="mx-auto max-w-md p-6">
        <h1 className="pacifico-title">Paso 1: Autenticación</h1>
        <p className="mt-2 text-sm text-pacifico-beige">
          Ingresa tu información para continuar con la validación de documentos.
        </p>

        {isLocked && (
          <div className="mt-4 rounded-lg border border-pacifico-gray bg-[rgba(201,198,194,0.3)] px-4 py-3 text-sm text-pacifico-taupe-2">
            Demasiados intentos. Intenta de nuevo más tarde.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="pacifico-label" htmlFor="policyNumber">
              Número de póliza
            </label>
            <input
              id="policyNumber"
              type="text"
              className="pacifico-input"
              value={policyNumber}
              onChange={(event) => setPolicyNumber(event.target.value)}
              disabled={isLocked || isSubmitting}
            />
            {fieldErrors.policyNumber && (
              <p className="mt-1 text-xs text-pacifico-danger">{fieldErrors.policyNumber}</p>
            )}
          </div>

          <div>
            <label className="pacifico-label" htmlFor="dateOfBirth">
              Fecha de nacimiento
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className="pacifico-input"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              disabled={isLocked || isSubmitting}
            />
            {fieldErrors.dateOfBirth && (
              <p className="mt-1 text-xs text-pacifico-danger">{fieldErrors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-pacifico-taupe-2">
              <input
                type="checkbox"
                checked={captchaChecked}
                onChange={(event) => setCaptchaChecked(event.target.checked)}
                disabled={isLocked || isSubmitting}
                className="h-4 w-4 rounded border-pacifico-gray text-pacifico-orange focus:ring-pacifico-orange"
              />
              No soy un robot
            </label>
            {fieldErrors.captcha && (
              <p className="mt-1 text-xs text-pacifico-danger">{fieldErrors.captcha}</p>
            )}
          </div>

          {errorMessage && <p className="text-sm text-pacifico-danger">{errorMessage}</p>}

          <button
            type="submit"
            className="pacifico-button-primary"
            disabled={isLocked || isSubmitting}
          >
            {isSubmitting ? "Validando..." : "Continuar"}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Step1Auth;
