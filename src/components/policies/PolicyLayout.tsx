import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function PolicyLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-10 md:py-16">
      <h1 className="font-display text-3xl text-charcoal md:text-display-md">
        {title}
      </h1>
      <div className="prose-policy mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-charcoal-light md:text-base">
        {children}
      </div>
    </Container>
  );
}
