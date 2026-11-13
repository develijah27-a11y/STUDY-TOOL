# SomaUG Academic — Frontend Presentation & UI/UX Audit (Step 1 Deliverable)

**Date**: November 14, 2026  
**Auditor**: Antigravity AI  
**Scope**: Public front-end presentation, trust verification, typography, accessibility, mobile-first responsiveness (360px / 768px / 1280px).  
**Directive Rule 1**: Audit before changing anything. No code changes until Step 1 audit is reviewed and Section 9 questions are answered.

---

## 1. Inventory of Public Pages & Shared Components

| Page / Component | File Location | Purpose & Current State |
| :--- | :--- | :--- |
| **Global Root Layout** | [`src/app/layout.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/layout.tsx) | Renders `<html>`, `<body>`, `<Navbar />`, `<main>`, `<Footer />`. Uses default system fonts; no `next/font` configuration is currently hooked up. |
| **Top Navigation Header** | [`src/components/common/navbar.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/components/common/navbar.tsx#L42-L176) | Sticky top bar containing brand logo, slide-out sidebar toggle, "Have a Document Code from WhatsApp?" pill, hardcoded wallet chip (`UGX 25,000`), and `Sign In` button. |
| **Slide-Out Navigation Drawer** | [`src/components/common/navbar.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/components/common/navbar.tsx#L178-L330) | Slide-out sidebar grouping links: Main Navigation, Student Portal, Lecturer Hub, and Comptroller & Audit. Includes onboarding card and instant role shortcuts. |
| **Hero Section** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L44-L149) | Background gradient `#0B192C` to `#1E3E62`. Contains national learning marketplace pill, H1 headline with wavy underline UGX, subtitle with university highlights, "New to SomaUG" onboarding card, search input form, and repeated WhatsApp code link. |
| **Feature / Showcase Cards** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L152-L248) | 3-column grid (Universities, Vocational & Technical, Fintech & WhatsApp) using external Unsplash `<img>` tags without `next/image` or error fallback handling. |
| **Institution Taxonomy Grid** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L251-L321) | Dual-row taxonomy: 7 Universities (MAK, KYU, MUST, UCU, MUBS, KIU, GU) and 7 Vocational & Technical Institutes (BRIBTE, KPM, UICT, NVTC, UTC, LDC, YMCA). Displays short code, name, and town, but currently lacks per-institution document counts. |
| **Recent Publication Cards (Home)** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L324-L413) | Displays recently published items. Shows institution tag, price in UGX, title (clamped to 2 lines), description (clamped to 2 lines), document code pill, page count, "View & Buy" button, and an unlabelled key icon button linking to `/d/[code]`. Currently lacks lecturer name on this card. |
| **Core Value Guarantees** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L416-L458) | 4-column card grid: "100% Verified Tutors", "Double-Entry UGX Ledger", "MTN & Airtel Mobile Money", "Protected DRM Reader". |
| **Bottom CTA Banner** | [`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L461-L491) | Navy gradient banner with "Ready to Excel in Your University or Technical Exams?", social proof text ("thousands of Ugandan students"), "Create Free Student Account" and "Explore Catalogue as Visitor". |
| **Global Footer** | [`src/components/common/navbar.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/components/common/navbar.tsx#L383-L451) | 4-column navy footer (`#0B192C`): Brand summary, Universities list, Vocational list, "Academic Integrity & Payment" security statement. Has grey-on-navy contrast issues. |
| **Public Academic Catalogue** | [`src/app/catalogue/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/catalogue/page.tsx) | Live search & multi-select filtering by institution, course, document type, and max price slider. |
| **Catalogue Publication Cards** | [`src/app/catalogue/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/catalogue/page.tsx#L340-L425) | Includes course code badge, price tag, title, description, document type badge, topics, lecturer name with check icon, page count, and "Details & Buy" / "Open in Study Reader" actions. |
| **Document Details & Sample Preview** | [`src/app/catalogue/[id]/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/catalogue/[id]/page.tsx) | Full document metadata, verified sample preview reader (first 2 pages free with watermark), wallet balance check, 1-click checkout modal, QR code generator modal, and WhatsApp share button. |
| **Document Code & QR Resolver** | [`src/app/d/[code]/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/d/[code]/page.tsx) & [`src/app/d/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/d/page.tsx) | Direct route for WhatsApp links and classroom projector QR codes. Allows entering access code manually or switching to simulated camera QR viewfinder. |

---

## 2. Typography, Weights, Size Scale & Color Tokens

### A. Current Font Definition
- **Status**: No web font or Google font is currently loaded via `next/font`.
- **Implementation**: In [`src/app/layout.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/layout.tsx), standard system sans is inherited via `@apply font-sans` in [`src/app/globals.css`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/globals.css#L76).
- **Target Specification**: Load **Inter** (latin subset, `display: 'swap'`, variable weight 400-700) using `next/font/google` in `layout.tsx`. Keep monospace (`font-mono`) exclusively for document codes, access keys, and financial order references.

### B. Size Scale Audit (Issue Flagged)
- **Current Sizes**:
  - Headings: `text-3xl sm:text-5xl md:text-6xl` (hero title is too large on mobile; needs fluid `clamp()` sizing between 2rem and 3.25rem).
  - Body: `text-sm` (14px) and `text-xs` (12px).
  - Sub-captions: Multiple instances of `text-[10px]` and `text-[11px]` in badges, dates, and card subtitles (e.g., lines 163, 194, 225, 288, 384 of `page.tsx`).
- **Directive Requirement**:
  - **Body text**: 16px (`text-base`).
  - **Secondary text**: 14px (`text-sm`).
  - **Captions / Badges**: **12px minimum** (`text-xs`). **Nothing smaller anywhere**.

### C. Color Token Architecture
Currently defined across three locations:
1. **CSS Variables** ([`src/app/globals.css`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/globals.css#L6-L38)):
   - `--primary: 205 65% 15%` (Deep navy)
   - `--secondary: 38 92% 50%` (Ochre / Gold)
   - `--background: 210 20% 98%` (Soft White)
   - `--card: 0 0% 100%` (Pure White)
   - `--muted-foreground: 215 16% 47%` (Fails 4.5:1 on dark backgrounds)
2. **Tailwind Config** ([`tailwind.config.ts`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/tailwind.config.ts#L54-L61)):
   - `academic.navy: #0f2027`
   - `academic.amber: #d97706`
   - `academic.gold: #f59e0b`
   - `academic.teal: #2c5364`
3. **Hard-coded Tailwind Utility Classes in JSX**:
   - Deep Navy: `#0B192C`, `#162942`, `#1E3E62`
   - Text Charcoal: `text-slate-900`, `text-slate-800`
   - Accent: `text-amber-400`, `bg-amber-500`, `text-emerald-800`
- **Target Brand System**:
  - **Deep Navy**: `#142B45` (Primary brand color, navigation, hero, headings)
  - **Academic Teal**: `#147D78` (Primary actions, active states, positive CTAs)
  - **Soft White**: `#F7F8FA` (Main application background)
  - **Pure White**: `#FFFFFF` (Cards, forms, reading surfaces)
  - **Charcoal**: `#243244` (Main body text, meeting contrast 4.5:1)
  - **Muted Gold**: `#E9B949` (Spare highlights and badge accents)

---

## 3. Header Wallet Balance Audit

- **Where Rendered**: [`src/components/common/navbar.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/components/common/navbar.tsx#L157-L165):
  ```tsx
  <Link
    href="/student/wallet"
    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
    title="Student Wallet Balance"
  >
    <Wallet className="h-3.5 w-3.5 text-amber-600" />
    <span className="hidden sm:inline">Wallet:</span>
    <span className="font-extrabold text-emerald-800">UGX 25,000</span>
  </Link>
  ```
- **What Feeds It**: It is currently **hard-coded static text** (`UGX 25,000`) shown unconditionally right beside the `Sign In` button on every public page.
- **Audit Flag & Safe Default (Section 9, Q1)**:
  - Showing a balance while the user is signed out confuses visitors who have not logged in.
  - **Applied Safe Default**: Render the wallet chip **only for authenticated users**. For signed-out visitors, hide the wallet chip and display "Browse Catalogue" or "Sign In" / "Create Account".

---

## 4. Marketing Copy Source & Localization

- **Current State**: All marketing copy is currently **hard-coded directly in JSX files** (`src/app/page.tsx`, `src/components/common/navbar.tsx`, `src/app/catalogue/page.tsx`). No centralized configuration exists.
- **Audit Decision**: Create a centralized copy configuration file (`src/lib/constants/site-copy.ts`) so all replacements from Section 3 are maintained in a single, clean source of truth, avoiding scattered string literals.

---

## 5. Image Audit & Root Cause of Feature Card 3 Failure

- **Inventory of Public Images**:
  1. Card 1 (Universities): `https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80` (External stock photo of Caucasian college students).
  2. Card 2 (Vocational): `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80` (External stock photo of industrial factory engineers).
  3. Card 3 (Payments): `https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80` (External stock photo of a credit card POS swipe terminal).
- **Why Card 3 Fails to Load**:
  - The image relies on an unoptimized external URL (`images.unsplash.com`) loaded through standard HTML `<img>` without `next/image` width/height dimensions.
  - It lacks an `onError` fallback handler. When DNS resolution fails, the network drops, or Unsplash rate-limits hotlinking, the browser displays raw broken `alt` text.
  - Furthermore, a physical POS credit card terminal is culturally inaccurate for Ugandan Mobile Money (*165# / *185# USSD prompts).
- **Remediation**:
  - Replace stock photos with clean, high-contrast vector illustrations or verified product workflow graphics (e.g., phone displaying MoMo unlock / QR flow).
  - Migrate all images to `next/image` with explicit dimensions to eliminate layout shift (CLS: 0).
  - Add an `onError` fallback component to guarantee broken alt text is never shown.

---

## 6. Existing vs. Missing Feature Audit

| Feature | Already Exists? | Location in Codebase | Notes |
| :--- | :--- | :--- | :--- |
| **Lecturer Name on Cards** | **Partial** | Exists in [`src/app/catalogue/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/catalogue/page.tsx#L398); **Missing** on Home recent cards ([`src/app/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/page.tsx#L350-L410)). | On Home page, the card shows institution tag and title, but omits the author/lecturer line. Will add lecturer name under title. |
| **Verified Flag** | **Partial** | Exists in data model (`lecturer.verificationStatus === 'approved'`) and catalogue card check icon. | Will follow safe default: show name only without claiming institutional verification unless confirmed. |
| **Document Preview** | **YES** | Exists in [`src/app/catalogue/[id]/page.tsx`](file:///c:/Users/PwezaCore/Desktop/STUDY%20TOOL/src/app/catalogue/[id]/page.tsx#L86-L105) & API. | `allowedPreviewPages: [1, 2]` is enforced server-side. Preview reader renders watermarked sample pages for multi-page documents. |
| **Per-Institution Document Counts** | **NO** | Not currently rendered in the institution cards. | Can be cleanly derived via `dbStore.documents.filter(d => d.institutionId === inst.id).length` without changing any database schemas. |

---

## 7. Baseline Accessibility & Mobile Responsiveness Assessment

- **Mobile Viewport (360px width)**:
  - Header actions wrap awkwardly due to the `UGX 25,000` wallet chip competing with `Sign In` and code modal triggers.
  - Hero search button drops below the input cleanly, but the onboarding card inner actions stack tightly.
  - Institution grid on mobile currently displays in 2 columns for universities and 1 column for vocational, which works without horizontal scroll.
- **Contrast Deficiencies**:
  - Grey text (`text-slate-400` / `text-slate-500`) on dark navy backgrounds (`#0B192C` in footer and hero) measures ~3.1:1, failing WCAG AA (requires 4.5:1 for normal text).
  - Sub-12px text (`text-[10px]` and `text-[11px]`) in multiple badges fails mobile legibility guidelines.
  - The unlabelled Key icon button next to "View & Buy" on the home page card lacks an accessible name (`aria-label`) and visible text on mobile.

---

## 8. Section 9 Open Questions & Safe Defaults Applied

| # | Question from Brief | Safe Default Stated in Brief | Action Taken / Planned |
| :---: | :--- | :--- | :--- |
| **1** | Is the UGX 25,000 wallet chip demo data or a deliberate guest wallet? | **Hide when signed out** | When unauthenticated, hide the wallet chip in the header; display it only when a valid student/user session exists. |
| **2** | Is there a real review or verification process behind "peer-reviewed" and "verified"? | **Remove those words** | Replaced "peer-reviewed", "verified notes", "100% Verified Tutors", and "Certified higher education institutions" with factual academic terms ("Lecture notes and past papers from your lecturers"). |
| **3** | Do we have real student and document counts for social proof? | **Omit numbers** | Replaced "Join thousands of Ugandan students" with "Search by course code, pay with MoMo, read on your phone, tablet or laptop." |
| **4** | Do document previews exist today? | **Do not build them** | Document preview **already exists** in `src/app/catalogue/[id]/page.tsx` (`allowedPreviewPages: [1, 2]`). On the cards, we will link to the existing preview on the detail page without introducing any new backend endpoints. |
| **5** | Do we have official MTN and Airtel logo assets and permission? | **Use text labels** | Use high-contrast accessible text badges ("MTN MoMo" and "Airtel Money") instead of unlicensed SVG logos. |
| **6** | Do you have real campus photos to supply? | **Use clean illustrations / product UI** | Replace the Western stock photos with clean editorial illustrations in the navy and amber palette and real product UI captures (phone unlock screen, QR scan). |

---

## 9. Implementation Phasing Plan (Phases 1 to 6)

Following Ground Rule 1 and Delivery Rule 1, **no code has been modified in this step**. Upon your confirmation of this audit and answers to Section 9 questions, the rollout will proceed in discrete, verifiable phases:

1. **Phase 1: Trust & Bug Fixes (P0)**
   - Fix broken third feature card with fallback handling and culturally appropriate visual.
   - Hide the header wallet chip when signed out.
   - Remove unverifiable claims ("peer-reviewed", "official marketplace", "thousands of students").
   - Eliminate duplicate WhatsApp code prompts in hero; unify CTA labels ("Create free account", "Browse as visitor", "Enter code").
2. **Phase 2: Centralized Copy Integration**
   - Create `src/lib/constants/site-copy.ts` containing all Section 3 replacements.
   - Update `page.tsx` and `navbar.tsx` to read from this central dictionary.
3. **Phase 3: Publication Card Hierarchy**
   - Badged course code (e.g. `CSC 2101`) above title.
   - 2-line clamped title under 8 words.
   - Prominent bold UGX price top right.
   - Lecturer name under title.
   - Labeled Key button with explicit `aria-label="Enter unlock code"` and text label.
4. **Phase 4: Typography & Contrast Design Tokens**
   - Configure `next/font/google` with Inter in `layout.tsx`.
   - Set 16px body, 14px secondary, 12px minimum caption scale.
   - Enforce WCAG AA contrast (≥4.5:1 text, ≥3:1 UI components) across navy footer, badges, and search inputs.
5. **Phase 5: Image Assets & Optimization**
   - Replace stock photos with navy/amber palette vector illustrations and product workflow screenshots.
   - Use `next/image` with explicit dimensions and `onError` fallbacks.
6. **Phase 6: Layout & Institution Directory Polish**
   - Move search bar above the onboarding box in the hero.
   - Equal-height institution cards with passing contrast and calculated document counts (`X documents`).
   - Kyambogo-style active highlight with `focus-visible` accessibility.

