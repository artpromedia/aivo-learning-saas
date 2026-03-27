import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/cn.js";

const cardVariants = cva("rounded-lg bg-white", {
  variants: {
    variant: {
      default: "shadow-md",
      bordered: "border border-gray-200",
      elevated: "shadow-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-6 py-4", className)} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 border-t border-gray-100", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";

export { Card, cardVariants, CardHeader, CardContent, CardFooter };
