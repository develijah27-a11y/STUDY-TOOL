# SomaUG Academic — Uganda University Document Marketplace

A complete, production-oriented academic document marketplace built from a clean foundation for Ugandan university lecturers and students.

## 1. Architecture & Technology Stack

- **Frontend & Server**: Next.js 14 App Router, TypeScript, React 18
- **Design System**: Tailwind CSS with scholarly academic tokens (`#0f2027` Navy, `#203a43` Slate, `#d97706` Amber/Ochre)
- **Database & RLS**: PostgreSQL via Supabase (`supabase/migrations/`) with Row Level Security and atomic PL/pgSQL transaction functions
- **Financial Core**: Append-only Double-Entry Bookkeeping Ledger using exact integer UGX arithmetic (zero floating-point operations)
- **Mobile Money Payments**: Interchangeable Uganda Telecom Provider Adapter supporting **MTN Mobile Money** (`077/078/076`) and **Airtel Money** (`070/075/074`) with HMAC webhook signature verification and replay deduplication
- **Private Document Storage & DRM**: Private storage abstraction (`LocalStorageAdapter` / Cloudflare R2) with server-enforced preview page limits and dynamic buyer watermarking
- **Automated Testing**: Vitest unit and integration test suites covering all mandatory financial, permission, and publication security test cases

---

## 2. Project Directory Structure

```text
├── src/
│   ├── app/
│   │   ├── page.tsx                         # Public Landing, University Pills & Featured Packs
│   │   ├── catalogue/
│   │   │   ├── page.tsx                     # Search, Academic Filters & Course Match Boost
│   │   │   └── [id]/page.tsx                # Document Details, Sample Preview & Atomic Wallet Checkout
│   │   ├── collections/[shareCode]/page.tsx # Lecturer WhatsApp Course Pack & QR Code Share
│   │   ├── student/
│   │   │   ├── library/page.tsx             # Personal Study Library & Receipts
│   │   │   ├── read/[documentId]/page.tsx   # Protected Online Reader, Bookmarks, Notes & Reporting
│   │   │   └── wallet/page.tsx              # Student Wallet, MTN/Airtel Deposits & Withdrawals
│   │   ├── lecturer/
│   │   │   └── dashboard/page.tsx           # Multi-Step Publishing, Collections & Consolidated Payouts
│   │   ├── admin/
│   │   │   └── dashboard/page.tsx           # Ledger Reconciliation, Verification, Refunds & Moderation
│   │   └── api/
│   │       ├── catalogue/route.ts
│   │       ├── wallet/route.ts
│   │       ├── documents/route.ts
│   │       ├── reader/route.ts
│   │       └── admin/route.ts
│   ├── components/common/navbar.tsx         # Mobile-First Navigation & Footer
│   ├── lib/
│   │   ├── auth/roles.ts                    # Server-Side Role & Ownership Guards
│   │   ├── db/in-memory-store.ts            # Seeded Transactional Repository
│   │   ├── documents/
│   │   │   ├── preview-policy.ts            # Server-Enforced Preview Page Policy Engine
│   │   │   └── publishing-service.ts        # PDF Validation, Versioning, QR Collections & Watermarking
│   │   ├── financial/
│   │   │   ├── commission-service.ts        # Exact Integer UGX Commission Split Service
│   │   │   ├── ledger-service.ts            # Double-Entry Bookkeeping Invariant Engine
│   │   │   └── wallet-service.ts            # Atomic Purchases, Deposits, Withdrawals, Payouts & Refunds
│   │   ├── payments/
│   │   │   ├── provider-interface.ts        # Telecom Provider Contract
│   │   │   └── momo-adapter.ts              # MTN MoMo & Airtel Money Uganda Adapter
│   │   └── storage/storage-adapter.ts       # Private Document Storage Abstraction
│   └── types/
│       ├── domain.ts
│       └── financial.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20261106000001_initial_schema.sql
│   │   ├── 20261106000002_double_entry_ledger.sql
│   │   ├── 20261106000003_rls_and_policies.sql
│   │   └── 20261106000004_atomic_purchase_function.sql
│   └── seed.sql
└── tests/
    ├── unit/
    │   ├── access-control.test.ts
    │   ├── commission-service.test.ts
    │   ├── financial-ledger.test.ts
    │   ├── momo-provider.test.ts
    │   └── preview-policy.test.ts
    └── integration/
        ├── publication-security.test.ts
        └── wallet-purchase.test.ts
```

---

## 3. Local Setup & Running Tests

1. **Copy Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run All Automated Unit & Integration Tests**:
   ```bash
   npm test
   ```
4. **Build for Production**:
   ```bash
   npm run build
   ```
5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 4. Offline Reading & Technical DRM Limits (Part XII §26–27)

- **Online Reader Protection**: Every page request is authenticated and entitlement-checked on the server (`/api/reader`). The original PDF is stored in private storage and is never exposed via a public URL. Dynamic buyer watermarks (`Name + Email + Receipt Reference`) are rendered on every page.
- **Honest Technical Disclosure**: No browser application can physically prevent a user from photographing a screen with an external camera or taking an OS-level screenshot.
- **Native Android Offline DRM Roadmap**: Ordinary PWA service-worker caching is intentionally not used as DRM because cached browser blobs can be extracted. True offline protection requires a native Android wrapper using `WindowManager.LayoutParams.FLAG_SECURE`, AES-256-GCM encrypted local page packages bound to Android Keystore hardware-backed keys, and short-lived expiring offline licences that synchronize reading progress and support lost-device revocation.

---

## 5. Requirements Traceability Matrix (Part XVIII §50–51)

| Requirement / Phase | Description | Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Phase 1: Clean Foundation** | Next.js App Router, TypeScript, Tailwind, `.env.example`, SQL migrations & seed | **Tested** | `npm test` & `npm run build` |
| **Phase 2: Roles & Auth** | Visitor, Student, Lecturer, Admin, Co-Admin; Coordinator rules; IDOR guards | **Tested** | `tests/unit/access-control.test.ts` |
| **Phase 3: Catalogue & Discovery** | Ugandan institutions (MAK, KYU, MUST, UCU, MUBS), search, filters, course boost | **Tested** | `/catalogue` & `/api/catalogue` |
| **Phase 4: Lecturer Publishing** | PDF binary header & size validation, UGX pricing, preview rules, QR collections | **Tested** | `tests/integration/publication-security.test.ts` |
| **Phase 5: Online Reader & Library** | Server-side entitlement verification, dynamic watermarks, notes, bookmarks | **Tested** | `tests/integration/publication-security.test.ts` |
| **Phase 6: Double-Entry Ledger** | Immutable balanced debits/credits, atomic wallet purchase, PIN lockout, receipts | **Tested** | `tests/integration/wallet-purchase.test.ts` |
| **Phase 7: Payment Integration** | MTN/Airtel MSISDN validation, pending deposits, webhook deduplication, payouts | **Tested** | `tests/unit/momo-provider.test.ts` & `wallet-purchase.test.ts` |
| **Phase 8: Administration** | Lecturer review, copyright takedowns, compensating refunds, ledger reconciliation | **Tested** | `/admin/dashboard` & `wallet-purchase.test.ts` |
| **Phase 9: Study & Offline Evaluation** | Mobile zoom/navigation, annotations, honest browser DRM & Android `FLAG_SECURE` docs | **Tested** | `/student/read/[documentId]` & `README.md` |
| **Phase 10: QA & Build Verification** | All 7 unit & integration test suites and Next.js production build | **Tested** | Vitest & Next.js build output |

