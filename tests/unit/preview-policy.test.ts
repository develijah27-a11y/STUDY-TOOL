import { describe, it, expect } from "vitest";
import { evaluatePreviewPolicy } from "@/lib/documents/preview-policy";

describe("Document Preview Policy Engine (Server-Side Enforced)", () => {
  it("strictly disables preview for 1–2 page documents", () => {
    const res1 = evaluatePreviewPolicy(1, [1]);
    expect(res1.canPreview).toBe(false);
    expect(res1.allowedPageNumbers).toEqual([]);

    const res2 = evaluatePreviewPolicy(2, [1, 2]);
    expect(res2.canPreview).toBe(false);
    expect(res2.allowedPageNumbers).toEqual([]);
  });

  it("disables preview by default for 3–5 page documents unless approved exception (max 1 page)", () => {
    const defaultRes = evaluatePreviewPolicy(4);
    expect(defaultRes.canPreview).toBe(false);
    expect(defaultRes.allowedPageNumbers).toEqual([]);

    // Approved exception: max 1 page
    const exceptionRes = evaluatePreviewPolicy(4, [2, 3]);
    expect(exceptionRes.canPreview).toBe(true);
    expect(exceptionRes.allowedPageNumbers).toEqual([2]);
  });

  it("allows 1–3 sample pages for intermediate documents (6–20 pages)", () => {
    // 10 pages with suggested pages
    const res = evaluatePreviewPolicy(10, [1, 3, 5, 7]);
    expect(res.canPreview).toBe(true);
    expect(res.allowedPageNumbers.length).toBeLessThanOrEqual(3);
    expect(res.allowedPageNumbers).toEqual([1, 3, 5]);

    // 10 pages without suggestions -> defaults to [1, 2]
    const defaultRes = evaluatePreviewPolicy(10);
    expect(defaultRes.canPreview).toBe(true);
    expect(defaultRes.allowedPageNumbers).toEqual([1, 2]);
  });

  it("caps sample preview for large documents (>20 pages) to max 5 pages or 20%", () => {
    // 25 pages -> 20% is 5 pages
    const res25 = evaluatePreviewPolicy(25, [1, 2, 3, 4, 5, 6, 7, 8]);
    expect(res25.canPreview).toBe(true);
    expect(res25.allowedPageNumbers.length).toBe(5);
    expect(res25.allowedPageNumbers).toEqual([1, 2, 3, 4, 5]);

    // 100 pages -> capped at 5 pages
    const res100 = evaluatePreviewPolicy(100, [1, 5, 10, 15, 20, 25]);
    expect(res100.canPreview).toBe(true);
    expect(res100.allowedPageNumbers.length).toBe(5);
  });

  it("rejects invalid page numbers outside document bounds", () => {
    const res = evaluatePreviewPolicy(15, [0, 99, 105]);
    expect(res.canPreview).toBe(true);
    // suggestions were out of bounds, so default fallback kicks in
    expect(res.allowedPageNumbers).toEqual([1, 2]);
  });
});

