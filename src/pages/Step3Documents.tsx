import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Dropzone from "../components/Dropzone";
import { mockApi } from "../services/mockApi";
import { UploadCategory, UploadItem, useFlow } from "../store/FlowContext";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const localValidate = (_category: UploadCategory, file: File) => {
  const extension = file.name.toLowerCase();
  const typeAllowed = allowedTypes.includes(file.type);
  const extensionAllowed =
    extension.endsWith(".pdf") || extension.endsWith(".jpg") || extension.endsWith(".jpeg") || extension.endsWith(".png");

  if (!typeAllowed && !extensionAllowed) {
    return { valid: false, message: "El formato no es válido para esta carga." };
  }

  // El resto de validaciones las realiza exclusivamente la Lambda
  return { valid: true };
};

const Step3Documents = () => {
  const { state, dispatch } = useFlow();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.sessionToken || !state.sessionExpiresAt) {
      dispatch({ type: "SET_STEP", payload: 1 });
      navigate("/step1", { replace: true });
      return;
    }
    if (!state.selectedInsuredId) {
      dispatch({ type: "SET_STEP", payload: 2 });
      navigate("/step2", { replace: true });
    }
  }, [dispatch, navigate, state.selectedInsuredId, state.sessionExpiresAt, state.sessionToken]);

  const handleFilesAdded = (category: UploadCategory, fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).map((file) => {
      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: UploadItem = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "validating",
        category
      };
      return { file, item };
    });

    dispatch({ type: "ADD_UPLOADS", payload: { category, items: newFiles.map((entry) => entry.item) } });

    newFiles.forEach(async ({ file, item }) => {
      const localResult = localValidate(category, file);
      try {
        const remoteResult = await mockApi.validateUpload({ category, file });
        if (!localResult.valid) {
          dispatch({
            type: "UPDATE_UPLOAD",
            payload: { category, id: item.id, updates: { status: "invalid", message: localResult.message } }
          });
          return;
        }

        if (!remoteResult.valid) {
          dispatch({
            type: "UPDATE_UPLOAD",
            payload: { category, id: item.id, updates: { status: "invalid", message: remoteResult.message } }
          });
          return;
        }

        dispatch({
          type: "UPDATE_UPLOAD",
          payload: { category, id: item.id, updates: { status: "valid", message: undefined } }
        });
      } catch (error) {
        dispatch({
          type: "UPDATE_UPLOAD",
          payload: {
            category,
            id: item.id,
            updates: { status: "invalid", message: "No pudimos validar este archivo." }
          }
        });
      }
    });
  };

  const handleRemove = (category: UploadCategory, id: string) => {
    dispatch({ type: "REMOVE_UPLOAD", payload: { category, id } });
  };

  const isSubmitDisabled = useMemo(() => {
    const { uploads } = state;
    const hasValidInvoices = uploads.invoices.some((file) => file.status === "valid");
    const hasValidMedical = uploads.medical.some((file) => file.status === "valid");
    const hasInvalid = Object.values(uploads).some((list) => list.some((file) => file.status === "invalid"));
    const hasValidating = Object.values(uploads).some((list) => list.some((file) => file.status === "validating"));
    const hasClaimType = Boolean(state.claimType);

    return !hasValidInvoices || !hasValidMedical || hasInvalid || hasValidating || !hasClaimType;
  }, [state.claimType, state.uploads]);

  const handleSubmit = async () => {
    setSubmitError("");
    if (isSubmitDisabled || isSubmitting) {
      setSubmitError("Completa los documentos requeridos y elimina archivos inválidos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sessionToken: state.sessionToken,
        expiresAt: state.sessionExpiresAt,
        insuredId: state.selectedInsuredId ?? "",
        claimType: state.claimType,
        uploads: {
          invoices: state.uploads.invoices.map((file) => ({ name: file.name, status: file.status })),
          medical: state.uploads.medical.map((file) => ({ name: file.name, status: file.status })),
          evidence: state.uploads.evidence.map((file) => ({ name: file.name, status: file.status }))
        }
      };
      const response = await mockApi.submitClaim(payload);
      dispatch({ type: "SET_CLAIM_NUMBER", payload: response.claimNumber });
      dispatch({ type: "SET_STEP", payload: 4 });
      navigate("/step4");
    } catch (error) {
      dispatch({ type: "CLEAR_SESSION" });
      dispatch({ type: "SET_STEP", payload: 1 });
      navigate("/step1", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="pacifico-title">Paso 3: Solicitud de documentos y validación en línea</h1>
        <p className="mt-2 text-sm text-pacifico-beige">
          Carga los archivos solicitados. Solo aceptamos PDF, JPG o PNG.
        </p>

        <div className="mt-6">
          <label htmlFor="claimType" className="pacifico-label">
            Tipo de siniestro
          </label>
          <select
            id="claimType"
            className="pacifico-input"
            value={state.claimType}
            onChange={(event) => dispatch({ type: "SET_CLAIM_TYPE", payload: event.target.value })}
          >
            <option value="">Selecciona una opción</option>
            <option value="Gastos médicos">Gastos médicos</option>
            <option value="Emergencia">Emergencia</option>
            <option value="Consulta">Consulta</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-6">
        <Dropzone
          title="Facturas"
          required
          category="invoices"
          files={state.uploads.invoices}
          onFilesAdded={handleFilesAdded}
          onRemove={handleRemove}
        />
        <Dropzone
          title="Informe/receta médica"
          required
          category="medical"
          files={state.uploads.medical}
          onFilesAdded={handleFilesAdded}
          onRemove={handleRemove}
        />
        <Dropzone
          title="Evidencia adicional"
          category="evidence"
          files={state.uploads.evidence}
          onFilesAdded={handleFilesAdded}
          onRemove={handleRemove}
        />
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="pacifico-title text-lg">Resumen de validación</h2>
            <p className="text-xs text-pacifico-beige">
              Debes contar con al menos un archivo válido en Facturas y en Informe/receta médica.
            </p>
          </div>
          {/** Botón cambia de estilo según si puede enviar o no */}
          <button
            type="button"
            className={
              isSubmitDisabled || isSubmitting
                ? "inline-flex items-center justify-center rounded-full bg-pacifico-gray px-5 py-2 text-sm font-semibold text-pacifico-beige shadow-pacifico transition cursor-not-allowed"
                : "pacifico-button-primary"
            }
            onClick={handleSubmit}
            disabled={isSubmitDisabled || isSubmitting}
          >
            {isSubmitting
              ? "Enviando..."
              : isSubmitDisabled
                ? "Completa los documentos para continuar"
                : "Enviar preregistro"}
          </button>
        </div>
        {submitError && <p className="mt-3 text-sm text-pacifico-danger">{submitError}</p>}
      </Card>
    </div>
  );
};

export default Step3Documents;
