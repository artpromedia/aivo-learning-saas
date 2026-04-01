import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("lucide-react", () => ({
  Loader2: () => <span>Loading</span>,
}));

const mockSubmitLead = vi.hoisted(() => vi.fn().mockResolvedValue({ lead: { id: "123" } }));
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

const mockEvents = vi.hoisted(() => ({ leadMagnetDownload: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { LeadMagnetBanner } from "@/components/cro/lead-magnet-banner";

describe("LeadMagnetBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders with provided props", () => {
    render(
      <LeadMagnetBanner
        title="Free Guide"
        description="Download our guide"
        ctaLabel="Get It"
        source="test"
      />
    );
    expect(screen.getByText("Free Guide")).toBeDefined();
    expect(screen.getByText("Download our guide")).toBeDefined();
    expect(screen.getByText("Get It")).toBeDefined();
  });

  it("submits email correctly", async () => {
    render(
      <LeadMagnetBanner
        title="Guide"
        description="Desc"
        ctaLabel="Download"
        source="blog-banner"
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByText("Download"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactEmail: "test@test.com",
          source: "blog-banner",
          stage: "lead-magnet",
        })
      );
    });
  });

  it("'No thanks' dismisses for session", () => {
    const { rerender } = render(
      <LeadMagnetBanner title="Guide" description="D" ctaLabel="DL" source="test-dismiss" />
    );

    fireEvent.click(screen.getByText("No thanks"));

    rerender(
      <LeadMagnetBanner title="Guide" description="D" ctaLabel="DL" source="test-dismiss" />
    );

    expect(screen.queryByText("Guide")).toBeNull();
  });
});
