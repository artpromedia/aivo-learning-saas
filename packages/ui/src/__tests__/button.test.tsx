import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Button } from "../button.js";

afterEach(cleanup);

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bg-purple-600");
  });

  it("renders primary variant", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button", { name: "Primary" });
    expect(button.className).toContain("bg-purple-600");
  });

  it("renders secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: "Secondary" });
    expect(button.className).toContain("bg-teal-500");
  });

  it("renders outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button", { name: "Outline" });
    expect(button.className).toContain("border");
  });

  it("renders ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button", { name: "Ghost" });
    expect(button.className).toContain("bg-transparent");
  });

  it("renders destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("bg-red-600");
  });

  it("renders sm size", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button", { name: "Small" });
    expect(button.className).toContain("h-8");
  });

  it("renders md size", () => {
    render(<Button size="md">Medium</Button>);
    const button = screen.getByRole("button", { name: "Medium" });
    expect(button.className).toContain("h-10");
  });

  it("renders lg size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button", { name: "Large" });
    expect(button.className).toContain("h-12");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables correctly", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });
});
