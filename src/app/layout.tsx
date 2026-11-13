import type { Metadata } from "next";
import "./globals.css";
import { Navbar, Footer } from "@/components/common/navbar";

export const metadata: Metadata = {
  title: "SomaUG Academic — Uganda University Document Marketplace",
  description:
    "Verified lecture notes, past paper solutions, and study guides from Ugandan university lecturers. Instant purchase with Student Wallet and MTN/Airtel Mobile Money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

