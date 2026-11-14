import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/common/navbar";
import { MobileBottomNav } from "@/components/common/mobile-bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SomaUG Academic — Study Notes & Past Papers for Uganda Higher Education",
  description:
    "Lecture notes, past paper marking guides, and practical handbooks from Ugandan lecturers. Instant access with MTN MoMo and Airtel Money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#243244] font-sans antialiased">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}

