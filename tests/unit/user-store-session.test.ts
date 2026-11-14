import { describe, it, expect, beforeEach } from "vitest";
import {
  registerUser,
  verifyUserCredentials,
  createSessionToken,
  verifySessionToken,
  findUserByEmail,
} from "@/lib/auth/user-store";

describe("Authoritative User Store & Session Authentication", () => {
  const testEmail = "test.student@somaug.ac.ug";
  const testPass = "SecureUganda2026!";

  it("1. Successfully registers a new student and verifies credentials", () => {
    const user = registerUser({
      email: testEmail,
      password: testPass,
      fullName: "Test Student Kigozi",
      role: "student",
      institutionId: "inst-bribte",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.fullName).toBe("Test Student Kigozi");

    // Correct password matches
    const verified = verifyUserCredentials(testEmail, testPass);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);

    // Wrong password fails
    const failed = verifyUserCredentials(testEmail, "WrongPassword!");
    expect(failed).toBeNull();
  });

  it("2. Issues valid session token that decodes and verifies correctly", () => {
    const user = findUserByEmail(testEmail);
    expect(user).toBeDefined();

    const token = createSessionToken(user!);
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const verifiedUser = verifySessionToken(token);
    expect(verifiedUser).not.toBeNull();
    expect(verifiedUser?.id).toBe(user?.id);
    expect(verifiedUser?.email).toBe(testEmail);
  });

  it("3. Rejects invalid or tampered session tokens", () => {
    expect(verifySessionToken("invalid-token")).toBeNull();
    expect(verifySessionToken("random.signature")).toBeNull();
  });

  it("4. Supports default demo accounts out of the box", () => {
    const grace = verifyUserCredentials("namukasa.grace@students.mak.ac.ug", "Makerere2026!");
    expect(grace).not.toBeNull();
    expect(grace?.fullName).toBe("Grace Namukasa");
    expect(grace?.role).toBe("student");

    const lecturer = verifyUserCredentials("prof.okello@cis.mak.ac.ug", "Lecturer2026!");
    expect(lecturer).not.toBeNull();
    expect(lecturer?.role).toBe("lecturer");
  });
});

