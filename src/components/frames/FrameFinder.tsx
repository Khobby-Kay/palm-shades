"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Container } from "@/components/ui/Container";
import { products } from "@/lib/data/products";
import {
  faceShapeLabels,
  frameUseLabels,
  type FaceShape,
  type FrameUse,
} from "@/lib/data/frame-meta";
import {
  scoreProductsForFinder,
  type FinderAnswers,
  type FinderPriority,
} from "@/lib/frame-finder";
import { getProductImage } from "@/lib/media";
import { formatPrice, cn } from "@/lib/utils";

const FACE_SHAPES: FaceShape[] = ["oval", "round", "square", "heart", "oblong"];
const USES: FrameUse[] = ["sun", "optical", "work", "events", "sport", "travel"];
const PRIORITIES: { id: FinderPriority; label: string; hint: string }[] = [
  { id: "style", label: "Statement style", hint: "Standout silhouettes & bestsellers" },
  { id: "uv", label: "Sun protection", hint: "Polarized & UV400 for Accra" },
  { id: "comfort", label: "All-day comfort", hint: "Lightweight, easy temple fit" },
  { id: "value", label: "Smart value", hint: "Sale picks & everyday price" },
];

type Step = 0 | 1 | 2 | 3;

export function FrameFinder({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Partial<FinderAnswers>>({});

  const matches = useMemo(() => {
    if (step < 3 || !answers.faceShape || !answers.primaryUse || !answers.priority) {
      return [];
    }
    return scoreProductsForFinder(products, answers as FinderAnswers, 6);
  }, [step, answers]);

  const shell = embedded ? "div" : "section";

  return (
    <Container as={shell} className={embedded ? "" : "py-16 md:py-24"}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
          Palm Shades exclusive
        </p>
        <h2 className="mt-3 font-display text-3xl text-charcoal md:text-4xl">
          Frame Finder
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-light md:text-base">
          Three quick choices — face shape, lifestyle, and priority — and we surface frames
          curated for how you actually live in Accra.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-12 rounded-full transition-colors",
                step > i ? "bg-primary-600" : "bg-blush-200"
              )}
            />
          ))}
        </div>

        {step === 0 ? (
          <StepPanel title="What's your face shape?">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FACE_SHAPES.map((shape) => (
                <ChoiceButton
                  key={shape}
                  label={faceShapeLabels[shape]}
                  active={answers.faceShape === shape}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, faceShape: shape }));
                    setStep(1);
                  }}
                />
              ))}
            </div>
          </StepPanel>
        ) : null}

        {step === 1 ? (
          <StepPanel title="What will you wear them for?">
            <div className="grid grid-cols-2 gap-3">
              {USES.map((use) => (
                <ChoiceButton
                  key={use}
                  label={frameUseLabels[use]}
                  active={answers.primaryUse === use}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, primaryUse: use }));
                    setStep(2);
                  }}
                />
              ))}
            </div>
            <BackButton onClick={() => setStep(0)} />
          </StepPanel>
        ) : null}

        {step === 2 ? (
          <StepPanel title="What matters most?">
            <div className="grid gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, priority: p.id }));
                    setStep(3);
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all hover:border-primary-300 hover:bg-blush-50/50",
                    answers.priority === p.id
                      ? "border-primary-500 bg-primary-50/60 ring-1 ring-primary-200"
                      : "border-blush-200 bg-white"
                  )}
                >
                  <p className="font-medium text-charcoal">{p.label}</p>
                  <p className="mt-1 text-xs text-charcoal-light">{p.hint}</p>
                </button>
              ))}
            </div>
            <BackButton onClick={() => setStep(1)} />
          </StepPanel>
        ) : null}

        {step === 3 ? (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="font-display text-xl text-charcoal">Your curated matches</p>
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                }}
                className="text-xs font-medium uppercase tracking-wider text-primary-700 hover:text-primary-800"
              >
                Start over
              </button>
            </div>

            {matches.length === 0 ? (
              <p className="rounded-2xl bg-blush-50 p-6 text-center text-sm text-charcoal-light">
                No exact matches —{" "}
                <Link href="/shop" className="font-medium text-primary-700 hover:underline">
                  browse all eyewear
                </Link>{" "}
                or{" "}
                <Link href="/book" className="font-medium text-primary-700 hover:underline">
                  book a fitting
                </Link>
                .
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {matches.map(({ product, reasons }) => {
                  const imageUrl =
                    product.imageUrl ?? getProductImage(product.slug);
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="group flex gap-4 rounded-2xl border border-blush-200/70 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] p-2">
                          <SmartImage
                            src={imageUrl}
                            alt={product.name}
                            fit="contain"
                            variant="ivory"
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-charcoal group-hover:text-primary-800">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm text-charcoal-light">
                            {formatPrice(product.price, {
                              currency: product.currency,
                            })}
                          </p>
                          <ul className="mt-2 space-y-0.5">
                            {reasons.map((r) => (
                              <li
                                key={r}
                                className="flex items-center gap-1 text-[10px] text-primary-700"
                              >
                                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white hover:bg-charcoal-soft"
              >
                Book a fitting <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                View full shop
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

function StepPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-blush-200/70 bg-white p-6 shadow-card sm:p-8">
      <p className="text-center font-display text-xl text-charcoal">{title}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-4 text-sm font-medium transition-all",
        active
          ? "border-primary-500 bg-primary-50 text-primary-800"
          : "border-blush-200 bg-white text-charcoal hover:border-primary-200 hover:bg-blush-50/40"
      )}
    >
      {label}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full text-center text-xs font-medium uppercase tracking-wider text-charcoal-light hover:text-charcoal"
    >
      ← Back
    </button>
  );
}
