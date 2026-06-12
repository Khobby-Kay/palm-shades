interface CheckoutStepsProps {
  currentStep: number;
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, title: "Shipping", shortTitle: "Ship", icon: "ri-map-pin-line" },
    { number: 2, title: "Delivery", shortTitle: "Deliver", icon: "ri-truck-line" },
    { number: 3, title: "Payment", shortTitle: "Pay", icon: "ri-bank-card-line" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-0.5 sm:px-0">
      {steps.map((step, index) => (
        <div key={step.number} className="flex min-w-0 flex-1 items-center">
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition-colors sm:h-12 sm:w-12 ${
                currentStep >= step.number
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <i className={`${step.icon} text-lg sm:text-xl`}></i>
            </div>
            <p
              className={`mt-1.5 max-w-full truncate px-0.5 text-center text-[11px] font-semibold sm:mt-2 sm:text-sm ${
                currentStep >= step.number ? "text-primary-700" : "text-gray-500"
              }`}
            >
              <span className="sm:hidden">{step.shortTitle}</span>
              <span className="hidden sm:inline">{step.title}</span>
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-1 h-0.5 min-w-[0.75rem] flex-1 transition-colors sm:mx-3 md:mx-4 ${
                currentStep > step.number ? "bg-primary-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
