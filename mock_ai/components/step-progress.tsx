"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Step } from "@stepperize/react";

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  hasUploaded?: boolean;
}

export default function StepProgress({
  steps,
  currentStep,
  hasUploaded,
}: StepProgressProps) {
  return (
    <div className="w-full md:px-4 py-4 my-4 mt-10 md:mt-16 rounded-md">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute left-0 top-[22px] h-[2px] w-full bg-[#1a1b4b]" />

        {/* Active progress bar */}
        <div
          className="absolute left-0 top-[22px] h-[2px] bg-gradient-to-r from-[#7fceff] to-[#ff6db3] transition-all duration-500 ease-in-out"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;
            const isFinished = currentStep === steps.length - 1;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500",
                    isCompleted
                      ? "border-[#7fceff] bg-[#7fceff]"
                      : isCurrent
                      ? "border-[#ff6db3] bg-[#ff6db3]"
                      : "border-[#1a1b4b] bg-[#0a0b24]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-[#050614]" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent
                          ? "text-[#050614]"
                          : "text-[#7fceff]"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <div className="absolute -inset-1 animate-pulse rounded-full border-2 border-[#ff6db3] opacity-70" />
                  )}
                </div>

                {/* Step title */}
                <div className="mt-3 mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                      isCurrent
                        ? "text-[#ff6db3]"
                        : isCompleted
                        ? "text-[#7fceff]"
                        : "text-[#f0f0f0]"
                    )}
                  >
                    {isFinished && step.id === "start interview"
                      ? step.message
                      : step.label}
                  </span>
                </div>

                {/* Step description */}
                <span className="text-center text-xs text-[#a3a8c3] max-w-[120px]">
                  {hasUploaded && isCurrent
                    ? "Uploading..."
                    : step.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Example usage
/// ------------------------------//

// export function Example() {
//   const [currentStep, setCurrentStep] = useState(0);

//   return (
//     <div className="min-h-screen bg-[#050614] p-8">
//       <StepProgress steps={steps} currentStep={currentStep} />

//       <div className="flex justify-center gap-4 mt-8">
//         <button
//           onClick={() =>
//             setCurrentStep((prev) => Math.max(0, prev - 1))
//           }
//           className="px-4 py-2 text-white bg-[#1a1b4b] rounded-md hover:bg-[#2a2b5b] transition-colors"
//           disabled={currentStep === 0}
//         >
//           Previous
//         </button>
//         <button
//           onClick={() =>
//             setCurrentStep((prev) =>
//               Math.min(steps.length - 1, prev + 1)
//             )
//           }
//           className="px-4 py-2 bg-[#7fceff] text-[#050614] rounded-md hover:bg-[#7fceff]/90 transition-colors"
//           disabled={currentStep === steps.length - 1}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
