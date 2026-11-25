"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  BookOpen,
  User,
  QrCode,
  LogIn,
  UploadCloud,
  Wallet,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname() || "";
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    id: string;
    role?: string;
  } | null>(null);

  // Sync auth state
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        setAuthenticatedUser(JSON.parse(cached));
      }
    } catch {}

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setAuthenticatedUser(data.user);
            return;
          }
        }
        setAuthenticatedUser(null);
      } catch {}
    }
    checkSession();
  }, [pathname]);

  // Hide persistent bottom bar inside protected dashboard routes or on the landing page for phones & tablets
  const isDashboardRoute = Boolean(
    pathname.startsWith("/student") ||
    pathname.startsWith("/lecturer") ||
    pathname.startsWith("/admin")
  );

  if (isDashboardRoute || pathname === "/") {
    return null;
  }

  // Construct items strictly based on role
  let navItems: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
  }[] = [];

  if (!authenticatedUser) {
    // Guest / Unauthenticated Visitor: 4 focused tabs
    navItems = [
      {
        label: "Home",
        href: "/",
        icon: Home,
        isActive: pathname === "/",
      },
      {
        label: "Browse",
        href: "/catalogue",
        icon: Search,
        isActive: pathname.startsWith("/catalogue"),
      },
      {
        label: "Scan QR",
        href: "/d",
        icon: QrCode,
        isActive: pathname.startsWith("/d"),
      },
      {
        label: "Sign In",
        href: "/sign-in",
        icon: LogIn,
        isActive: pathname === "/sign-in" || pathname === "/sign-up",
      },
    ];
  } else if (authenticatedUser.role === "lecturer") {
    // Authenticated Lecturer: 4 tabs
    navItems = [
      {
        label: "Overview",
        href: "/lecturer/dashboard",
        icon: Home,
        isActive: pathname === "/lecturer/dashboard",
      },
      {
        label: "Uploads",
        href: "/lecturer/dashboard?tab=publications",
        icon: UploadCloud,
        isActive: pathname.includes("tab=publications"),
      },
      {
        label: "Earnings",
        href: "/lecturer/dashboard?tab=earnings",
        icon: Wallet,
        isActive: pathname.includes("tab=earnings"),
      },
      {
        label: "Browse",
        href: "/catalogue",
        icon: Search,
        isActive: pathname.startsWith("/catalogue"),
      },
    ];
  } else {
    // Authenticated Student: 4 tabs
    navItems = [
      {
        label: "Dashboard",
        href: "/student/dashboard",
        icon: Home,
        isActive: pathname === "/student/dashboard",
      },
      {
        label: "Browse",
        href: "/catalogue",
        icon: Search,
        isActive: pathname.startsWith("/catalogue"),
      },
      {
        label: "Library",
        href: "/student/library",
        icon: BookOpen,
        isActive: pathname.startsWith("/student/library"),
      },
      {
        label: "Profile",
        href: "/student/profile",
        icon: User,
        isActive: pathname.startsWith("/student/profile"),
      },
    ];
  }

  const gridColsClass = navItems.length === 4 ? "grid-cols-4" : "grid-cols-5";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden safe-area-inset-bottom"
    >
      <div className={`grid ${gridColsClass} h-16 max-w-lg mx-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                item.isActive
                  ? "text-sky-600 dark:text-sky-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium"
              }`}
            >
              <Icon className={`h-5 w-5 ${item.isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[11px] leading-none">{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
