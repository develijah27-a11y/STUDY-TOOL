import { describe, it, expect } from "vitest";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";

describe("Access Control & Role Boundaries (Part III Rules)", () => {
  const studentContext: UserAuthContext = {
    userId: "user-student-1",
    email: "student@mak.ac.ug",
    roles: ["student"],
  };

  const unverifiedLecturerContext: UserAuthContext = {
    userId: "user-lecturer-pending",
    email: "lecturer@mak.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-pending",
      verificationStatus: "under_review",
      institutionId: "inst-mak",
    },
  };

  const approvedLecturerContext: UserAuthContext = {
    userId: "user-lecturer-approved",
    email: "prof.okello@mak.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-approved-1",
      verificationStatus: "approved",
      institutionId: "inst-mak",
    },
  };

  const otherLecturerContext: UserAuthContext = {
    userId: "user-lecturer-other",
    email: "dr.mutesi@kyu.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-approved-2",
      verificationStatus: "approved",
      institutionId: "inst-kyu",
    },
  };

  const adminContext: UserAuthContext = {
    userId: "user-admin-1",
    email: "admin@platform.ug",
    roles: ["admin"],
  };

  it("Rule: Student cannot publish educational materials", () => {
    expect(AuthorizationGuard.canPublish(studentContext)).toBe(false);
  });

  it("Rule: Unverified or pending lecturer cannot publish", () => {
    expect(AuthorizationGuard.canPublish(unverifiedLecturerContext)).toBe(false);
  });

  it("Rule: Approved lecturer can publish", () => {
    expect(AuthorizationGuard.canPublish(approvedLecturerContext)).toBe(true);
  });

  it("Rule: Class coordinators are ordinary students and cannot manage collections", () => {
    // Even if student calls themselves coordinator, they have student role
    expect(AuthorizationGuard.canManageCollection(studentContext, "lec-approved-1")).toBe(false);
  });

  it("Rule: Lecturer cannot manage another lecturer's document", () => {
    const documentOwnerId = "lec-approved-1";
    // approved lecturer 1 CAN manage
    expect(AuthorizationGuard.canManageDocument(approvedLecturerContext, documentOwnerId)).toBe(true);
    // approved lecturer 2 CANNOT manage lecturer 1's document
    expect(AuthorizationGuard.canManageDocument(otherLecturerContext, documentOwnerId)).toBe(false);
  });

  it("Rule: Student cannot inspect another student's wallet", () => {
    expect(AuthorizationGuard.canAccessWallet(studentContext, "user-student-1")).toBe(true);
    expect(AuthorizationGuard.canAccessWallet(studentContext, "user-student-2")).toBe(false);
  });

  it("Rule: Administrator can access wallet for financial investigations and audit", () => {
    expect(AuthorizationGuard.canAccessWallet(adminContext, "user-student-1")).toBe(true);
  });
});

