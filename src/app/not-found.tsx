import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden py-28 md:py-40">
      <div className="absolute inset-0 -z-10 bg-gradient-luxe" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-radial-blush" />
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="font-display text-display-xl text-primary-600">404</p>
          <h1 className="mt-4 font-display text-display-md text-charcoal">
            This page took the long way home.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-charcoal-light">
            The page you&apos;re looking for can&apos;t be found. Let&apos;s get
            you back to somewhere lovely.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/" size="lg">
              Return Home
            </LinkButton>
            <LinkButton href="/shop" size="lg" variant="outline">
              Visit the Boutique
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
