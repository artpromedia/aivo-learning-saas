"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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

function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className = "", ...props }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
