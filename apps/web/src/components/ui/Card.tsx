"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colorAccent?: "purple" | "coral" | "teal" | "sunny" | "sky" | "mint" | "pink" | "none";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const accentBorderColors: Record<NonNullable<CardProps["colorAccent"]>, string> = {
  purple: "border-t-4 border-t-[#7C3AED]",
  coral: "border-t-4 border-t-[#FF6B6B]",
  teal: "border-t-4 border-t-[#2DD4BF]",
  sunny: "border-t-4 border-t-[#FBBF24]",
  sky: "border-t-4 border-t-[#38BDF8]",
  mint: "border-t-4 border-t-[#34D399]",
  pink: "border-t-4 border-t-[#F472B6]",
  none: "",
};

function Card({ children, colorAccent = "none", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#2A1E45] border border-[#E8DDF0] dark:border-[#3D2D5C] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-hover)] ${accentBorderColors[colorAccent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-[#E8DDF0] dark:border-[#3D2D5C] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className = "", ...props }: CardBodyProps) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
