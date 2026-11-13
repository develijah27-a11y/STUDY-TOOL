/**
 * Centralized Copy Dictionary for SomaUG Academic
 * Strictly follows the UI/UX Master Design Directive.
 * Prohibits unverified claims (e.g. "peer-reviewed", "official endorsement")
 * and technical jargon in student-facing prose.
 */

export const SITE_COPY = {
  brand: {
    name: "SomaUG Academic",
    tagline: "Uganda Universities & Vocational Institutes",
    footerDescription:
      "Study materials marketplace for Ugandan universities, polytechnics and institutes. Instant unlock with MTN and Airtel Mobile Money.",
  },

  actions: {
    createAccount: "Create free account",
    browseVisitor: "Browse as visitor",
    enterCode: "Enter code",
    haveCodePrompt: "Have a Document Code from WhatsApp?",
    searchPlaceholder: "Search by course code (e.g. CSC 2101, BRIBTE EE 1101) or topic...",
    searchButton: "Search materials",
    viewAndBuy: "View & Buy",
    enterUnlockCodeAria: "Enter unlock code",
  },

  hero: {
    badge: "Higher education & vocational study materials in Uganda",
    headline: "Study notes and past papers from your lecturers. Pay with MoMo.",
    subline:
      "Notes, solved past papers and lab manuals for Makerere, Kyambogo, MUST and more. From UGX 2,000.",
    onboardingHeading: "Study here, or sell your notes",
    onboardingBody:
      "Top up once with MTN MoMo or Airtel Money, then unlock anything instantly. Browsing is free.",
  },

  featureCards: {
    universities: {
      category: "Universities",
      title: "University notes and past papers",
      body: "Lecture notes, past exams with marking schemes, and lab guides for Makerere, Kyambogo, MUST, MUBS, UCU and KIU.",
      linkText: "Explore university notes",
    },
    vocational: {
      category: "Vocational & Technical",
      title: "Vocational and practical handbooks",
      body: "UBTEB syllabus handbooks, practical guides, workshop diagrams and course summaries for Buganda Royal, Kampala Polytechnic, UICT and more.",
      linkText: "Explore technical manuals",
    },
    payments: {
      category: "Payments & WhatsApp",
      title: "Instant MoMo and WhatsApp access",
      body: "Top up once with MTN MoMo or Airtel Money. Lecturers share one-tap links and codes in class WhatsApp groups.",
      linkText: "How mobile payments work",
    },
  },

  institutions: {
    heading: "Browse by university and institute",
    subtitle: "Materials for 14+ universities and institutes across Uganda.",
    universitiesLabel: "Universities",
    vocationalLabel: "Vocational, Technical & Polytechnic Institutes",
    viewAll: "View full directory",
  },

  publications: {
    heading: "Recently published",
    subtitle: "Notes, practical handbooks and solved past papers, ready to unlock.",
    seeAll: (count: number) => `See all ${count}`,
  },

  guarantees: {
    lecturersTitle: "Lecturer-Authored Notes",
    lecturersBody: "Study materials uploaded directly by course lecturers and workshop instructors.",
    ledgerTitle: "Transparent Accounting",
    ledgerBody: "Payments in Ugandan Shillings (UGX). Every deposit and purchase is tracked with an instant digital receipt.",
    momoTitle: "MTN MoMo & Airtel Money",
    momoBody: "Top up with MTN MoMo (*165#) or Airtel Money (*185#). Instant access on your smartphone.",
    readerTitle: "Study Anywhere",
    readerBody: "Comfortable reading on mobile or laptop with custom themes, bookmarking and highlights.",
  },

  bottomBanner: {
    heading: "Find notes and past papers for your course",
    body: "Search by course code, pay with MoMo, read on your phone, tablet or laptop.",
  },

  footer: {
    securityHeading: "Security and payments",
    securityBody:
      "Payments are secure and every purchase is recorded. Documents are watermarked with your details to discourage sharing.",
    copyright: `© ${new Date().getFullYear()} SomaUG Academic. Study materials for Ugandan higher education and vocational institutes.`,
  },
} as const;

