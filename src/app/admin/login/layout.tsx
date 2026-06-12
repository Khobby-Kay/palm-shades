import { Suspense } from 'react';

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
          Loading sign in…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
