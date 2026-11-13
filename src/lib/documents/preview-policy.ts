export interface PreviewPolicyResult {
  allowedPageNumbers: number[];
  canPreview: boolean;
  policyReason: string;
}

/**
 * Enforces platform preview policies strictly on the server side.
 * Never trust page lists or flags sent by the browser.
 */
export function evaluatePreviewPolicy(
  totalPages: number,
  lecturerSuggestedPages?: number[]
): PreviewPolicyResult {
  if (totalPages <= 0) {
    return {
      allowedPageNumbers: [],
      canPreview: false,
      policyReason: "Invalid document page count",
    };
  }

  // 1–2 pages: no automatic page preview; show complete descriptive metadata
  if (totalPages <= 2) {
    return {
      allowedPageNumbers: [],
      canPreview: false,
      policyReason: "Documents with 1–2 pages cannot have preview pages exposed to protect content value.",
    };
  }

  // 3–5 pages: no automatic preview by default, with approved exceptions (max 1 page)
  if (totalPages <= 5) {
    if (lecturerSuggestedPages && lecturerSuggestedPages.length > 0) {
      const singlePage = lecturerSuggestedPages[0];
      if (singlePage >= 1 && singlePage <= totalPages) {
        return {
          allowedPageNumbers: [singlePage],
          canPreview: true,
          policyReason: "Limited 1-page sample preview approved for short document.",
        };
      }
    }
    return {
      allowedPageNumbers: [],
      canPreview: false,
      policyReason: "Documents with 3–5 pages have preview disabled by default.",
    };
  }

  // 6–20 pages: approximately 1–3 sample pages
  if (totalPages <= 20) {
    let allowed: number[] = [];
    if (lecturerSuggestedPages && lecturerSuggestedPages.length > 0) {
      // Filter valid in-bound pages and deduplicate
      allowed = Array.from(new Set(lecturerSuggestedPages))
        .filter((p) => p >= 1 && p <= totalPages)
        .slice(0, 3);
    }
    if (allowed.length === 0) {
      // Default to pages 1, 2 (or first 2)
      allowed = [1, 2].filter((p) => p <= totalPages);
    }
    return {
      allowedPageNumbers: allowed,
      canPreview: true,
      policyReason: "Standard sample preview of up to 3 pages for intermediate document.",
    };
  }

  // Over 20 pages: curated samples, typically up to 5 pages, capped at 20% of total
  const maxAllowedByPercentage = Math.floor((totalPages * 20) / 100);
  const maxPagesCap = Math.min(5, maxAllowedByPercentage);

  let allowed: number[] = [];
  if (lecturerSuggestedPages && lecturerSuggestedPages.length > 0) {
    allowed = Array.from(new Set(lecturerSuggestedPages))
      .filter((p) => p >= 1 && p <= totalPages)
      .slice(0, maxPagesCap);
  }
  if (allowed.length === 0) {
    // Default up to 3 sample pages
    allowed = [1, 2, 3].filter((p) => p <= totalPages);
  }

  return {
    allowedPageNumbers: allowed,
    canPreview: true,
    policyReason: `Curated sample preview of ${allowed.length} pages (policy cap: ${maxPagesCap} pages).`,
  };
}

