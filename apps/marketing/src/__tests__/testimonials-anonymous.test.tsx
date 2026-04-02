import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => <svg data-testid="chevron-left" />,
  ChevronRight: () => <svg data-testid="chevron-right" />,
  Quote: () => <svg data-testid="quote-icon" />,
  User: () => <svg data-testid="user-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
}));

import { Testimonials } from "@/components/home/testimonials";

describe("Testimonials — Anonymous Identities", () => {
  it("does NOT render any real names", () => {
    const user = userEvent.setup();
    const { container } = render(<Testimonials />);
    const html = container.innerHTML;
    const realNames = ["Sarah", "Marcus", "Lisa", "David", "Jennifer"];
    for (const name of realNames) {
      expect(html).not.toContain(name);
    }
  });

  it("renders anonymous descriptor on first slide", () => {
    render(<Testimonials />);
    expect(
      screen.getByText("Parent of 4th Grader with ASD"),
    ).toBeDefined();
  });

  it("renders Verified badge text", () => {
    render(<Testimonials />);
    expect(screen.getByText("Verified Aivo Parent")).toBeDefined();
  });

  it("renders 6 navigation dots", () => {
    render(<Testimonials />);
    const dots = screen.getAllByLabelText(/Go to testimonial \d+/);
    expect(dots).toHaveLength(6);
  });

  it("renders prev and next buttons", () => {
    render(<Testimonials />);
    expect(screen.getByLabelText("Previous testimonial")).toBeDefined();
    expect(screen.getByLabelText("Next testimonial")).toBeDefined();
  });

  it("renders User icon SVG inside avatar circle", () => {
    render(<Testimonials />);
    expect(screen.getByTestId("user-icon")).toBeDefined();
  });

  it("can navigate to all 6 testimonials", async () => {
    const user = userEvent.setup();
    render(<Testimonials />);

    const nextBtn = screen.getByLabelText("Next testimonial");

    expect(screen.getByText("Parent of 4th Grader with ASD")).toBeDefined();

    await user.click(nextBtn);
    expect(screen.getByText("Special Education Teacher, 15 Years")).toBeDefined();

    await user.click(nextBtn);
    expect(screen.getByText("Director of Special Ed, Public School District")).toBeDefined();

    await user.click(nextBtn);
    expect(screen.getByText("Parent of 6th Grader with Dyscalculia")).toBeDefined();

    await user.click(nextBtn);
    expect(screen.getByText("Special Education Coordinator")).toBeDefined();

    await user.click(nextBtn);
    expect(screen.getByText(/Homeschool Parent of 3/)).toBeDefined();
  });

  it("shows verified badge with check icon", () => {
    render(<Testimonials />);
    expect(screen.getByTestId("check-circle-icon")).toBeDefined();
  });
});
