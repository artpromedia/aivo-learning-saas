import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Card, CardHeader, CardContent, CardFooter } from "../card.js";

afterEach(cleanup);

describe("Card", () => {
  it("renders Card with children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders CardHeader, CardContent, CardFooter", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Card data-testid="card">Default</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("shadow-md");
  });

  it("applies bordered variant classes", () => {
    render(
      <Card variant="bordered" data-testid="card">
        Bordered
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border");
  });

  it("applies elevated variant classes", () => {
    render(
      <Card variant="elevated" data-testid="card">
        Elevated
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("shadow-xl");
  });
});
