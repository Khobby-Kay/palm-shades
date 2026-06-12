"use client";

type Props = {
  message: string;
  onRetry: () => void;
};

export function AdminConnectionError({ message, onRetry }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <i className="ri-wifi-off-line text-4xl text-amber-600 mb-4 block" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Cannot reach admin
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Try again
        </button>
        <p className="mt-6 text-xs text-gray-500">
          Local dev: run{" "}
          <code className="bg-gray-100 px-1 rounded">npm run dev</code>, then open{" "}
          <a href="/admin/login" className="text-blue-700 underline">
            /admin/login
          </a>{" "}
          in a normal browser tab (not an installed app shortcut).
        </p>
      </div>
    </div>
  );
}
