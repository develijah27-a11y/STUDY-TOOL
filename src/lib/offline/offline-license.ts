import crypto from "crypto";

export interface OfflineLicense {
  licenseId: string;
  studentId: string;
  documentId: string;
  documentVersion: number;
  orderId: string;
  deviceInstallationId: string;
  issuedAt: string;
  expiresAt: string;
  durationDays: number;
  status: "active" | "expired" | "revoked";
  signature: string;
}

export interface LicenseVerificationResult {
  valid: boolean;
  license?: OfflineLicense;
  daysRemaining?: number;
  error?: string;
  requiresRenewal: boolean;
}

// Server HMAC Secret for signing licenses (configured via env or secure fallback for dev/test)
const LICENSE_HMAC_SECRET =
  process.env.OFFLINE_LICENSE_HMAC_SECRET || "somaug_offline_academic_secret_key_2026";

export class OfflineLicenseService {
  public static readonly DEFAULT_LICENSE_DURATION_DAYS = 30;

  /**
   * Generates a tamper-evident signed offline license on the server.
   */
  public static issueLicense(params: {
    studentId: string;
    documentId: string;
    documentVersion: number;
    orderId: string;
    deviceInstallationId: string;
    durationDays?: number;
  }): OfflineLicense {
    const durationDays = params.durationDays || this.DEFAULT_LICENSE_DURATION_DAYS;
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const licenseId = `lic-${params.documentId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const unsignedData = [
      licenseId,
      params.studentId,
      params.documentId,
      params.documentVersion,
      params.orderId,
      params.deviceInstallationId,
      now.toISOString(),
      expires.toISOString(),
    ].join("|");

    const signature = crypto
      .createHmac("sha256", LICENSE_HMAC_SECRET)
      .update(unsignedData)
      .digest("hex");

    return {
      licenseId,
      studentId: params.studentId,
      documentId: params.documentId,
      documentVersion: params.documentVersion,
      orderId: params.orderId,
      deviceInstallationId: params.deviceInstallationId,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      durationDays,
      status: "active",
      signature,
    };
  }

  /**
   * Verifies the authenticity, device binding, and validity period of an offline license.
   */
  public static verifyLicense(
    license: OfflineLicense,
    currentDeviceId?: string
  ): LicenseVerificationResult {
    if (!license || !license.signature) {
      return {
        valid: false,
        requiresRenewal: false,
        error: "MISSING_LICENSE: No offline license was provided",
      };
    }

    // 1. Check device installation binding if provided
    if (currentDeviceId && license.deviceInstallationId !== currentDeviceId) {
      return {
        valid: false,
        requiresRenewal: false,
        error: "DEVICE_MISMATCH: License is bound to another device installation",
      };
    }

    // 2. Check revoked status
    if (license.status === "revoked") {
      return {
        valid: false,
        requiresRenewal: false,
        error: "LICENSE_REVOKED: This offline license has been revoked by platform policy",
      };
    }

    // 3. Verify cryptographic HMAC-SHA256 signature
    const unsignedData = [
      license.licenseId,
      license.studentId,
      license.documentId,
      license.documentVersion,
      license.orderId,
      license.deviceInstallationId,
      license.issuedAt,
      license.expiresAt,
    ].join("|");

    const expectedSignature = crypto
      .createHmac("sha256", LICENSE_HMAC_SECRET)
      .update(unsignedData)
      .digest("hex");

    if (license.signature !== expectedSignature) {
      return {
        valid: false,
        requiresRenewal: false,
        error: "SIGNATURE_INVALID: License has been tampered with or forged",
      };
    }

    // 4. Verify expiration date
    const now = Date.now();
    const expiryTime = new Date(license.expiresAt).getTime();
    const diffMs = expiryTime - now;

    if (diffMs <= 0) {
      return {
        valid: false,
        requiresRenewal: true,
        daysRemaining: 0,
        error: "LICENSE_EXPIRED: Offline authorization has expired. Reconnect to the internet to renew.",
      };
    }

    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      valid: true,
      license,
      daysRemaining,
      requiresRenewal: false,
    };
  }
}
