import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function ContactPhones({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-3", className)}>
      {siteConfig.contact.phones.map((p, i) => (
        <span key={p.tel} className="inline-flex items-center gap-3">
          {i > 0 ? (
            <span className="hidden text-charcoal-light/50 sm:inline" aria-hidden>
              ·
            </span>
          ) : null}
          <a
            href={`tel:${p.tel}`}
            className={cn("hover:text-primary-700", linkClassName)}
          >
            {p.display}
          </a>
        </span>
      ))}
    </span>
  );
}
