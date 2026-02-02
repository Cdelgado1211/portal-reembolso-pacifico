export type StepConfig = {
  step: number;
  label: string;
  path: string;
};

export const steps: StepConfig[] = [
  { step: 1, label: "Autenticación", path: "/step1" },
  { step: 2, label: "Selección del asegurado", path: "/step2" },
  { step: 3, label: "Solicitud de documentos y validación en línea", path: "/step3" },
  { step: 4, label: "Confirmación", path: "/step4" }
];

export const stepToPath = (step: number) => {
  const match = steps.find((item) => item.step === step);
  return match ? match.path : "/step1";
};

export const pathToStep = (path: string) => {
  const match = steps.find((item) => item.path === path);
  return match ? match.step : 1;
};
