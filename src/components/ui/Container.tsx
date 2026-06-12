import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  as: Component = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component className={cn("container mx-auto", className)}>
      {children}
    </Component>
  );
}
