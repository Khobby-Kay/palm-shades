import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { testimonials } from "@/lib/data/testimonials";
import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { buildMetadata, reviewsSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Client Reviews — Palm Shades Accra",
  description:
    "Read reviews from Palm Shades clients in Accra — five-star fittings, curated eyewear, and white-glove boutique experiences.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const dbReviews = hasDatabase()
    ? await prisma.review
        .findMany({
          where: { isVisible: true },
          orderBy: { createdAt: "desc" },
          include: { product: { select: { name: true } } },
        })
        .catch(() => [])
    : [];

  return (
    <>
      <JsonLd data={reviewsSchema(testimonials)} />
      <section className="border-b border-blush-200/60 bg-gradient-luxe py-16 md:py-24">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="The reviews"
              title="Kind words from our clients."
              description="The greatest compliment we receive is when clients return — and bring their friends."
            />
            <div className="flex items-center gap-4 rounded-3xl border border-blush-200 bg-white/80 px-6 py-4 shadow-soft">
              <div className="flex gap-1 text-primary-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div>
                <p className="font-display text-2xl text-charcoal">4.9</p>
                <p className="text-xs text-charcoal-light">Loved by families</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((t) => (
              <ReviewCard
                key={t.id}
                author={t.author}
                role={t.role}
                body={t.body}
                rating={t.rating}
                initials={t.initials}
              />
            ))}
          </div>

          {dbReviews.length > 0 ? (
            <div className="mt-20">
              <h2 className="font-display text-2xl text-charcoal">From our boutique</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {dbReviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    author={r.authorName}
                    role={r.product?.name}
                    body={r.body}
                    rating={r.rating}
                    title={r.title}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-20 text-center">
            <p className="text-charcoal-light">Ready for your own Palm Shades moment?</p>
            <LinkButton href="/book" variant="primary" size="lg" className="mt-6">
              Book an appointment
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}

function ReviewCard({
  author,
  role,
  body,
  rating,
  initials,
  title,
}: {
  author: string;
  role?: string | null;
  body: string;
  rating: number;
  initials?: string;
  title?: string | null;
}) {
  const inits =
    initials ??
    author
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <figure className="relative flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-card ring-1 ring-blush-200/60">
      <Quote className="absolute right-7 top-7 h-7 w-7 text-primary-100" />
      <div className="flex gap-1 text-primary-600">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating ? "fill-current" : "text-primary-200"}`}
          />
        ))}
      </div>
      {title ? <p className="font-display text-lg text-charcoal">{title}</p> : null}
      <blockquote className="flex-1 text-sm leading-relaxed text-charcoal-light">
        &ldquo;{body}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-blush-200/60 pt-5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-50 font-display text-sm text-primary-700">
          {inits}
        </span>
        <div>
          <p className="text-sm font-medium text-charcoal">{author}</p>
          {role ? <p className="text-xs text-charcoal-light">{role}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}
