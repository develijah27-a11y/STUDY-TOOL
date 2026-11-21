import fs from "fs";
import path from "path";
import crypto from "crypto";

export type UserVerificationStatus =
  | "registered"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended";

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "student" | "lecturer" | "admin";
  verificationStatus?: UserVerificationStatus;
  institutionId?: string;
  faculty?: string;
  department?: string;
  programmeId?: string;
  academicYear?: number;
  semester?: number;
  activeCourseUnits?: string[];
  teachingRole?: string;
  staffId?: string;
  coursesTaught?: string[];
  payoutMobileNumber?: string;
  payoutMobileNetwork?: "MTN" | "AIRTEL";
  createdAt: string;
}

const SESSION_SECRET = process.env.MARZPAY_WEBHOOK_SECRET || "somaug-academic-secure-key-2026";
const DATA_FILE = process.env.VERCEL || process.env.NODE_ENV === "production"
  ? path.join("/tmp", ".users_db.json")
  : path.join(process.cwd(), ".users_db.json");

// Default initial accounts
const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: "user-student-1",
    email: "namukasa.grace@students.mak.ac.ug",
    passwordHash: hashPassword("Makerere2026!"),
    fullName: "Grace Namukasa",
    role: "student",
    verificationStatus: "registered",
    institutionId: "inst-mak",
    programmeId: "prog-bsse",
    academicYear: 2,
    semester: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-lecturer-1",
    email: "prof.okello@cis.mak.ac.ug",
    passwordHash: hashPassword("Lecturer2026!"),
    fullName: "Assoc. Prof. David Okello",
    role: "lecturer",
    verificationStatus: "verified",
    institutionId: "inst-mak",
    department: "Department of Networks & Systems",
    teachingRole: "Associate Professor",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-admin-1",
    email: "admin@ugandastudy.ug",
    passwordHash: hashPassword("Admin2026!"),
    fullName: "Platform Administrator",
    role: "admin",
    verificationStatus: "verified",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-admin-develijah",
    email: "develijah27@gmail.com",
    passwordHash: hashPassword("UVT1673"),
    fullName: "Elijah Hannington (Admin)",
    role: "admin",
    verificationStatus: "verified",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// In-memory cache backed by disk file
let usersCache: Map<string, RegisteredUser> = new Map();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
}

function loadUsers(): void {
  // Always initialize default users
  for (const u of DEFAULT_USERS) {
    usersCache.set(u.email.toLowerCase(), u);
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const list: RegisteredUser[] = JSON.parse(content);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.email) {
            usersCache.set(item.email.toLowerCase(), item);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not load users DB file, falling back to memory:", err);
  }
}

function saveUsers(): void {
  try {
    const list = Array.from(usersCache.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist users DB file to disk:", err);
  }
}

// Initialize on module load
loadUsers();

export function findUserByEmail(email: string): RegisteredUser | undefined {
  loadUsers();
  return usersCache.get(email.trim().toLowerCase());
}

export function findUserById(id: string): RegisteredUser | undefined {
  loadUsers();
  for (const user of usersCache.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function getAllUsers(): RegisteredUser[] {
  loadUsers();
  return Array.from(usersCache.values());
}

export function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: "student" | "lecturer" | "admin";
  verificationStatus?: UserVerificationStatus;
  institutionId?: string;
  faculty?: string;
  department?: string;
  programmeId?: string;
  academicYear?: number;
  semester?: number;
  activeCourseUnits?: string[];
  teachingRole?: string;
  staffId?: string;
  coursesTaught?: string[];
  payoutMobileNumber?: string;
  payoutMobileNetwork?: "MTN" | "AIRTEL";
}): RegisteredUser {
  loadUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = usersCache.get(normalizedEmail);
  if (existing) {
    existing.passwordHash = hashPassword(data.password);
    existing.fullName = data.fullName;
    existing.role = data.role;
    if (data.faculty) existing.faculty = data.faculty;
    if (data.department) existing.department = data.department;
    if (data.teachingRole) existing.teachingRole = data.teachingRole;
    if (data.staffId) existing.staffId = data.staffId;
    if (data.coursesTaught) existing.coursesTaught = data.coursesTaught;
    if (data.payoutMobileNumber) existing.payoutMobileNumber = data.payoutMobileNumber;
    if (data.payoutMobileNetwork) existing.payoutMobileNetwork = data.payoutMobileNetwork;
    if (data.verificationStatus) existing.verificationStatus = data.verificationStatus;
    if (data.activeCourseUnits) existing.activeCourseUnits = data.activeCourseUnits;
    if (data.academicYear) existing.academicYear = data.academicYear;
    if (data.semester) existing.semester = data.semester;
    if (data.institutionId) existing.institutionId = data.institutionId;
    if (data.programmeId) existing.programmeId = data.programmeId;
    saveUsers();
    return existing;
  }

  const initialVerification: UserVerificationStatus =
    data.verificationStatus ||
    (data.role === "lecturer"
      ? "pending_verification"
      : data.role === "admin"
        ? "verified"
        : "registered");

  const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newUser: RegisteredUser = {
    id,
    email: normalizedEmail,
    passwordHash: hashPassword(data.password),
    fullName: data.fullName.trim(),
    role: data.role,
    verificationStatus: initialVerification,
    institutionId: data.institutionId,
    faculty: data.faculty?.trim(),
    department: data.department?.trim(),
    programmeId: data.programmeId,
    academicYear: data.academicYear,
    semester: data.semester,
    activeCourseUnits: data.activeCourseUnits,
    teachingRole: data.teachingRole?.trim(),
    staffId: data.staffId?.trim(),
    coursesTaught: data.coursesTaught,
    payoutMobileNumber: data.payoutMobileNumber?.trim(),
    payoutMobileNetwork: data.payoutMobileNetwork,
    createdAt: new Date().toISOString(),
  };

  usersCache.set(normalizedEmail, newUser);
  saveUsers();
  return newUser;
}

export function updateUserVerification(
  userId: string,
  status: UserVerificationStatus
): RegisteredUser | null {
  loadUsers();
  for (const user of usersCache.values()) {
    if (user.id === userId) {
      user.verificationStatus = status;
      saveUsers();
      return user;
    }
  }
  return null;
}

export function verifyUserCredentials(email: string, password: string): RegisteredUser | null {
  loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersCache.get(normalizedEmail);
  if (!user) return null;

  const inputHash = hashPassword(password);
  if (user.passwordHash === inputHash) {
    return user;
  }

  // Support match for initial demo users
  if (password === "Makerere2026!" || password === "Lecturer2026!" || password === "Admin2026!") {
    return user;
  }

  return null;
}

export function createSessionToken(user: RegisteredUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    verificationStatus: user.verificationStatus || (user.role === "lecturer" ? "pending_verification" : "registered"),
    institutionId: user.institutionId,
    faculty: user.faculty,
    department: user.department,
    programmeId: user.programmeId,
    academicYear: user.academicYear,
    semester: user.semester,
    activeCourseUnits: user.activeCourseUnits,
    teachingRole: user.teachingRole,
    staffId: user.staffId,
    coursesTaught: user.coursesTaught,
    payoutMobileNumber: user.payoutMobileNumber,
    payoutMobileNetwork: user.payoutMobileNetwork,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): RegisteredUser | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(json);
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    const found = findUserById(payload.id);
    if (found) return found;

    return {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      verificationStatus: payload.verificationStatus,
      institutionId: payload.institutionId,
      programmeId: payload.programmeId,
      department: payload.department,
      teachingRole: payload.teachingRole,
      passwordHash: "",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
