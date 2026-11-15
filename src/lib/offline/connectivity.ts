/**
 * Connectivity State Manager for SomaUG Academic
 * Observes network states: "online" | "offline" | "connecting" | "downloading" | "sync_pending"
 */

export type NetworkStatus =
  | "online"
  | "offline"
  | "connecting"
  | "downloading"
  | "sync_pending";

export interface NetworkState {
  status: NetworkStatus;
  isOnline: boolean;
  saveData: boolean;
  effectiveType?: string; // "2g" | "3g" | "4g"
  rtt?: number;
}

const LISTENERS = new Set<(state: NetworkState) => void>();
let currentState: NetworkState = {
  status: "online",
  isOnline: true,
  saveData: false,
};

let initialized = false;

export function getNetworkState(): NetworkState {
  if (typeof window === "undefined") {
    return { status: "online", isOnline: true, saveData: false };
  }
  return currentState;
}

export function setApplicationNetworkStatus(status: NetworkStatus) {
  currentState = {
    ...currentState,
    status,
    isOnline: status !== "offline",
  };
  notifyListeners();
}

function notifyListeners() {
  for (const listener of LISTENERS) {
    try {
      listener(currentState);
    } catch {
      // ignore
    }
  }
}

export function subscribeNetworkState(
  callback: (state: NetworkState) => void
): () => void {
  LISTENERS.add(callback);
  callback(getNetworkState());

  if (typeof window !== "undefined" && !initialized) {
    initialized = true;

    const updateFromBrowser = () => {
      const isOnline = navigator.onLine;
      const nav = navigator as unknown as {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
          rtt?: number;
        };
      };

      currentState = {
        status: isOnline ? "online" : "offline",
        isOnline,
        saveData: Boolean(nav.connection?.saveData),
        effectiveType: nav.connection?.effectiveType,
        rtt: nav.connection?.rtt,
      };
      notifyListeners();
    };

    window.addEventListener("online", updateFromBrowser);
    window.addEventListener("offline", updateFromBrowser);
    updateFromBrowser();
  }

  return () => {
    LISTENERS.delete(callback);
  };
}

