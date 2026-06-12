import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseInput =
  "h-12 w-full rounded-2xl border border-blush-200 bg-white px-4 text-sm text-charcoal placeholder:text-charcoal-light/60 transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/30 disabled:opacity-50";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? `field-${props.name ?? Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal-light"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            baseInput,
            error ? "border-primary-400 focus:border-primary-500 focus:ring-primary-400/30" : "",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-primary-700">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-charcoal-light">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Field.displayName = "Field";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, hint, error, containerClassName, className, id, rows = 3, ...props }, ref) => {
    const inputId = id ?? `field-${props.name ?? Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal-light"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          {...props}
          className={cn(
            "min-h-[96px] w-full rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/60 transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/30",
            error ? "border-primary-400 focus:border-primary-500 focus:ring-primary-400/30" : "",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-primary-700">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-charcoal-light">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
