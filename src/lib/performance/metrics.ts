/**
 * Performance Monitoring & Web Vitals Collector
 * Monitors FCP, LCP, INP, CLS, search latency, and PDF render times.
 * Targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1
 */

export interface PerformanceSnapshot {
  fcpMs: number | null;
  lcpMs: number | null;
  inpMs: number | null;
  clsScore: number;
  timeToFirstSearchResultMs: number | null;
  pdfFirstPageRenderMs: number | null;
  offlineDownloadsCompleted: number;
  offlineDownloadsFailed: number;
  timestamp: string;
}

export interface MetricAssessment {
  metric: string;
  value: number | null;
  target: string;
  status: "pass" | "warn" | "fail" | "pending";
}

class PerformanceMonitorService {
  private fcp: number | null = null;
  private lcp: number | null = null;
  private inp: number | null = null;
  private cls: number = 0;
  private timeToFirstSearchResultMs: number | null = null;
  private pdfFirstPageRenderMs: number | null = null;
  private downloadsCompleted: number = 0;
  private downloadsFailed: number = 0;
  private initialized: boolean = false;

  public init() {
    if (typeof window === "undefined" || this.initialized) return;
    this.initialized = true;

    // Observe Paint (FCP)
    try {
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            this.fcp = Math.round(entry.startTime);
          }
        }
      });
      paintObserver.observe({ type: "paint", buffered: true });
    } catch {
      // Observer unsupported
    }

    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          this.lcp = Math.round(lastEntry.startTime);
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Observer unsupported
    }

    // Observe CLS
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const shiftEntry = entry as unknown as { hadRecentInput?: boolean; value?: number };
          if (!shiftEntry.hadRecentInput && typeof shiftEntry.value === "number") {
            this.cls += shiftEntry.value;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Observer unsupported
    }

    // Observe INP (Interaction to Next Paint)
    try {
      const inpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const duration = (entry as unknown as { duration?: number }).duration;
          if (typeof duration === "number") {
            if (this.inp === null || duration > this.inp) {
              this.inp = Math.round(duration);
            }
          }
        }
      });
      inpObserver.observe({ type: "event", buffered: true, durationThreshold: 16 } as unknown as PerformanceObserverInit);
    } catch {
      // Observer unsupported
    }
  }

  public recordSearchResultLatency(durationMs: number) {
    if (this.timeToFirstSearchResultMs === null || durationMs < this.timeToFirstSearchResultMs) {
      this.timeToFirstSearchResultMs = Math.round(durationMs);
    }
  }

  public recordPdfFirstPageRender(durationMs: number) {
    this.pdfFirstPageRenderMs = Math.round(durationMs);
  }

  public recordDownloadCompleted() {
    this.downloadsCompleted += 1;
  }

  public recordDownloadFailed() {
    this.downloadsFailed += 1;
  }

  public getSnapshot(): PerformanceSnapshot {
    return {
      fcpMs: this.fcp,
      lcpMs: this.lcp,
      inpMs: this.inp,
      clsScore: Number(this.cls.toFixed(4)),
      timeToFirstSearchResultMs: this.timeToFirstSearchResultMs,
      pdfFirstPageRenderMs: this.pdfFirstPageRenderMs,
      offlineDownloadsCompleted: this.downloadsCompleted,
      offlineDownloadsFailed: this.downloadsFailed,
      timestamp: new Date().toISOString(),
    };
  }

  public getAssessments(): MetricAssessment[] {
    const snap = this.getSnapshot();

    return [
      {
        metric: "Largest Contentful Paint (LCP)",
        value: snap.lcpMs,
        target: "<= 2500 ms",
        status:
          snap.lcpMs === null
            ? "pending"
            : snap.lcpMs <= 2500
            ? "pass"
            : snap.lcpMs <= 4000
            ? "warn"
            : "fail",
      },
      {
        metric: "Interaction to Next Paint (INP)",
        value: snap.inpMs,
        target: "<= 200 ms",
        status:
          snap.inpMs === null
            ? "pending"
            : snap.inpMs <= 200
            ? "pass"
            : snap.inpMs <= 500
            ? "warn"
            : "fail",
      },
      {
        metric: "Cumulative Layout Shift (CLS)",
        value: snap.clsScore,
        target: "<= 0.100",
        status: snap.clsScore <= 0.1 ? "pass" : snap.clsScore <= 0.25 ? "warn" : "fail",
      },
      {
        metric: "Time to First Search Result",
        value: snap.timeToFirstSearchResultMs,
        target: "<= 350 ms",
        status:
          snap.timeToFirstSearchResultMs === null
            ? "pending"
            : snap.timeToFirstSearchResultMs <= 350
            ? "pass"
            : "warn",
      },
    ];
  }
}

export const performanceMonitor = new PerformanceMonitorService();
