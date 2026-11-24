import {
  Institution,
  Programme,
  CourseUnit,
  UserProfile,
  LecturerProfile,
  Document,
  DocumentVersion,
  Collection,
  ReadingProgress,
  Bookmark,
  PersonalNote,
  UserRole,
  SupportTicket,
  PlatformAnnouncement,
  WebsiteContentConfig,
} from "@/types/domain";
import {
  LedgerAccount,
  WalletAccount,
  LedgerTransaction,
  LedgerEntry,
  DepositAttempt,
  Order,
  Entitlement,
  PayoutBatch,
  PayoutItem,
  RefundRecord,
} from "@/types/financial";

export interface ContentReport {
  id: string;
  reporterId: string;
  documentId: string;
  category: "copyright_infringement" | "document_error" | "low_quality" | "inappropriate";
  details: string;
  status: "open" | "investigating" | "resolved_takedown" | "dismissed";
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: "wallet" | "purchase" | "verification" | "payout" | "moderation" | "security";
  isRead: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  commissionPercent: number;
  minDocumentPriceUGX: number;
  maxDocumentPriceUGX: number;
  minDepositUGX: number;
  minLecturerPayoutUGX: number;
  studentWithdrawalFeeUGX: number;
  lecturerPayoutFeeUGX: number;
  payoutScheduleDay: string;
}

/**
 * Authoritative Data Store for Uganda Academic Marketplace.
 * Pre-seeded with Ugandan academic taxonomy, Chart of Accounts, verified lecturers,
 * and publications so the application works out-of-the-box and in integration tests.
 */
class MarketplaceStore {
  institutions: Institution[] = [];
  programmes: Programme[] = [];
  courses: CourseUnit[] = [];
  profiles: UserProfile[] = [];
  userRoles: Map<string, UserRole[]> = new Map();
  lecturerProfiles: LecturerProfile[] = [];
  documents: Document[] = [];
  documentVersions: DocumentVersion[] = [];
  collections: Collection[] = [];
  readingProgress: ReadingProgress[] = [];
  bookmarks: Bookmark[] = [];
  personalNotes: PersonalNote[] = [];

  // Financial Ledger & Wallets
  ledgerAccounts: LedgerAccount[] = [];
  walletAccounts: WalletAccount[] = [];
  ledgerTransactions: LedgerTransaction[] = [];
  ledgerEntries: LedgerEntry[] = [];
  depositAttempts: DepositAttempt[] = [];
  orders: Order[] = [];
  entitlements: Entitlement[] = [];
  payoutBatches: PayoutBatch[] = [];
  payoutItems: PayoutItem[] = [];
  refunds: RefundRecord[] = [];
  processedWebhooks: Set<string> = new Set();

  // Administration, Moderation & Operations
  reports: ContentReport[] = [];
  auditLogs: AuditLogEntry[] = [];
  notifications: NotificationItem[] = [];
  supportTickets: SupportTicket[] = [];
  announcements: PlatformAnnouncement[] = [];
  websiteContent: WebsiteContentConfig = {
    heroTitle: "Authentic course notes from your lecturers.",
    heroSubtitle: "Exam-focused revision notes and past papers. Free previews. Instant MTN and Airtel Mobile Money unlock.",
    featuredCourseCodes: ["BBA 1204", "CSC 1100", "MEC 2101", "ACC 2102", "ENG 1102"],
    contactEmail: "support@somaug.ac.ug",
    supportPhone: "+256 770 000 001",
    updatedAt: new Date().toISOString(),
  };
  settings: PlatformSettings = {
    commissionPercent: 15,
    minDocumentPriceUGX: 500,
    maxDocumentPriceUGX: 100000,
    minDepositUGX: 1000,
    minLecturerPayoutUGX: 10000,
    studentWithdrawalFeeUGX: 500,
    lecturerPayoutFeeUGX: 0,
    payoutScheduleDay: "Friday",
  };

  constructor() {
    this.seedInitialData();
  }

  resetAndSeed() {
    this.institutions = [];
    this.programmes = [];
    this.courses = [];
    this.profiles = [];
    this.userRoles.clear();
    this.lecturerProfiles = [];
    this.documents = [];
    this.documentVersions = [];
    this.collections = [];
    this.readingProgress = [];
    this.bookmarks = [];
    this.personalNotes = [];
    this.ledgerAccounts = [];
    this.walletAccounts = [];
    this.ledgerTransactions = [];
    this.ledgerEntries = [];
    this.depositAttempts = [];
    this.orders = [];
    this.entitlements = [];
    this.payoutBatches = [];
    this.payoutItems = [];
    this.refunds = [];
    this.processedWebhooks.clear();
    this.reports = [];
    this.auditLogs = [];
    this.notifications = [];
    this.supportTickets = [];
    this.announcements = [];
    this.settings = {
      commissionPercent: 15,
      minDocumentPriceUGX: 500,
      maxDocumentPriceUGX: 100000,
      minDepositUGX: 1000,
      minLecturerPayoutUGX: 10000,
      studentWithdrawalFeeUGX: 500,
      lecturerPayoutFeeUGX: 0,
      payoutScheduleDay: "Friday",
    };
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = "2026-11-01T08:00:00.000Z";

    // 1. Chart of Accounts
    this.ledgerAccounts = [
      {
        id: "acc-clearing-mtn",
        code: "1010-CLEARING-MTN",
        name: "MTN Mobile Money Clearing Account",
        type: "asset",
        currency: "UGX",
        description: "Cash collected via MTN MoMo awaiting settlement",
        isActive: true,
        createdAt: now,
      },
      {
        id: "acc-clearing-airtel",
        code: "1020-CLEARING-AIRTEL",
        name: "Airtel Money Clearing Account",
        type: "asset",
        currency: "UGX",
        description: "Cash collected via Airtel Money awaiting settlement",
        isActive: true,
        createdAt: now,
      },
      {
        id: "acc-student-wallets",
        code: "2010-STUDENT-WALLETS",
        name: "Student Wallet Liabilities",
        type: "liability",
        currency: "UGX",
        description: "Unused student deposits held in internal wallets",
        isActive: true,
        createdAt: now,
      },
      {
        id: "acc-lecturer-payables",
        code: "2020-LECTURER-PAYABLES",
        name: "Lecturer Earnings Payables",
        type: "liability",
        currency: "UGX",
        description: "Net earnings credited to lecturers awaiting payout",
        isActive: true,
        createdAt: now,
      },
      {
        id: "acc-payout-reserves",
        code: "2030-PAYOUT-RESERVES",
        name: "Reserved Payout & Withdrawal Obligations",
        type: "liability",
        currency: "UGX",
        description: "Funds reserved during in-flight mobile money payouts",
        isActive: true,
        createdAt: now,
      },
      {
        id: "acc-commission-rev",
        code: "4010-COMMISSION-REVENUE",
        name: "Platform Commission Revenue",
        type: "revenue",
        currency: "UGX",
        description: "Earned marketplace commission on verified document sales",
        isActive: true,
        createdAt: now,
      },
    ];

    // 2. Ugandan Higher Education Institutions (Universities, Technical & Vocational Institutes)
    this.institutions = [
      // Major Universities
      {
        id: "inst-mak",
        name: "Makerere University",
        shortCode: "MAK",
        location: "Makerere Hill, Kampala",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-kyu",
        name: "Kyambogo University",
        shortCode: "KYU",
        location: "Banda, Kampala",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-must",
        name: "Mbarara University of Science and Technology",
        shortCode: "MUST",
        location: "Mbarara City",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-mubs",
        name: "Makerere University Business School",
        shortCode: "MUBS",
        location: "Nakawa, Kampala",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-ucu",
        name: "Uganda Christian University",
        shortCode: "UCU",
        location: "Mukono Main Campus",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-kiu",
        name: "Kampala International University",
        shortCode: "KIU",
        location: "Kansanga / Ishaka",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-gulu",
        name: "Gulu University",
        shortCode: "GU",
        location: "Gulu City, Northern Uganda",
        category: "university",
        isVerified: true,
        createdAt: now,
      },
      // Technical & Vocational Institutes
      {
        id: "inst-bribte",
        name: "Buganda Royal Institute of Business and Technical Education",
        shortCode: "BRIBTE",
        location: "Mengo, Kampala",
        category: "vocational_polytechnic",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-kpm",
        name: "Kampala Polytechnic Mengo",
        shortCode: "KPM",
        location: "Mengo, Kampala",
        category: "vocational_polytechnic",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-uict",
        name: "Uganda Institute of Information and Communications Technology",
        shortCode: "UICT",
        location: "Nakawa, Kampala",
        category: "vocational_polytechnic",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-nvtc",
        name: "Nakawa Vocational Training College",
        shortCode: "NVTC",
        location: "Nakawa Industrial Area",
        category: "vocational_polytechnic",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-ymca",
        name: "YMCA Comprehensive Institute",
        shortCode: "YMCA",
        location: "Wandegeya / Buwambo",
        category: "college",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-utc-k",
        name: "Uganda Technical College, Kichwamba",
        shortCode: "UTC-K",
        location: "Fort Portal, Kabarole",
        category: "vocational_polytechnic",
        isVerified: true,
        createdAt: now,
      },
      {
        id: "inst-ldc",
        name: "Law Development Centre",
        shortCode: "LDC",
        location: "Kagugube, Kampala / Mbarara",
        category: "specialized",
        isVerified: true,
        createdAt: now,
      },
    ];

    // 3. Programmes
    this.programmes = [
      {
        id: "prog-bsse",
        institutionId: "inst-mak",
        code: "BSSE",
        name: "Bachelor of Science in Software Engineering",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      {
        id: "prog-bcs",
        institutionId: "inst-mak",
        code: "BCS",
        name: "Bachelor of Computer Science",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      {
        id: "prog-llb",
        institutionId: "inst-mak",
        code: "LLB",
        name: "Bachelor of Laws",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      {
        id: "prog-bba",
        institutionId: "inst-mubs",
        code: "BBA",
        name: "Bachelor of Business Administration",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      {
        id: "prog-beng",
        institutionId: "inst-kyu",
        code: "BENG",
        name: "Bachelor of Engineering in Civil & Building",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      {
        id: "prog-mbchb",
        institutionId: "inst-must",
        code: "MBChB",
        name: "Bachelor of Medicine and Bachelor of Surgery",
        degreeLevel: "bachelors",
        createdAt: now,
      },
      // Technical & Vocational Programmes (UBTEB & National Diploma)
      {
        id: "prog-bribte-ndee",
        institutionId: "inst-bribte",
        code: "NDEE",
        name: "National Diploma in Electrical Engineering (UBTEB)",
        degreeLevel: "diploma",
        createdAt: now,
      },
      {
        id: "prog-kpm-auto",
        institutionId: "inst-kpm",
        code: "NCAM",
        name: "National Certificate in Automotive Mechanics & Technology",
        degreeLevel: "certificate",
        createdAt: now,
      },
      {
        id: "prog-uict-telecom",
        institutionId: "inst-uict",
        code: "NDTC",
        name: "National Diploma in Telecommunications & ICT Infrastructure",
        degreeLevel: "diploma",
        createdAt: now,
      },
      {
        id: "prog-ldc-bar",
        institutionId: "inst-ldc",
        code: "BAR",
        name: "Postgraduate Bar Course (Civil & Criminal Litigation)",
        degreeLevel: "postgraduate",
        createdAt: now,
      },
    ];

    // 4. Course Units
    this.courses = [
      {
        id: "course-csc2101",
        programmeId: "prog-bsse",
        institutionId: "inst-mak",
        code: "CSC 2101",
        name: "Data Structures and Algorithms",
        year: 2,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-bribte-ee",
        programmeId: "prog-bribte-ndee",
        institutionId: "inst-bribte",
        code: "EE 1101",
        name: "Domestic & 3-Phase Industrial Electrical Installation",
        year: 1,
        semester: 2,
        createdAt: now,
      },
      {
        id: "course-kpm-auto",
        programmeId: "prog-kpm-auto",
        institutionId: "inst-kpm",
        code: "AUT 2102",
        name: "Motor Vehicle Engine Overhaul & ECU Diagnostics",
        year: 2,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-uict-telecom",
        programmeId: "prog-uict-telecom",
        institutionId: "inst-uict",
        code: "TLC 1204",
        name: "Fibre Optic Splicing, Fusion Welding & Structured Cabling",
        year: 1,
        semester: 2,
        createdAt: now,
      },
      {
        id: "course-ldc-civil",
        programmeId: "prog-ldc-bar",
        institutionId: "inst-ldc",
        code: "CP 101",
        name: "Civil Litigation & Trial Advocacy Practice Guide",
        year: 1,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-bsse3102",
        programmeId: "prog-bsse",
        institutionId: "inst-mak",
        code: "BSSE 3102",
        name: "Distributed Systems & Cloud Architecture",
        year: 3,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-law2105",
        programmeId: "prog-llb",
        institutionId: "inst-mak",
        code: "LAW 2105",
        name: "Constitutional Law & Legal Systems of Uganda",
        year: 2,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-acc1102",
        programmeId: "prog-bba",
        institutionId: "inst-mubs",
        code: "ACC 1102",
        name: "Principles of Financial Accounting (IFRS & ICPAU)",
        year: 1,
        semester: 1,
        createdAt: now,
      },
      {
        id: "course-civ2201",
        programmeId: "prog-beng",
        institutionId: "inst-kyu",
        code: "CIV 2201",
        name: "Structural Mechanics & Reinforced Concrete Design",
        year: 2,
        semester: 2,
        createdAt: now,
      },
      {
        id: "course-med2104",
        programmeId: "prog-mbchb",
        institutionId: "inst-must",
        code: "MED 2104",
        name: "Clinical Pharmacology & Tropical Infectious Diseases",
        year: 2,
        semester: 1,
        createdAt: now,
      },
    ];

    // 5. Default Users (Student, Approved Lecturer, Pending Lecturer, Admin)
    this.profiles = [
      {
        id: "user-student-1",
        email: "namukasa.grace@students.mak.ac.ug",
        fullName: "Grace Namukasa",
        phoneNumber: "256772112233",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        academicYear: 2,
        semester: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-student-2",
        email: "mugisha.ivan@students.mubs.ac.ug",
        fullName: "Ivan Mugisha (Class Coordinator)",
        phoneNumber: "256701445566",
        institutionId: "inst-mubs",
        programmeId: "prog-bba",
        academicYear: 1,
        semester: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-lecturer-1",
        email: "prof.okello@cis.mak.ac.ug",
        fullName: "Assoc. Prof. David Okello",
        phoneNumber: "256774998877",
        institutionId: "inst-mak",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-lecturer-2",
        email: "dr.nakato@law.mak.ac.ug",
        fullName: "Dr. Sarah Nakato",
        phoneNumber: "256702334455",
        institutionId: "inst-mak",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-lecturer-pending",
        email: "kato.peter@kyu.ac.ug",
        fullName: "Eng. Peter Kato",
        phoneNumber: "256782556677",
        institutionId: "inst-kyu",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-admin-1",
        email: "admin@ugandastudy.ug",
        fullName: "Platform Chief Comptroller",
        phoneNumber: "256770000001",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-admin-develijah",
        email: "develijah27@gmail.com",
        fullName: "Elijah Hannington (Admin)",
        phoneNumber: "256770000000",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-lec-hannington",
        email: "elijahhannington8@gmail.com",
        fullName: "Hannington (Lecturer)",
        phoneNumber: "256770000000",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-stu-daniel",
        email: "daniellle@gmail.com",
        fullName: "Lukungiri Daniel",
        phoneNumber: "256750000000",
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.userRoles.set("user-student-1", ["student"]);
    this.userRoles.set("user-student-2", ["student"]);
    this.userRoles.set("user-stu-daniel", ["student"]);
    this.userRoles.set("user-lecturer-1", ["lecturer"]);
    this.userRoles.set("user-lecturer-2", ["lecturer"]);
    this.userRoles.set("user-lec-hannington", ["lecturer"]);
    this.userRoles.set("user-lecturer-pending", ["lecturer"]);
    this.userRoles.set("user-admin-1", ["admin"]);
    this.userRoles.set("user-admin-develijah", ["admin"]);

    // 6. Lecturer Profiles
    this.lecturerProfiles = [
      {
        id: "lec-hannington",
        userId: "user-lec-hannington",
        fullName: "Hannington (Lecturer)",
        institutionId: "inst-mak",
        department: "Department of Software Engineering (CoCIS)",
        teachingRole: "Senior Lecturer",
        institutionalEmail: "elijahhannington8@gmail.com",
        verificationEvidenceUrl: "private://verifications/mak-staff-hannington.pdf",
        verificationStatus: "approved",
        reviewedBy: "user-admin-develijah",
        reviewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "lec-1",
        userId: "user-lecturer-1",
        fullName: "Assoc. Prof. David Okello",
        institutionId: "inst-mak",
        department: "Department of Networks & Software Engineering (CoCIS)",
        teachingRole: "Associate Professor & Course Coordinator",
        institutionalEmail: "prof.okello@cis.mak.ac.ug",
        verificationEvidenceUrl: "private://verifications/mak-staff-id-okello.pdf",
        verificationStatus: "approved",
        reviewedBy: "user-admin-1",
        reviewedAt: now,
        payoutMobileNumber: "256774998877",
        payoutNetwork: "MTN",
        payoutAccountName: "DAVID OKELLO",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "lec-2",
        userId: "user-lecturer-2",
        fullName: "Dr. Sarah Nakato",
        institutionId: "inst-mak",
        department: "School of Law - Public & Comparative Law",
        teachingRole: "Senior Lecturer",
        institutionalEmail: "dr.nakato@law.mak.ac.ug",
        verificationEvidenceUrl: "private://verifications/mak-staff-id-nakato.pdf",
        verificationStatus: "approved",
        reviewedBy: "user-admin-1",
        reviewedAt: now,
        payoutMobileNumber: "256702334455",
        payoutNetwork: "AIRTEL",
        payoutAccountName: "SARAH NAKATO",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "lec-pending",
        userId: "user-lecturer-pending",
        fullName: "Eng. Peter Kato",
        institutionId: "inst-kyu",
        department: "Department of Civil & Building Engineering",
        teachingRole: "Assistant Lecturer",
        institutionalEmail: "kato.peter@kyu.ac.ug",
        verificationEvidenceUrl: "private://verifications/kyu-appointment-kato.pdf",
        verificationStatus: "under_review",
        payoutMobileNumber: "256782556677",
        payoutNetwork: "MTN",
        payoutAccountName: "PETER KATO",
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 7. Initial Wallets and Balanced Opening Deposit for Student 1 (UGX 25,000)
    this.walletAccounts = [
      {
        id: "wallet-student-1",
        userId: "user-student-1",
        walletType: "student",
        currency: "UGX",
        ledgerAccountId: "acc-student-wallets",
        spendableBalanceUGX: 25000,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234", // PIN: 1234
        pinAttempts: 0,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wallet-student-2",
        userId: "user-student-2",
        walletType: "student",
        currency: "UGX",
        ledgerAccountId: "acc-student-wallets",
        spendableBalanceUGX: 3000,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234",
        pinAttempts: 0,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wallet-lecturer-1",
        userId: "user-lecturer-1",
        walletType: "lecturer",
        currency: "UGX",
        ledgerAccountId: "acc-lecturer-payables",
        spendableBalanceUGX: 17000,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234",
        pinAttempts: 0,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wallet-lecturer-2",
        userId: "user-lecturer-2",
        walletType: "lecturer",
        currency: "UGX",
        ledgerAccountId: "acc-lecturer-payables",
        spendableBalanceUGX: 8500,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234",
        pinAttempts: 0,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed initial balanced ledger transactions matching the opening wallet balances
    // Student 1 deposit: 25,000 UGX
    // Student 2 deposit: 3,000 UGX
    // Historical sales: 20,000 UGX (Lecturer 1 net 17,000 + Platform 3,000) and 10,000 UGX (Lecturer 2 net 8,500 + Platform 1,500)
    this.ledgerTransactions = [
      {
        id: "tx-seed-dep-1",
        reference: "TX-SEED-DEP-001",
        type: "deposit",
        status: "posted",
        description: "Initial MTN MoMo Deposit for Grace Namukasa",
        postedAt: now,
        createdAt: now,
      },
      {
        id: "tx-seed-dep-2",
        reference: "TX-SEED-DEP-002",
        type: "deposit",
        status: "posted",
        description: "Initial Airtel Money Deposit for Ivan Mugisha",
        postedAt: now,
        createdAt: now,
      },
      {
        id: "tx-seed-hist-sales",
        reference: "TX-SEED-HIST-003",
        type: "purchase",
        status: "posted",
        description: "Historical Opening Sales Settlement",
        postedAt: now,
        createdAt: now,
      },
    ];

    this.ledgerEntries = [
      // TX 1: 25,000 UGX Student 1 deposit
      { id: "le-1", transactionId: "tx-seed-dep-1", accountId: "acc-clearing-mtn", debitUGX: 25000, creditUGX: 0, entrySequence: 1, createdAt: now },
      { id: "le-2", transactionId: "tx-seed-dep-1", accountId: "acc-student-wallets", debitUGX: 0, creditUGX: 25000, entrySequence: 2, createdAt: now },
      // TX 2: 3,000 UGX Student 2 deposit
      { id: "le-3", transactionId: "tx-seed-dep-2", accountId: "acc-clearing-airtel", debitUGX: 3000, creditUGX: 0, entrySequence: 1, createdAt: now },
      { id: "le-4", transactionId: "tx-seed-dep-2", accountId: "acc-student-wallets", debitUGX: 0, creditUGX: 3000, entrySequence: 2, createdAt: now },
      // TX 3: 30,000 UGX Historical Sales (17,000 Lec 1 + 8,500 Lec 2 + 4,500 Commission)
      { id: "le-5", transactionId: "tx-seed-hist-sales", accountId: "acc-clearing-mtn", debitUGX: 30000, creditUGX: 0, entrySequence: 1, createdAt: now },
      { id: "le-6", transactionId: "tx-seed-hist-sales", accountId: "acc-lecturer-payables", debitUGX: 0, creditUGX: 25500, entrySequence: 2, createdAt: now },
      { id: "le-7", transactionId: "tx-seed-hist-sales", accountId: "acc-commission-rev", debitUGX: 0, creditUGX: 4500, entrySequence: 3, createdAt: now },
    ];

    // 8. Published Academic Documents (Retained in automated test suite; empty in production until authorized uploads)
    const isTestEnvironment =
      typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" || process.env.VITEST === "true");

    if (isTestEnvironment) {
      this.documents = [
      {
        id: "doc-csc2101-notes",
        accessCode: "CSC2101-NOTES",
        lecturerId: "lec-1",
        title: "CSC 2101: Data Structures and Algorithms Notes",
        description:
          "Comprehensive 48-page lecture notes covering Asymptotic Analysis, Trees, AVL Balances, Graph Traversals (BFS/DFS), Dijkstra's Shortest Path, and Dynamic Programming with worked examination case studies.",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        courseUnitId: "course-csc2101",
        documentType: "lecture_notes",
        priceUGX: 5000,
        pageCount: 48,
        fileSizeBytes: 2450800,
        currentVersion: 2,
        status: "published",
        topics: ["Data Structures", "Algorithms", "Graph Theory", "Big-O Notation", "Trees"],
        allowedPreviewPages: [1, 2, 3],
        storageKey: "docs/mak-csc2101-v2.pdf",
        checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        viewsCount: 342,
        salesCount: 84,
        ratingAverage: 4.9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-csc2101-pastpapers",
        accessCode: "CSC2101-PAPERS",
        lecturerId: "lec-1",
        title: "CSC 2101: Solved Past Papers and Guide",
        description:
          "Step-by-step model solutions, complexity proofs, and C/Java code implementations for final examinations from 2021 to 2025, including common examiner pitfalls.",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        courseUnitId: "course-csc2101",
        documentType: "past_paper_solution",
        priceUGX: 3500,
        pageCount: 28,
        fileSizeBytes: 1840000,
        currentVersion: 1,
        status: "published",
        topics: ["Past Papers", "Model Solutions", "CSC 2101", "Exam Prep"],
        allowedPreviewPages: [1, 2],
        storageKey: "docs/mak-csc2101-pastpapers-v1.pdf",
        checksumSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        viewsCount: 510,
        salesCount: 129,
        ratingAverage: 4.8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-bsse3102-cloud",
        accessCode: "BSSE3102-LAB",
        lecturerId: "lec-1",
        title: "BSSE 3102: Distributed Systems Lab Manual",
        description:
          "Practical guide covering Raft Consensus, Vector Clocks, gRPC, Idempotent Payment Ledgers, and Fault-Tolerant Distributed Transactions.",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        courseUnitId: "course-bsse3102",
        documentType: "lab_manual",
        priceUGX: 8000,
        pageCount: 64,
        fileSizeBytes: 4120000,
        currentVersion: 1,
        status: "published",
        topics: ["Distributed Systems", "Raft", "Microservices", "Cloud Computing"],
        allowedPreviewPages: [1, 2, 3, 4],
        storageKey: "docs/mak-bsse3102-lab-v1.pdf",
        checksumSha256: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        viewsCount: 195,
        salesCount: 41,
        ratingAverage: 4.9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-law2105-constitution",
        accessCode: "LAW2105-CASE",
        lecturerId: "lec-2",
        title: "LAW 2105: Constitutional Law and Notes",
        description:
          "Authoritative casebook and analytical commentary on the 1995 Constitution of the Republic of Uganda, Separation of Powers, Human Rights Enforcement (Article 50), and Electoral Jurisprudence.",
        institutionId: "inst-mak",
        programmeId: "prog-llb",
        courseUnitId: "course-law2105",
        documentType: "study_guide",
        priceUGX: 10000,
        pageCount: 92,
        fileSizeBytes: 5600000,
        currentVersion: 1,
        status: "published",
        topics: ["Constitutional Law", "1995 Constitution", "Uganda Jurisprudence", "Human Rights"],
        allowedPreviewPages: [1, 2, 3, 4, 5],
        storageKey: "docs/mak-law2105-casebook-v1.pdf",
        checksumSha256: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
        viewsCount: 420,
        salesCount: 96,
        ratingAverage: 5.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-short-2page-summary",
        accessCode: "CSC2101-CHEAT",
        lecturerId: "lec-1",
        title: "CSC 2101: Big-O Complexity Summary",
        description:
          "High-density 2-page reference sheet for Master Theorem, Common Data Structure Operations, and Sorting Algorithm complexities.",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        courseUnitId: "course-csc2101",
        documentType: "curriculum_summary",
        priceUGX: 2000,
        pageCount: 2,
        fileSizeBytes: 320000,
        currentVersion: 1,
        status: "published",
        topics: ["Big-O", "Master Theorem", "Cheat Sheet"],
        allowedPreviewPages: [], // Strictly 0 preview pages for 1-2 page documents
        storageKey: "docs/mak-csc2101-cheatsheet-v1.pdf",
        checksumSha256: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        viewsCount: 280,
        salesCount: 112,
        ratingAverage: 4.7,
        createdAt: now,
        updatedAt: now,
      },
      // Vocational, Polytechnic & Specialized Institute Course Materials
      {
        id: "doc-bribte-electrical",
        accessCode: "BRIBTE-EE1101",
        lecturerId: "lec-1",
        title: "EE 1101: Industrial Electrical Installation Manual",
        description:
          "Practical UBTEB syllabus handbook covering consumer units, conduit piping, earthing systems, 3-phase motor starters, solar PV wiring, and safety standards approved for Buganda Royal Institute technicians.",
        institutionId: "inst-bribte",
        programmeId: "prog-bribte-ndee",
        courseUnitId: "course-bribte-ee",
        documentType: "lab_manual",
        priceUGX: 4000,
        pageCount: 36,
        fileSizeBytes: 2100000,
        currentVersion: 1,
        status: "published",
        topics: ["Electrical Installation", "Solar PV", "UBTEB", "Conduit Piping", "3-Phase"],
        allowedPreviewPages: [1, 2],
        storageKey: "docs/bribte-ee1101-v1.pdf",
        checksumSha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        viewsCount: 215,
        salesCount: 58,
        ratingAverage: 4.9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-kpm-automotive",
        accessCode: "KPM-AUT2102",
        lecturerId: "lec-1",
        title: "AUT 2102: Automotive Engine Overhaul Handbook",
        description:
          "Step-by-step automotive workshop manual for cylinder head resurfacing, piston ring clearance, turbocharger troubleshooting, and electronic fuel injection diagnostics for Kampala Polytechnic engineering students.",
        institutionId: "inst-kpm",
        programmeId: "prog-kpm-auto",
        courseUnitId: "course-kpm-auto",
        documentType: "lab_manual",
        priceUGX: 4500,
        pageCount: 42,
        fileSizeBytes: 3100000,
        currentVersion: 1,
        status: "published",
        topics: ["Automotive Engineering", "Diesel Engines", "ECU Diagnostics", "Overhaul"],
        allowedPreviewPages: [1, 2, 3],
        storageKey: "docs/kpm-aut2102-v1.pdf",
        checksumSha256: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c",
        viewsCount: 180,
        salesCount: 49,
        ratingAverage: 4.8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "doc-uict-telecom",
        accessCode: "UICT-TLC1204",
        lecturerId: "lec-1",
        title: "TLC 1204: Fibre Optic Splicing Guide",
        description:
          "Field technician practical guide for optical fiber fusion splicing, attenuation decibel measurements, patch panel termination, and fiber-to-the-home (FTTH) deployment in Uganda.",
        institutionId: "inst-uict",
        programmeId: "prog-uict-telecom",
        courseUnitId: "course-uict-telecom",
        documentType: "study_guide",
        priceUGX: 5000,
        pageCount: 38,
        fileSizeBytes: 2800000,
        currentVersion: 1,
        status: "published",
        topics: ["Fibre Optics", "OTDR", "Fusion Splicing", "Telecommunications", "UICT"],
        allowedPreviewPages: [1, 2],
        storageKey: "docs/uict-tlc1204-v1.pdf",
        checksumSha256: "7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d",
        viewsCount: 310,
        salesCount: 76,
        ratingAverage: 5.0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.documentVersions = [
      {
        id: "ver-1",
        documentId: "doc-csc2101-notes",
        versionNumber: 1,
        changeSummary: "Initial 2025/2026 Semester I release",
        storageKey: "docs/mak-csc2101-v1.pdf",
        pageCount: 44,
        fileSizeBytes: 2200000,
        checksumSha256: "aa11",
        isCurrent: false,
        uploadedAt: "2026-08-15T10:00:00.000Z",
      },
      {
        id: "ver-2",
        documentId: "doc-csc2101-notes",
        versionNumber: 2,
        changeSummary: "Added 4 new pages on Red-Black Trees and 2026 Mid-Semester solutions",
        storageKey: "docs/mak-csc2101-v2.pdf",
        pageCount: 48,
        fileSizeBytes: 2450800,
        checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        isCurrent: true,
        uploadedAt: now,
      },
    ];

    // 9. Lecturer-Generated Course Resource Collections
    this.collections = [
      {
        id: "col-mak-csc2101-pack",
        lecturerId: "lec-1",
        title: "Makerere CSC 2101 Complete Semester I Study Pack (2026/2027)",
        description:
          "Official course bundle curated by Assoc. Prof. David Okello for Year 2 Software Engineering & Computer Science students. Share this collection link or QR code in your class WhatsApp group.",
        institutionId: "inst-mak",
        courseUnitId: "course-csc2101",
        isPublished: true,
        shareCode: "MAK-CSC2101-2026",
        documentIds: ["doc-csc2101-notes", "doc-csc2101-pastpapers", "doc-short-2page-summary"],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "col-mak-law2105-pack",
        lecturerId: "lec-2",
        title: "LLB Year 2 Constitutional Law Core Reading Collection",
        description:
          "Essential Constitutional Law casebook and revision materials curated by Dr. Sarah Nakato.",
        institutionId: "inst-mak",
        courseUnitId: "course-law2105",
        isPublished: true,
        shareCode: "MAK-LAW2105-2026",
        documentIds: ["doc-law2105-constitution"],
        createdAt: now,
        updatedAt: now,
      },
    ];
    } else {
      // In production and live environments, do not present dummy mock documents as genuine.
      // Real publications must originate from authorized lecturer uploads.
      this.documents = [];
      this.documentVersions = [];
      this.collections = [];
    }

    // 10. Sample Moderation & Copyright Report
    this.reports = [
      {
        id: "rep-1",
        reporterId: "user-student-1",
        documentId: "doc-csc2101-pastpapers",
        category: "document_error",
        details: "Typo on page 14 Question 3(b): Dijkstra priority queue weight should be 12 instead of 21.",
        status: "open",
        createdAt: now,
      },
    ];

    // 11. Sample Notifications
    this.notifications = [
      {
        id: "notif-1",
        userId: "user-student-1",
        title: "Wallet Funded via MTN Mobile Money",
        message: "Your deposit of UGX 25,000 has been confirmed and credited to your student wallet.",
        category: "wallet",
        isRead: false,
        createdAt: now,
      },
      {
        id: "notif-2",
        userId: "user-lecturer-1",
        title: "Verification Approved",
        message: "Your Makerere University lecturer profile is verified. You can now publish materials and receive weekly payouts.",
        category: "verification",
        isRead: true,
        createdAt: now,
      },
    ];

    // 12. Support & Complaints Tickets
    this.supportTickets = [
      {
        id: "ticket-101",
        ticketNumber: "TK-2026-081",
        userId: "user-student-1",
        userEmail: "grace.namukasa@somaug.ac.ug",
        userName: "Grace Namukasa",
        category: "payment_issue",
        subject: "Airtel Money prompt delayed on CSC 2101 notes",
        message: "I initiated a deposit of UGX 5,000 via Airtel Money 0750000001. The prompt took 2 minutes to pop up, but wallet was credited successfully.",
        status: "resolved",
        priority: "normal",
        relatedEntityId: "ord-test-sample-01",
        assignedAdmin: "develijah27@gmail.com",
        resolutionNotes: "System confirms webhook event was processed and order entitlement granted automatically.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ticket-102",
        ticketNumber: "TK-2026-082",
        userId: "user-lecturer-2",
        userEmail: "okello.david@kyu.ac.ug",
        userName: "Dr. David Okello",
        category: "lecturer_verification",
        subject: "Departmental appointment letter attached for Kyambogo",
        message: "Attached my formal appointment letter for Senior Lecturer in Department of Accounting and Finance. Please review my publishing status.",
        status: "open",
        priority: "high",
        relatedEntityId: "lec-2",
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 13. Platform & Academic Announcements
    this.announcements = [
      {
        id: "ann-1",
        title: "Semester I Examination Revision Window Active",
        message: "All verified lecturers across Makerere, Kyambogo, MUST, and MUBS are requested to publish verified past paper solutions and outline guides ahead of final assessments.",
        audience: "all",
        priority: "important",
        type: "academic",
        publishedBy: "Academic Board",
        createdAt: now,
      },
      {
        id: "ann-2",
        title: "MTN & Airtel Direct Push Instant Settlement Live",
        message: "Mobile money wallet deposits and purchases now execute with direct instantaneous webhook confirmation across Uganda networks.",
        audience: "students",
        priority: "normal",
        type: "payment",
        publishedBy: "Financial Operations",
        createdAt: now,
      },
    ];
  }
}

// Global singleton so Next.js route handlers and server components share state in dev/test
const globalForStore = globalThis as unknown as { marketplaceStore?: MarketplaceStore };

export const dbStore = globalForStore.marketplaceStore || new MarketplaceStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.marketplaceStore = dbStore;
}

