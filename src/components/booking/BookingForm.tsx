"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Home,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { TIME_SLOTS } from "@/lib/validators/booking";
import type { BookingLocation } from "@/lib/types/enums";
import { formatPrice, cn } from "@/lib/utils";
import { calculateBookingPrice } from "@/lib/booking/price";
import type { ServiceItem } from "@/lib/data/services";

interface Props {
  service: ServiceItem;
}

export function BookingForm({ service }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [date, setDate] = useState(defaultDateIso());
  const [startTime, setStartTime] = useState("10:00");
  const [location, setLocation] = useState<BookingLocation>("IN_SALON");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dateLabel = useMemo(() => {
    if (!date) return "";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date]);

  const displayPrice = useMemo(
    () => calculateBookingPrice(service.price, location),
    [service.price, location]
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const rawAge = String(fd.get("childAge") ?? "").trim();
    let childAge: number | null = null;
    if (rawAge) {
      const n = Number(rawAge);
      childAge = Number.isFinite(n) ? Math.round(n) : null;
    }

    const payload = {
      serviceSlug: service.slug,
      date,
      startTime,
      location,
      address: location === "HOME_SERVICE" ? String(fd.get("address") ?? "") : null,
      childName: String(fd.get("childName") ?? "") || null,
      childAge,
      childHairType: String(fd.get("childHairType") ?? "") || null,
      childNotes: String(fd.get("childNotes") ?? "") || null,
      guestName: String(fd.get("guestName") ?? ""),
      guestEmail: String(fd.get("guestEmail") ?? ""),
      guestPhone: String(fd.get("guestPhone") ?? ""),
      notes: String(fd.get("notes") ?? "") || null,
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        let data: {
          error?: string;
          fieldErrors?: Record<string, string>;
          redirectUrl?: string;
          bookingId?: string;
        } = {};
        try {
          data = await res.json();
        } catch {
          /* non-JSON response (e.g. 502 HTML) */
        }
        if (!res.ok) {
          if (data?.fieldErrors) {
            setErrors(data.fieldErrors);
            const first = Object.values(data.fieldErrors)[0];
            setFormError(first ?? "Please correct the highlighted fields.");
          } else {
            setFormError(data?.error ?? "Something went wrong. Please try again.");
          }
          return;
        }
        router.push(data.redirectUrl ?? `/book/success/${data.bookingId}`);
      } catch (err) {
        console.error(err);
        setFormError("Could not submit your booking. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {/* Step 1: When */}
      <section className="space-y-5">
        <Heading
          step="1"
          title="Pick a date & time"
          description={`A ${service.durationMin}-minute window will be reserved for you.`}
        />
        <DateTimePicker
          date={date}
          startTime={startTime}
          onDateChange={setDate}
          onTimeChange={setStartTime}
          timeSlots={TIME_SLOTS}
        />
        {(errors.date || errors.startTime) && (
          <p className="text-xs text-primary-700">{errors.date ?? errors.startTime}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-blush-50/70 px-5 py-4 text-sm text-charcoal-light">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary-600" />
            <strong className="font-medium text-charcoal">{service.durationMin} min</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            {location === "HOME_SERVICE" ? (
              <>
                <strong className="font-medium text-charcoal">
                  {formatPrice(displayPrice, { currency: service.currency })}
                </strong>
                <span className="text-charcoal-light">
                  (2× in-boutique · {formatPrice(service.price, { currency: service.currency })})
                </span>
              </>
            ) : (
              <>
                From{" "}
                <strong className="font-medium text-charcoal">
                  {formatPrice(displayPrice, { currency: service.currency })}
                </strong>
              </>
            )}
          </span>
          {date && startTime ? (
            <span>
              You picked <strong className="font-medium text-charcoal">{dateLabel} at {startTime}</strong>
            </span>
          ) : null}
        </div>
      </section>

      {/* Step 2: Location */}
      <section className="space-y-5">
        <Heading
          step="2"
          title="In-boutique or home fitting?"
          description="Pick where you'd like your fitting to take place."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <LocationOption
            id="IN_SALON"
            selected={location === "IN_SALON"}
            onSelect={() => setLocation("IN_SALON")}
            Icon={MapPin}
            title="In-boutique"
            sub="At our Osu boutique on Oxford Street · most popular"
          />
          <LocationOption
            id="HOME_SERVICE"
            selected={location === "HOME_SERVICE"}
            onSelect={() => setLocation("HOME_SERVICE")}
            Icon={Home}
            title="Home fitting"
            sub="We come to you — price is double the in-boutique rate"
          />
        </div>
        {location === "HOME_SERVICE" ? (
          <Field
            label="Home address"
            name="address"
            placeholder="House number, street, neighbourhood"
            error={errors.address}
            required
          />
        ) : null}
      </section>

      {/* Step 3: Guest details (optional) */}
      <section className="space-y-5">
        <Heading
          step="3"
          title="Fitting preferences (optional)"
          description="Help us prepare — share face shape, prescription, or style references."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guest name" name="childName" placeholder="Who is this fitting for?" />
          <Field
            label="Age"
            name="childAge"
            type="number"
            min={0}
            max={120}
            placeholder="Optional"
            error={errors.childAge}
          />
          <Field
            containerClassName="sm:col-span-2"
            label="Face shape or frame preference"
            name="childHairType"
            placeholder="e.g. oval face, round frames, cat-eye, aviator, prescription needed…"
          />
          <TextArea
            containerClassName="sm:col-span-2"
            label="Anything we should know?"
            name="childNotes"
            placeholder="Prescription details, lens preferences, occasion, special requests…"
          />
        </div>
      </section>

      {/* Step 4: Contact */}
      <section className="space-y-5">
        <Heading
          step="4"
          title="Your details"
          description="So we can confirm and stay in touch about the appointment."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            name="guestName"
            placeholder="Akosua Mensah"
            defaultValue={user?.name ?? undefined}
            error={errors.guestName}
            required
          />
          <Field
            label="Phone"
            name="guestPhone"
            type="tel"
            placeholder="024 214 9489"
            error={errors.guestPhone}
            required
          />
          <Field
            containerClassName="sm:col-span-2"
            label="Email"
            name="guestEmail"
            type="email"
            placeholder="you@example.com"
            defaultValue={user?.email ?? undefined}
            error={errors.guestEmail}
            required
          />
          <TextArea
            containerClassName="sm:col-span-2"
            label="Special requests"
            name="notes"
            placeholder="Occasion, preferred frame style, anything else?"
          />
        </div>
      </section>

      {formError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 text-sm text-primary-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{formError}</p>
        </div>
      ) : null}

      <div className="space-y-3 lg:pb-0">
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-200/90 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              "Reserving your fitting…"
            ) : (
              <>
                Confirm fitting
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        <p className="hidden text-center text-[11px] uppercase tracking-[0.22em] text-charcoal-light lg:block">
          Card is collected on the day · cancel anytime 24h ahead
        </p>
        <p className="pb-24 text-center text-[10px] uppercase tracking-[0.2em] text-charcoal-light lg:hidden">
          Cancel free up to 24h before
        </p>
      </div>
    </form>
  );
}

function defaultDateIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Heading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 font-display text-sm font-medium text-primary-700 ring-1 ring-primary-100 sm:h-9 sm:w-9 sm:text-base">
        {step}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-xl text-charcoal sm:text-2xl">{title}</h2>
        <p className="mt-0.5 text-sm text-charcoal-light">{description}</p>
      </div>
    </div>
  );
}

function LocationOption({
  selected,
  onSelect,
  Icon,
  title,
  sub,
}: {
  id: BookingLocation;
  selected: boolean;
  onSelect: () => void;
  Icon: typeof Clock;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-4 rounded-3xl border bg-white p-5 text-left transition-all",
        selected
          ? "border-primary-300 shadow-[0_18px_40px_-22px_rgba(190,24,93,0.5)] ring-1 ring-primary-300"
          : "border-blush-200 hover:border-primary-200"
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
          selected ? "bg-primary-600 text-white" : "bg-blush-50 text-primary-700"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-medium text-charcoal">{title}</p>
        <p className="mt-1 text-sm text-charcoal-light">{sub}</p>
      </div>
    </button>
  );
}
