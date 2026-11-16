/**
 * Centralized Copy Dictionary for SomaUG Academic
 * Strictly follows The One Rule:
 * "Only claim what is true today, and show what the product does instead of who it knows."
 * No unverified claims, no false institution partnerships, no misleading legal promises.
 */

export const SITE_COPY = {
  brand: {
    name: "SomaUG Academic",
    tagline: "Course Study Notes & Revision Guides",
    footerDescription:
      "Independent academic marketplace for Ugandan higher education. Find lecture notes and revision guides authored by lecturers and tutors, and pay per document with mobile money.",
  },

  actions: {
    createAccount: "Create account",
    browseVisitor: "Browse materials",
    scanQr: "Scan document QR",
    searchPlaceholder: "Search by course unit code (e.g. CSC 2101, LAW 1101) or topic...",
    searchButton: "Search materials",
    viewAndBuy: "Preview & Buy",
  },

  hero: {
    badge: "Independent Study Materials · Mobile Money Checkout",
    headline: "Find and buy study notes for your course, pay with mobile money.",
    subline:
      "Lecture notes and study guides from lecturers and tutors. Preview before you pay.",
  },

  howItWorks: [
    {
      step: 1,
      title: "Find your course unit",
      description: "Search by course code, unit title, or filter by your institution to locate relevant lecture notes.",
    },
    {
      step: 2,
      title: "Preview before paying",
      description: "Read the free sample pages, verify the table of contents, and pay with MTN or Airtel Mobile Money.",
    },
    {
      step: 3,
      title: "Read or download",
      description: "Access your notes instantly in your browser reader, highlight key concepts, or download for offline revision.",
    },
  ],

  forLecturers: {
    heading: "Publish your study materials on SomaUG",
    subheading: "Help students revise effectively while earning from your original course notes and revision guides.",
    benefits: [
      {
        title: "Keep 85% of your earnings",
        description: "You receive 85% of every document sale. SomaUG keeps 15% to cover payment gateway fees and hosting.",
      },
      {
        title: "Direct mobile money payouts",
        description: "Withdraw your balance anytime to your registered MTN or Airtel mobile money number.",
      },
      {
        title: "Retain your copyright",
        description: "You remain the author and copyright owner. You grant SomaUG a non-exclusive distribution right.",
      },
    ],
    declarationNotice:
      "Every publishing lecturer confirms: 'I wrote this material, I have the right to sell it, and it does not breach my employer's policy or anyone's copyright.'",
  },

  faq: [
    {
      question: "Is it safe to pay on SomaUG?",
      answer:
        "Yes. Payments are processed per document directly via licensed mobile money payment gateways. SomaUG does not hold stored balances or store your PIN.",
    },
    {
      question: "Can I preview notes before buying?",
      answer:
        "Yes. Every publication includes free sample pages and a table of contents so you can inspect the quality and syllabus coverage before paying.",
    },
    {
      question: "What if the document file does not open or is incorrect?",
      answer:
        "We offer a 24-hour refund policy. If a file is corrupted, illegible, or materially different from its description, contact our support on WhatsApp or email for a swift review and refund.",
    },
    {
      question: "Who owns the notes on SomaUG?",
      answer:
        "Notes are authored and owned by the respective lecturers and tutors. SomaUG acts as an independent distribution platform.",
    },
    {
      question: "How do I report copyright infringement or unauthorized materials?",
      answer:
        "We review uploads and respond to takedown requests within 48 hours. Submit a request via our Copyright & Takedown page or email copyright@somaug.org.",
    },
    {
      question: "Is SomaUG affiliated with Makerere, Kyambogo, or any university?",
      answer:
        "No. SomaUG is an independent platform. It is not affiliated with, endorsed by, or sponsored by any university or institution. Institution names are used strictly to help students find materials for their courses.",
    },
  ],

  footer: {
    disclaimer:
      "SomaUG is an independent platform. It is not affiliated with, endorsed by, or sponsored by any university or institution. Institution names are used only to help students find materials for their courses.",
    copyright: `© ${new Date().getFullYear()} SomaUG Academic. All rights reserved.`,
  },
} as const;
