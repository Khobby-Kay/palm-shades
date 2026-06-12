import { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { requireUser } from "@/lib/account";

export const dynamic = "force-dynamic";

export default async function AccountDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="border-b border-blush-200/60 bg-gradient-luxe">
      <Container className="py-8 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[240px,1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-blush-200/60 sm:p-4 lg:rounded-3xl">
              <AccountNav userName={user.name} />
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}
