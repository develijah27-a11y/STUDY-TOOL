"use client";

import { useEffect } from "react";
import { performanceMonitor } from "@/lib/performance/metrics";

export default function PwaRegistrar() {
  useEffect(() => {
    // 1. Initialize Performance Web Vitals Collector
    performanceMonitor.init();

    // 2. Register Service Worker if supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.info("SomaUG PWA: New version available");
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("SomaUG PWA: ServiceWorker registration skipped", err);
          });
      });
    }
  }, []);

  return null;
}
