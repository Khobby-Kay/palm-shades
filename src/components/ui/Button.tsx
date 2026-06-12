import { forwardRef, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "dark" | "gold";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

interface LinkButtonProps {
  variant?: Variant;
  size?: Size;
  href: string;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-[0.01em] transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[13px]",
  md: "h-12 px-7 text-sm",
  lg: "h-14 px-9 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white shadow-[0_10px_30px_-12px_rgba(217,112,112,0.45)] hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(217,112,112,0.5)]",
  outline:
    "border border-primary-200 text-primary-700 bg-white/70 backdrop-blur-sm hover:bg-primary-50 hover:border-primary-300",
  ghost:
    "text-charcoal hover:bg-blush-100/70",
  dark:
    "bg-charcoal text-white hover:bg-charcoal-soft hover:-translate-y-0.5 shadow-soft",
  gold:
    "bg-gold text-white hover:bg-gold-dark shadow-soft",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  target,
  rel,
  prefetch,
  onClick,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      prefetch={prefetch ?? true}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </Link>
  );
}
