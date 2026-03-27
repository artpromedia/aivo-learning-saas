import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cn.js";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  background?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, children, background, id, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", background, className)}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";

export { Section };
