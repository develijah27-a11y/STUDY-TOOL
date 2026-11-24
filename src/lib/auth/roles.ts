import { UserRole, LecturerVerificationStatus } from "@/types/domain";

export interface UserAuthContext {
  userId: string;
  email: string;
  roles: UserRole[];
  lecturerProfile?: {
    id: string;
    verificationStatus: LecturerVerificationStatus;
    institutionId: string;
  };
}

/**
 * Enforces absolute authorization rules (Part III Section 7).
 * All checks are strictly evaluated server-side.
 */
export class AuthorizationGuard {
  static isStudent(context: UserAuthContext): boolean {
    return context.roles.includes("student");
  }

  static isAdmin(context: UserAuthContext): boolean {
    return context.roles.includes("admin");
  }

  static isDeveloper(context: UserAuthContext): boolean {
    return context.roles.includes("developer");
  }

  static hasAdminOrDevAccess(context: UserAuthContext): boolean {
    return context.roles.includes("admin") || context.roles.includes("developer");
  }

  static isApprovedLecturer(context: UserAuthContext): boolean {
    return (
      context.roles.includes("lecturer") &&
      context.lecturerProfile?.verificationStatus === "approved"
    );
  }

  /**
   * Rule: Only authorized lecturers or admins can publish educational materials
   */
  static canPublish(context: UserAuthContext): boolean {
    return this.isApprovedLecturer(context) || this.isAdmin(context);
  }

  /**
   * Rule: Only document owner or admin can edit or manage publication versions
   */
  static canManageDocument(context: UserAuthContext, documentLecturerId: string): boolean {
    if (this.isAdmin(context)) return true;
    return (
      this.isApprovedLecturer(context) &&
      context.lecturerProfile?.id === documentLecturerId
    );
  }

  /**
   * Rule: Class coordinators are ordinary students.
   * They cannot create, edit, publish or manage lecturer collections.
   * They can only forward existing public collection links/QR codes.
   */
  static canManageCollection(context: UserAuthContext, collectionLecturerId: string): boolean {
    if (this.isAdmin(context)) return true;
    return (
      this.isApprovedLecturer(context) &&
      context.lecturerProfile?.id === collectionLecturerId
    );
  }

  /**
   * Rule: Students can only access their own wallet, notes, receipts and purchases.
   */
  static canAccessWallet(context: UserAuthContext, targetUserId: string): boolean {
    return context.userId === targetUserId || this.isAdmin(context);
  }
}

