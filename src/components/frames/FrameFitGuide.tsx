import { Ruler, Users } from "lucide-react";
import {
  faceShapeLabels,
  getFrameMetaOrDefault,
} from "@/lib/data/frame-meta";

export function FrameFitGuide({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) {
  if (["accessories", "gift-sets"].includes(categorySlug)) {
    return null;
  }

  const meta = getFrameMetaOrDefault(slug, categorySlug);

  return (
    <div className="rounded-2xl border border-blush-200/70 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-primary-600" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-700">
          Frame fit guide
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Lens", value: `${meta.lensWidthMm} mm` },
          { label: "Bridge", value: `${meta.bridgeMm} mm` },
          { label: "Temple", value: `${meta.templeMm} mm` },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl bg-blush-50/60 px-2 py-3 ring-1 ring-blush-200/50"
          >
            <p className="text-[10px] uppercase tracking-wider text-charcoal-light">
              {m.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-charcoal">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Users className="h-3.5 w-3.5 text-charcoal-light" />
        <span className="text-xs text-charcoal-light">Best for</span>
        {meta.faceShapes.map((shape) => (
          <span
            key={shape}
            className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-800"
          >
            {faceShapeLabels[shape]}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-charcoal-light">{meta.fitNote}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-charcoal-light">
        <span className="rounded-md bg-blush-50 px-2 py-1 ring-1 ring-blush-200/60">
          {meta.uvProtection}
        </span>
        {meta.polarized ? (
          <span className="rounded-md bg-blush-50 px-2 py-1 ring-1 ring-blush-200/60">
            Polarized
          </span>
        ) : null}
        <span className="rounded-md bg-blush-50 px-2 py-1 capitalize ring-1 ring-blush-200/60">
          {meta.frameStyle.replace("-", " ")}
        </span>
      </div>
    </div>
  );
}
