"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, Sparkles, X, CheckCircle2, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already installed / running standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if already dismissed recently
    const dismissedTime = localStorage.getItem("somaug_install_prompt_dismissed");
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 72) {
        // Dismissed within last 3 days
        return;
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture native beforeinstallprompt for Android/Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // New user prompt trigger
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If on iOS or browsers without beforeinstallprompt event, prompt after 3s for new users
    const fallbackTimer = setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 3000);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem("somaug_app_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowPrompt(false);
          localStorage.setItem("somaug_app_installed", "true");
        }
        setDeferredPrompt(null);
      } catch {
        setShowPrompt(false);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Browser didn't support automated prompt; inform user
      alert("To install SomaUG, open your browser menu (⋮) and tap 'Install App' or 'Add to Home Screen'.");
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem("somaug_install_prompt_dismissed", String(Date.now()));
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Install SomaUG Academic Application"
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-sky-400/80 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xl dark:shadow-sky-950/50 backdrop-blur-xl ring-4 ring-sky-500/10 dark:ring-sky-400/20">
        {/* Sky Blue & Orange Ambient Highlights */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-orange-400/25 via-sky-400/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-sky-500/20 to-transparent blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition"
          aria-label="Dismiss installation prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Brand Icon with Sky Blue & Orange Blend */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30">
            <Smartphone className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                App Available
              </span>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">Offline Ready</span>
            </div>

            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
              Install SomaUG Academic
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Get 1-tap offline notes reading, fast exam revision, and zero mobile data consumption.
            </p>
          </div>
        </div>

        {/* iOS Instruction Helper */}
        {showIOSInstructions && (
          <div className="mt-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 p-3 text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <Share className="h-3.5 w-3.5 text-sky-600" />
              <span>How to install on iPhone &amp; iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
              <li>Tap the <strong className="text-sky-700 dark:text-sky-300">Share button</strong> (box with arrow) at the bottom of Safari.</li>
              <li>Scroll down and tap <strong className="text-sky-700 dark:text-sky-300">&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Tap <strong className="text-sky-700 dark:text-sky-300">&quot;Add&quot;</strong> in the top right corner.</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-orange-500 hover:from-sky-600 hover:to-orange-600 active:scale-[0.98] text-white text-xs font-black shadow-md shadow-sky-500/25 transition"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
