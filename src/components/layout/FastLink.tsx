"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

type FastLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

/** Prefetch on hover/touch/focus so navigation feels instant on tap. */
export function FastLink({ href, children, ...props }: FastLinkProps) {
  const router = useRouter();
  const path = String(href);

  const warm = useCallback(() => {
    router.prefetch(path);
  }, [router, path]);

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
      {...props}
    >
      {children}
    </Link>
  );
}
