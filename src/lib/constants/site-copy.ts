/**
 * Centralized Copy Dictionary for SomaUG Academic
 * Strictly follows The One Rule and Project Beta Guidelines:
 * No unverified claims, no false institution partnerships, no misleading legal promises.
 * Financial details (e.g. 85% revenue share) remain strictly inside the lecturer workspace.
 */

export const SITE_COPY = {
  brand: {
    name: "SomaUG Academic",
    tagline: "Course Study Materials & Revision Guides",
    footerDescription:
      "SomaUG helps university and tertiary students discover lecture notes, study summaries, and revision guides authored by lecturers and academic tutors.",
  },

  actions: {
    createAccount: "Get Started",
    browseVisitor: "Explore Materials",
    scanQr: "Scan QR",
    searchPlaceholder: "Search by course code (e.g. CSC 2101, LAW 1101) or topic...",
    searchButton: "Search Materials",
    viewAndBuy: "Preview & Buy",
  },

  hero: {
    badge: "Independent Study Materials · Mobile Money Checkout",
    headline: "Access academic study notes authored by your course lecturers.",
    subline:
      "Lecture notes, revision summaries, and practical guides. Preview free sample pages before you pay with mobile money.",
  },

  howItWorks: [
    {
      step: 1,
      title: "Find your course unit",
      description: "Search by course unit code or title, and filter by your university or institute in the catalogue.",
    },
    {
      step: 2,
      title: "Preview before paying",
      description: "Read the free sample pages and verify syllabus coverage before purchasing with MTN or Airtel Mobile Money.",
    },
    {
      step: 3,
      title: "Read online or offline",
      description: "Access your notes instantly in the browser reader, highlight key points, and study offline without extra data charges.",
    },
  ],

  forLecturers: {
    heading: "Publish your course materials on SomaUG",
    subheading: "Help students revise effectively with your original course notes and structured syllabus guides.",
    benefits: [
      {
        title: "Direct student reach",
        description: "Distribute revision notes and course materials directly to students taking your course units.",
      },
      {
        title: "Copyright protected",
        description: "You remain the author and copyright owner with personalized watermarking on student downloads.",
      },
      {
        title: "Mobile money withdrawals",
        description: "Withdraw your verified balance anytime directly to your registered MTN or Airtel phone number.",
      },
    ],
    declarationNotice:
      "Every publishing lecturer confirms: 'I wrote this material, I have the right to sell it, and it does not breach my employer's policy or anyone's copyright.'",
  },

  faq: [
    {
      question: "What is SomaUG Academic?",
      answer:
        "SomaUG is an independent digital study tool where university lecturers and tutors publish original course notes, study guides, and revision summaries for higher education in Uganda.",
    },
    {
      question: "Can I preview notes before paying?",
      answer:
        "Yes. Every published document includes free sample pages and an overview of topics so you can inspect quality before paying.",
    },
    {
      question: "How do payments work?",
      answer:
        "Payments are pay-per-document using MTN Mobile Money or Airtel Money. You pay only for the individual notes you need with zero recurring subscriptions.",
    },
    {
      question: "Can I read materials offline?",
      answer:
        "Yes. Once you unlock a document, you can save it to your offline study library and read without an active internet connection.",
    },
    {
      question: "What if a file is damaged or incomplete?",
      answer:
        "We offer a 24-hour refund policy. If a file does not open or is materially misdescribed, reach out to our support on WhatsApp or email for a prompt refund.",
    },
    {
      question: "Is SomaUG affiliated with any university?",
      answer:
        "No. SomaUG is an independent platform. It is not affiliated with, endorsed by, or sponsored by any university or institution. Institution names are used solely to help students locate materials relevant to their coursework.",
    },
  ],

  footer: {
    disclaimer:
      "SomaUG is an independent platform. It is not affiliated with, endorsed by, or sponsored by any university or institution. Institution names are used only to help students find materials for their courses.",
    copyright: `© ${new Date().getFullYear()} SomaUG Academic. All rights reserved.`,
  },
} as const;
