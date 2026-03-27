import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Input } from "../input.js";

afterEach(cleanup);

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Username" error="Username is required" />);
    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Username is required");
  });

  it("links aria-describedby correctly for error", () => {
    render(<Input label="Email" error="Invalid email" id="email-input" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-describedby", "email-input-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("links aria-describedby correctly for helper text", () => {
    render(<Input label="Password" helperText="Enter your password" id="password-input" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-describedby", "password-input-helper");
  });

  it("handles onChange", () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "John" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
