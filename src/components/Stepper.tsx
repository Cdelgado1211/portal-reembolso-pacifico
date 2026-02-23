import { steps } from "../router";

type StepperProps = {
  activeStep: number;
  maxStep: number;
  onStepChange: (step: number) => void;
};

const Stepper = ({ activeStep, maxStep, onStepChange }: StepperProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 items-start gap-2">
        {steps.map((item, index) => {
          const isReached = item.step <= maxStep;
          const isActive = item.step === activeStep;
          const isClickable = item.step <= maxStep;
          const leftComplete = isReached;
          const rightComplete = steps[index + 1]?.step <= maxStep;

          return (
            <div key={item.step} className="flex flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`h-px flex-1 ${index === 0 ? "bg-transparent" : leftComplete ? "bg-pacifico-orange" : "bg-pacifico-gray"}`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => isClickable && onStepChange(item.step)}
                  disabled={!isClickable}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                    isReached
                      ? "border-pacifico-orange bg-pacifico-orange text-white"
                      : "border-pacifico-gray bg-white text-pacifico-taupe"
                  } ${isActive ? "ring-2 ring-[rgba(246,162,52,0.4)]" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {item.step}
                </button>
                <div
                  className={`h-px flex-1 ${index === steps.length - 1 ? "bg-transparent" : rightComplete ? "bg-pacifico-orange" : "bg-pacifico-gray"}`}
                  aria-hidden="true"
                />
              </div>
              <div
                title={item.label}
                className={`mt-2 w-full truncate text-center text-[11px] font-semibold ${
                  isReached ? "text-pacifico-taupe-2" : "text-pacifico-gray"
                }`}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-pacifico-beige">
        Avanza paso a paso. Solo puedes regresar a pasos ya completados.
      </p>
    </div>
  );
};

export default Stepper;
