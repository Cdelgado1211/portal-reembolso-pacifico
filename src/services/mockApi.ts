import { UploadCategory } from "../store/FlowContext";

type AuthResponse =
  | { success: true; sessionToken: string; expiresAt: number }
  | { success: false };

type InsuredItem = {
  id: string;
  maskedName: string;
  relationship: string;
  ageRange: string;
};

type UploadValidation = {
  valid: boolean;
  message?: string;
};

type SubmitResponse = {
  claimNumber: string;
};

const VALIDATION_LAMBDA_URL =
  "https://wdnw5lmd7zejs7o4d5kj22idmm0jdeff.lambda-url.us-east-1.on.aws/";

const delay = (minMs = 600, maxMs = 1200) => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const isTokenValid = (token?: string | null, expiresAt?: number | null) => {
  if (!token || !expiresAt) return false;
  return Date.now() < expiresAt;
};

const createToken = () => {
  return `atlas-${Math.random().toString(36).slice(2, 10)}`;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

const validateRules = (category: UploadCategory, file: File): UploadValidation => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: "El formato no es válido para esta carga." };
  }
  return { valid: true };
};

export const mockApi = {
  async authenticate(policyNumber: string, dob: string, captchaChecked: boolean): Promise<AuthResponse> {
    await delay();
    if (!captchaChecked) {
      return { success: false };
    }

    if (policyNumber === "POL-12345" && dob === "1989-05-10") {
      const expiresAt = Date.now() + 15 * 60 * 1000;
      return { success: true, sessionToken: createToken(), expiresAt };
    }

    return { success: false };
  },

  async getInsuredList(sessionToken: string | null, expiresAt: number | null): Promise<InsuredItem[]> {
    await delay();
    if (!isTokenValid(sessionToken, expiresAt)) {
      throw new Error("SESSION_EXPIRED");
    }

    return [
      { id: "ins-1", maskedName: "Ma*** U***a", relationship: "Titular", ageRange: "30–39" },
      { id: "ins-2", maskedName: "Lu*** U***a", relationship: "Dependiente", ageRange: "10–19" },
      { id: "ins-3", maskedName: "An*** G***a", relationship: "Dependiente", ageRange: "20–29" },
      { id: "ins-4", maskedName: "Jo*** M***a", relationship: "Dependiente", ageRange: "40–49" }
    ];
  },

  async validateUpload(input: { category: UploadCategory; file: File }): Promise<UploadValidation> {
    const { category, file } = input;

    // Validaciones rápidas locales (tipo y tamaño mínimo) antes de llamar a la IA
    const quickValidation = validateRules(category, file);
    if (!quickValidation.valid) {
      return quickValidation;
    }

    try {
      const fileBase64 = await fileToBase64(file);

      const response = await fetch(VALIDATION_LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_base64: fileBase64,
          filename: file.name,
          category
        })
      });

      if (!response.ok) {
        throw new Error(`Lambda validation failed with status ${response.status}`);
      }

      const data = (await response.json()) as UploadValidation;

      return {
        valid: Boolean(data.valid),
        message:
          data.message ??
          (data.valid
            ? undefined
            : "El documento no cumple con las reglas de validación automática.")
      };
    } catch (error) {
      // Fallback defensivo: tratamos el archivo como inválido si falla la validación remota
      console.error("Error validating upload via Lambda:", error);
      return {
        valid: false,
        message: "No pudimos validar este archivo en este momento. Intenta de nuevo más tarde."
      };
    }
  },

  async submitClaim(payload: {
    sessionToken: string | null;
    expiresAt: number | null;
    insuredId: string;
    claimType: string;
    uploads: Record<UploadCategory, { name: string; status: string }[]>;
  }): Promise<SubmitResponse> {
    await delay();
    if (!isTokenValid(payload.sessionToken, payload.expiresAt)) {
      throw new Error("SESSION_EXPIRED");
    }

    const sequence = Math.floor(Math.random() * 1000000);
    const padded = String(sequence).padStart(6, "0");
    return { claimNumber: `AT-2026-${padded}` };
  }
};
