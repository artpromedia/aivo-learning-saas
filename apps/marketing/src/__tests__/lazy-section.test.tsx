import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: (entries: { isIntersecting: boolean }[]) => void;

beforeEach(() => {
  global.IntersectionObserver = vi.fn((callback) => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

import { LazySection } from "@/components/shared/lazy-section";

describe("LazySection", () => {
  it("shows skeleton placeholder initially", () => {
    render(
      <LazySection height={400}>
        <div>Content</div>
      </LazySection>
    );
    expect(screen.getByTestId("lazy-section-skeleton")).toBeDefined();
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("renders children after intersection", () => {
    render(
      <LazySection height={400}>
        <div>Content</div>
      </LazySection>
    );

    act(() => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryByTestId("lazy-section-skeleton")).toBeNull();
  });

  it("does not render children before intersection", () => {
    render(
      <LazySection height={300}>
        <div>Hidden Content</div>
      </LazySection>
    );

    act(() => {
      intersectionCallback([{ isIntersecting: false }]);
    });

    expect(screen.queryByText("Hidden Content")).toBeNull();
    expect(screen.getByTestId("lazy-section-skeleton")).toBeDefined();
  });
});
