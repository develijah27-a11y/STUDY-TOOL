"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpen, Wallet, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide persistent bottom bar inside the protected document reader to preserve distraction-free reading
  if (pathname.startsWith("/student/read/")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/student/dashboard",
      icon: Home,
      isActive: pathname === "/student/dashboard" || pathname === "/",
    },
    {
      label: "Explore",
      href: "/catalogue",
      icon: Compass,
      isActive: pathname.startsWith("/catalogue"),
    },
    {
      label: "My Library",
      href: "/student/library",
      icon: BookOpen,
      isActive: pathname.startsWith("/student/library"),
    },
    {
      label: "Wallet",
      href: "/student/wallet",
      icon: Wallet,
      isActive: pathname.startsWith("/student/wallet"),
    },
    {
      label: "Profile",
      href: "/student/profile",
      icon: User,
      isActive: pathname.startsWith("/student/profile"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-inset-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                item.isActive
                  ? "text-[#147D78] font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className={`h-5 w-5 ${item.isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-xs leading-none">{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#147D78] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

