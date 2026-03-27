import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cn.js";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  as?: ElementType;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = "Container";

export { Container };
