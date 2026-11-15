import { describe, it, expect, beforeEach } from "vitest";
import {
  getDataSaverMode,
  setDataSaverMode,
  isDataSaverActive,
  getDataSaverConfig,
} from "../../src/lib/performance/data-saver";

describe("DataSaver Utility", () => {
  beforeEach(() => {
    // Clear localStorage mockup
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("defaults to standard mode when no preference is saved", () => {
    expect(getDataSaverMode()).toBe("standard");
    expect(isDataSaverActive()).toBe(false);
  });

  it("updates and persists data_saver mode", () => {
    setDataSaverMode("data_saver");
    expect(getDataSaverMode()).toBe("data_saver");
    expect(isDataSaverActive()).toBe(true);

    const config = getDataSaverConfig();
    expect(config.reduceImages).toBe(true);
    expect(config.disableAnimations).toBe(true);
    expect(config.skipBackgroundPrefetch).toBe(true);
    expect(config.showDownloadConfirmation).toBe(true);
  });

  it("resets to standard mode when requested", () => {
    setDataSaverMode("data_saver");
    setDataSaverMode("standard");
    expect(getDataSaverMode()).toBe("standard");
    expect(isDataSaverActive()).toBe(false);
  });
});

