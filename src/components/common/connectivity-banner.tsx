"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  BookOpen,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  subscribeNetworkState,
  NetworkState,
} from "@/lib/offline/connectivity";
import {
  subscribeDataSaver,
  getDataSaverConfig,
} from "@/lib/performance/data-saver";

export default function ConnectivityBanner() {
  const [network, setNetwork] = useState<NetworkState>({
    status: "online",
    isOnline: true,
    saveData: false,
  });

  const [dataSaverActive, setDataSaverActive] = useState(false);

  useEffect(() => {
    const unsubNet = subscribeNetworkState((state) => {
      setNetwork(state);
    });

    setDataSaverActive(getDataSaverConfig().isDataSaverActive);
    const unsubDs = subscribeDataSaver((config) => {
      setDataSaverActive(config.isDataSaverActive);
    });

    return () => {
      unsubNet();
      unsubDs();
    };
  }, []);

  // When fully online and not in data saver, don't show full banner (keep minimal)
  if (network.isOnline && network.status === "online" && !dataSaverActive) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 transition-all">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!network.isOnline ? (
            <span className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline Mode</span>
            </span>
          ) : network.status === "downloading" ? (
            <span className="flex items-center gap-1.5 font-bold text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-full">
              <Download className="h-3.5 w-3.5 animate-bounce" />
              <span>Downloading Encrypted Study Materials...</span>
            </span>
          ) : network.status === "sync_pending" ? (
            <span className="flex items-center gap-1.5 font-bold text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded-full">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Syncing Reading Progress...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              <Wifi className="h-3.5 w-3.5" />
              <span>Online ({network.effectiveType || "Connected"})</span>
            </span>
          )}

          {!network.isOnline ? (
            <span className="text-slate-300 hidden sm:inline">
              Purchases &amp; payments disabled without network. Your offline materials remain accessible.
            </span>
          ) : null}

          {dataSaverActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Zap className="h-3 w-3" />
              <span>Data Saver Active</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!network.isOnline && (
            <Link
              href="/student/library"
              className="inline-flex items-center gap-1 rounded bg-[#147D78] hover:bg-teal-700 px-2.5 py-1 text-[11px] font-bold text-white transition"
            >
              <BookOpen className="h-3 w-3" />
              <span>Go to Offline Library</span>
            </Link>
          )}

          <Link
            href="/student/profile"
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
          >
            Manage Data Saver
          </Link>
        </div>
      </div>
    </div>
  );
}
