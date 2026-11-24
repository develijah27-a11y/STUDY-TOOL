/**
 * Domain types for Uganda Academic Document Marketplace.
 * Platform recognizes strictly 4 roles: Student, Lecturer, Administrator, Developer.
 */

export type UserRole = "student" | "lecturer" | "admin" | "developer";

export type LecturerVerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended";

export type DocumentStatus =
  | "draft"
  | "under_review"
  | "published"
  | "unpublished"
  | "archived"
  | "flagged"
  | "takedown";

export type DocumentType =
  | "lecture_notes"
  | "study_guide"
  | "past_paper_solution"
  | "lab_manual"
  | "assignment_guide"
  | "curriculum_summary"
  | "textbook_supplement";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  institutionId?: string;
  programmeId?: string;
  academicYear?: number;
  semester?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerProfile {
  id: string;
  userId: string;
  fullName: string;
  institutionId: string;
  department: string;
  teachingRole: string;
  institutionalEmail?: string;
  verificationEvidenceUrl?: string;
  verificationStatus: LecturerVerificationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  payoutMobileNumber?: string;
  payoutNetwork?: "MTN" | "AIRTEL";
  payoutAccountName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  shortCode: string; // e.g. "MAK", "KYU", "MUST", "UCU", "MUBS", "BRIBTE", "KPM", "UICT"
  location: string;
  category?: "university" | "vocational_polytechnic" | "college" | "specialized";
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Programme {
  id: string;
  institutionId: string;
  code: string; // e.g. "BSSE", "BIT", "BBL"
  name: string; // e.g. "Bachelor of Science in Software Engineering"
  degreeLevel: "certificate" | "diploma" | "bachelors" | "postgraduate" | "masters";
  createdAt: string;
}

export interface CourseUnit {
  id: string;
  programmeId: string;
  institutionId: string;
  code: string; // e.g. "CSC 2101"
  name: string; // e.g. "Data Structures and Algorithms"
  year: number; // 1, 2, 3, 4, 5
  semester: number; // 1, 2
  createdAt: string;
}

export interface Document {
  id: string;
  accessCode?: string; // Direct short code for WhatsApp & lecture sharing (e.g. "CSC2101-NOTES")
  lecturerId: string;
  title: string;
  description: string;
  institutionId: string;
  programmeId?: string;
  courseUnitId: string;
  documentType: DocumentType;
  priceUGX: number; // Exact integer UGX amount (e.g. 5000)
  pageCount: number;
  fileSizeBytes: number;
  currentVersion: number;
  status: DocumentStatus;
  topics: string[];
  allowedPreviewPages: number[]; // e.g. [1, 2, 3]
  storageKey: string;
  checksumSha256: string;
  viewsCount: number;
  salesCount: number;
  ratingAverage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  changeSummary: string;
  storageKey: string;
  pageCount: number;
  fileSizeBytes: number;
  checksumSha256: string;
  isCurrent: boolean;
  uploadedAt: string;
}

export interface Collection {
  id: string;
  lecturerId: string;
  title: string;
  description: string;
  institutionId: string;
  courseUnitId?: string;
  isPublished: boolean;
  shareCode: string;
  qrCodeDataUrl?: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  studentId: string;
  documentId: string;
  documentVersion: number;
  lastReadPage: number;
  totalPages: number;
  completionPercent: number;
  lastReadAt: string;
}

export interface Bookmark {
  id: string;
  studentId: string;
  documentId: string;
  pageNumber: number;
  title?: string;
  createdAt: string;
}

export interface PersonalNote {
  id: string;
  studentId: string;
  documentId: string;
  pageNumber: number;
  highlightCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: "payment_issue" | "document_access" | "lecturer_verification" | "technical_bug" | "general";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  relatedEntityId?: string;
  assignedAdmin?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  audience: "all" | "students" | "lecturers" | "institution";
  targetInstitutionId?: string;
  priority: "normal" | "important" | "critical";
  type: "platform" | "academic" | "maintenance" | "payment";
  publishedBy: string;
  createdAt: string;
}

export interface WebsiteContentConfig {
  heroTitle: string;
  heroSubtitle: string;
  bannerNotice?: string;
  featuredCourseCodes: string[];
  contactEmail: string;
  supportPhone: string;
  updatedAt: string;
}

