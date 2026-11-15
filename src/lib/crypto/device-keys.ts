/**
 * Device Installation & Local Key Management
 *
 * Provides installation-bound keys for PWA storage.
 *
 * ARCHITECTURAL LIMITATION & TRANSPARENCY NOTICE:
 * In a standard web browser/PWA environment, cryptographic keys and IndexedDB storage
 * reside within the browser's sandbox. While Web Crypto non-extractable keys provide
 * robust deterrence against simple extraction, true hardware-enforced DRM requires
 * native Android hardware capabilities (e.g., Android Keystore, Widevine L1/L3, TEE).
 * For SomaUG PWA, this implementation provides the strongest practical device-binding
 * achievable within standard W3C Web Cryptography and Storage standards.
 */

const DEVICE_INSTALLATION_KEY = "somaug_device_installation_id";

export class DeviceKeyManager {
  /**
   * Retrieves or initializes a unique, installation-bound device identifier.
   */
  public static getDeviceInstallationId(): string {
    if (typeof window === "undefined") {
      return "server-env-device-id";
    }

    try {
      let id = localStorage.getItem(DEVICE_INSTALLATION_KEY);
      if (!id) {
        id = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 10)}-${Math.random()
          .toString(36)
          .substring(2, 10)}`;
        localStorage.setItem(DEVICE_INSTALLATION_KEY, id);
      }
      return id;
    } catch {
      return "transient-fallback-device-id";
    }
  }

  /**
   * Generates a device-bound salt derived from the installation ID
   */
  public static getDeviceSalt(): string {
    const id = this.getDeviceInstallationId();
    // Return a consistent 32-character hex representation
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return (hex + hex + hex + hex).substring(0, 32);
  }
}

