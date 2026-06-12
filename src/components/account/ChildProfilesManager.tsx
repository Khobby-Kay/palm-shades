"use client";

import { useState, useTransition } from "react";
import { Users, Pencil, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";

export type ChildRow = {
  id: string;
  name: string;
  age: number | null;
  hairType: string | null;
  allergies: string | null;
  notes: string | null;
};

export function ChildProfilesManager({ initial }: { initial: ChildRow[] }) {
  const [children, setChildren] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChildRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = async () => {
    const res = await fetch("/api/account/children");
    if (res.ok) {
      const data = await res.json();
      setChildren(data.children);
    }
  };

  const onDelete = (id: string) => {
    if (!confirm("Remove this guest profile?")) return;
    startTransition(async () => {
      await fetch(`/api/account/children/${id}`, { method: "DELETE" });
      setChildren((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    startTransition(refresh);
  };

  return (
    <div className="space-y-6">
      {children.length === 0 && !showForm && !editing ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card ring-1 ring-blush-200/60">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush-50 text-primary-700">
            <Users className="h-6 w-6" />
          </span>
          <p className="mt-4 text-charcoal-light">
            Save guest details — yourself, a partner, a parent, anyone — for faster booking next time.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {children.map((c) => (
            <li
              key={c.id}
              className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-blush-200/60 md:p-7"
            >
              {editing?.id === c.id ? (
                <ChildForm
                  initial={c}
                  onCancel={() => setEditing(null)}
                  onSaved={onSaved}
                  isPending={isPending}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl text-charcoal">{c.name}</p>
                    <dl className="mt-3 space-y-1 text-sm text-charcoal-light">
                      {c.age != null ? (
                        <div>
                          <span className="text-charcoal-light/70">Age: </span>
                          {c.age}
                        </div>
                      ) : null}
                      {c.hairType ? (
                        <div>
                          <span className="text-charcoal-light/70">Hair: </span>
                          {c.hairType}
                        </div>
                      ) : null}
                      {c.allergies ? (
                        <div>
                          <span className="text-charcoal-light/70">Allergies: </span>
                          {c.allergies}
                        </div>
                      ) : null}
                      {c.notes ? (
                        <div>
                          <span className="text-charcoal-light/70">Notes: </span>
                          {c.notes}
                        </div>
                      ) : null}
                    </dl>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(c);
                        setShowForm(false);
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full border border-blush-200 text-charcoal-light hover:border-primary-200 hover:text-primary-700"
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      disabled={isPending}
                      className="grid h-10 w-10 place-items-center rounded-full border border-blush-200 text-charcoal-light hover:border-primary-300 hover:text-primary-700"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && !editing ? (
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-blush-200/60 md:p-8">
          <ChildForm onCancel={() => setShowForm(false)} onSaved={onSaved} isPending={isPending} />
        </div>
      ) : null}

      {!showForm && !editing ? (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add a guest profile
        </Button>
      ) : null}
    </div>
  );
}

function ChildForm({
  initial,
  onCancel,
  onSaved,
  isPending,
}: {
  initial?: ChildRow;
  onCancel: () => void;
  onSaved: () => void;
  isPending: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      age: fd.get("age") ? Number(fd.get("age")) : null,
      hairType: String(fd.get("hairType") ?? "") || null,
      allergies: String(fd.get("allergies") ?? "") || null,
      notes: String(fd.get("notes") ?? "") || null,
    };

    startSave(async () => {
      const url = initial
        ? `/api/account/children/${initial.id}`
        : "/api/account/children";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data?.error ?? "Couldn't save profile.");
        return;
      }
      onSaved();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg text-charcoal">
          {initial ? "Edit profile" : "New guest profile"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-9 w-9 place-items-center rounded-full text-charcoal-light hover:bg-blush-50"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          defaultValue={initial?.name}
          required
          error={errors.name}
        />
        <Field
          label="Age"
          name="age"
          type="number"
          min={0}
          max={120}
          defaultValue={initial?.age ?? undefined}
          placeholder="Optional"
        />
        <Field
          containerClassName="sm:col-span-2"
          label="Hair type"
          name="hairType"
          defaultValue={initial?.hairType ?? ""}
          placeholder="e.g. 4C coils, fine curls, relaxed, natural…"
        />
        <Field
          containerClassName="sm:col-span-2"
          label="Allergies"
          name="allergies"
          defaultValue={initial?.allergies ?? ""}
        />
        <TextArea
          containerClassName="sm:col-span-2"
          label="Notes"
          name="notes"
          defaultValue={initial?.notes ?? ""}
        />
      </div>

      {formError ? (
        <p className="text-sm text-primary-700">{formError}</p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={saving || isPending}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
