"use client";

import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof HomeSectionHeader>;

/** Section header with scroll fade-up. */
export function HomeAnimatedHeader(props: Props) {
  return (
    <ScrollReveal>
      <HomeSectionHeader {...props} ctaStyle={props.ctaStyle ?? "link"} />
    </ScrollReveal>
  );
}
