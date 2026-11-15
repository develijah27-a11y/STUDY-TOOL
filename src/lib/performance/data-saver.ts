/**
 * Data Saver Mode Utility for SomaUG Academic
 * Optimized for Ugandan 2G/3G/4G networks and expensive mobile data.
 */

export type DataSaverMode = "standard" | "data_saver" | "automatic";

const STORAGE_KEY = "somaug_data_saver_mode";
const EVENT_NAME = "somaug_data_saver_change";

export interface DataSaverConfig {
  mode: DataSaverMode;
  isDataSaverActive: boolean;
  reduceImages: boolean;
  disableAnimations: boolean;
  skipBackgroundPrefetch: boolean;
  showDownloadConfirmation: boolean;
}

let inMemoryMode: DataSaverMode = "standard";

/**
 * Returns whether Data Saver mode is actively reducing data transfer.
 */
export function isDataSaverActive(): boolean {
  const mode = getDataSaverMode();
  if (mode === "data_saver") return true;
  if (mode === "automatic") {
    if (typeof navigator !== "undefined") {
      const nav = navigator as unknown as { connection?: { saveData?: boolean } };
      return Boolean(nav.connection?.saveData);
    }
    return false;
  }
  return false;
}

export function getDataSaverMode(): DataSaverMode {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "data_saver" || stored === "automatic" || stored === "standard") {
        return stored;
      }
    } catch {
      // local storage unavailable
    }
  }
  return inMemoryMode;
}

export function setDataSaverMode(mode: DataSaverMode): void {
  inMemoryMode = mode;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { mode, isDataSaverActive: isDataSaverActive() },
        })
      );
    } catch {
      // local storage unavailable
    }
  }
}

export function getDataSaverConfig(): DataSaverConfig {
  const active = isDataSaverActive();
  const mode = getDataSaverMode();

  return {
    mode,
    isDataSaverActive: active,
    reduceImages: active,
    disableAnimations: active,
    skipBackgroundPrefetch: active,
    showDownloadConfirmation: true, // Always inform student of exact MB
  };
}

/**
 * Listen for data saver mode changes
 */
export function subscribeDataSaver(callback: (config: DataSaverConfig) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    callback(getDataSaverConfig());
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
