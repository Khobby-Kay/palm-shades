export function WelcomeOfferBanner() {
  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-center text-sm text-charcoal sm:mb-8 sm:px-6 sm:py-4"
    >
      <strong className="font-semibold text-primary-800">Welcome offer:</strong>{" "}
      15% off your first visit — mention{" "}
      <span className="font-medium text-charcoal">WELCOME15</span> when you book.
    </div>
  );
}
