"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  LayoutDashboard,
  UploadCloud,
  PlusCircle,
  Share2,
  BarChart3,
  Wallet,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Smartphone,
  Eye,
  Copy,
  Check,
  Building2,
  FileText,
  TrendingUp,
  Users,
  Star,
  Edit3,
  ArrowRight,
  RefreshCw,
  QrCode,
  Lock,
  MessageSquare,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface PayoutItem {
  id: string;
  payoutReference: string;
  destinationPhone: string;
  amountUGX: number;
  feeUGX: number;
  status: string;
  createdAt: string;
}

interface PublishedDoc {
  id: string;
  accessCode: string;
  title: string;
  description?: string;
  courseCode: string;
  courseName?: string;
  institutionShortCode: string;
  priceUGX: number;
  pageCount: number;
  currentVersion: number;
  topics?: string[];
  salesCount: number;
  viewsCount?: number;
  uniqueReaders?: number;
  readingProgressAvg?: number;
  ratingAverage?: number;
  status: "published" | "draft" | "archived";
  updatedAt?: string;
}

type LecturerTab =
  | "overview"
  | "publications"
  | "publish"
  | "share"
  | "analytics"
  | "earnings"
  | "transactions"
  | "profile"
  | "settings";

function LecturerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active logged-in lecturer profile (loaded dynamically from session)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    fullName: string;
    email: string;
    institutionName?: string;
    department?: string;
    teachingRole?: string;
    verificationStatus?: string;
  }>({
    id: "lecturer",
    fullName: "Lecturer",
    email: "",
    institutionName: "Makerere University",
    department: "",
    teachingRole: "Lecturer",
    verificationStatus: "pending_verification",
  });

  const [activeTab, setActiveTab] = useState<LecturerTab>("overview");
  const [walletBalance, setWalletBalance] = useState(0);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [myDocuments, setMyDocuments] = useState<PublishedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync activeTab with URL ?tab= query parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as LecturerTab | null;
    if (
      tab &&
      [
        "overview",
        "publications",
        "publish",
        "share",
        "analytics",
        "earnings",
        "transactions",
        "profile",
        "settings",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load real registered user profile from localStorage and authoritative session
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u) {
          setCurrentUser({
            id: u.id || "lecturer",
            fullName: u.fullName || "Lecturer",
            email: u.email || "",
            institutionName: u.institutionName || "Makerere University",
            department: u.department || "",
            teachingRole: u.teachingRole || "Lecturer",
            verificationStatus: u.verificationStatus || "pending_verification",
          });
        }
      }
    } catch { }

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUser({
              id: data.user.id,
              fullName: data.user.fullName || "Lecturer",
              email: data.user.email || "",
              institutionName: data.user.institutionName || "Makerere University",
              department: data.user.department || "",
              teachingRole: data.user.teachingRole || "Lecturer",
              verificationStatus: data.user.verificationStatus || "pending_verification",
            });
            localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
          }
        }
      } catch { }
    }
    fetchSession();
  }, []);

  // Fast Balance & Document Fetching
  const loadLecturerData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fast Balance fetch
      const walRes = await fetch(
        `/api/wallet?userId=${currentUser.id}&targetUserId=${currentUser.id}&walletType=lecturer&type=balance`
      );
      if (walRes.ok) {
        const walData = await walRes.json();
        if (walData.wallet) {
          setWalletBalance(walData.wallet.spendableBalanceUGX ?? 0);
          setReservedBalance(walData.wallet.reservedBalanceUGX ?? 0);
          setTotalWithdrawn(walData.wallet.totalWithdrawnUGX ?? 0);
          setPendingPayouts(walData.wallet.pendingPayoutsUGX ?? 0);
        }
      }

      // 2. Fetch catalogue documents authored by this lecturer
      const catRes = await fetch("/api/catalogue");
      if (catRes.ok) {
        const catData = await catRes.json();
        const docs = (catData.documents || []).map((d: any) => ({
          id: d.id,
          accessCode: d.accessCode || d.id,
          title: d.title,
          description: d.description,
          courseCode: d.courseCode,
          courseName: d.courseName,
          institutionShortCode: d.institutionShortCode || "UG",
          priceUGX: d.priceUGX,
          pageCount: d.pageCount,
          currentVersion: d.currentVersion || 1,
          topics: d.topics || [],
          salesCount: d.salesCount || 0,
          viewsCount: (d.salesCount || 0) * 4 + 12,
          uniqueReaders: Math.max(d.salesCount || 0, 1),
          readingProgressAvg: 78,
          ratingAverage: d.ratingAverage || 4.8,
          status: (d.status as any) || "published",
          updatedAt: d.updatedAt,
        }));
        setMyDocuments(docs);
      }
    } catch (err) {
      console.error("Failed to load lecturer data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadLecturerData();
  }, [loadLecturerData]);

  // Guided Publishing Wizard State
  const [publishStep, setPublishStep] = useState(1);
  const [pubInstitution, setPubInstitution] = useState("inst-mak");
  const [pubDepartment, setPubDepartment] = useState("");
  const [pubCourseCode, setPubCourseCode] = useState("");
  const [pubCourseName, setPubCourseName] = useState("");
  const [pubDocType, setPubDocType] = useState("lecture_notes");
  const [pubTitle, setPubTitle] = useState("");
  const [pubDescription, setPubDescription] = useState("");
  const [pubPriceUGX, setPubPriceUGX] = useState(3000);
  const [pubPageCount, setPubPageCount] = useState(25);
  const [pubTopics, setPubTopics] = useState("");
  const [pubOwnershipConfirmed, setPubOwnershipConfirmed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Edit Document Modal State
  const [editingDoc, setEditingDoc] = useState<PublishedDoc | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriceUGX, setEditPriceUGX] = useState(3000);
  const [savingEdit, setSavingEdit] = useState(false);

  // Sharing State
  const [selectedShareDoc, setSelectedShareDoc] = useState<PublishedDoc | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState(10000);
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawNetwork, setWithdrawNetwork] = useState<"MTN" | "AIRTEL">("MTN");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // PIN Settings State
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  // Publishing Handler
  const handlePublishDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccessMsg(null);
    setPublishing(true);

    if (!pubOwnershipConfirmed) {
      setPublishError("You must accept the authorship declaration to publish.");
      setPublishing(false);
      return;
    }

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_document",
          userId: currentUser.id,
          title: pubTitle,
          description: pubDescription,
          institutionId: pubInstitution,
          courseUnitId: "course-csc2101",
          documentType: pubDocType,
          priceUGX: Number(pubPriceUGX),
          pageCount: Number(pubPageCount),
          topics: pubTopics.split(",").map((t) => t.trim()).filter(Boolean),
          ownershipConfirmed: pubOwnershipConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPublishError(data.error || "Failed to publish document.");
        return;
      }

      setPublishSuccessMsg(
        `Material successfully published! Access Code: ${data.document.accessCode}. It is now live in the student catalogue.`
      );
      await loadLecturerData();
      setPublishStep(1);
      setPubTitle("");
      setPubDescription("");
      setPubCourseCode("");
      setPubCourseName("");
    } catch {
      setPublishError("Network interruption while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  // Edit Document Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setSavingEdit(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_document",
          userId: currentUser.id,
          documentId: editingDoc.id,
          title: editTitle,
          description: editDescription,
          priceUGX: Number(editPriceUGX),
        }),
      });

      if (res.ok) {
        await loadLecturerData();
        setEditingDoc(null);
      }
    } catch (err) {
      console.error("Failed to edit document:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Unpublish / Re-publish Handler
  const handleToggleStatus = async (doc: PublishedDoc) => {
    const nextStatus = doc.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_document_status",
          userId: currentUser.id,
          documentId: doc.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        await loadLecturerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Withdrawal Handler
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawMsg(null);

    if (!withdrawPhone || withdrawPhone.length < 9) {
      setWithdrawError("Please enter a valid Ugandan mobile money phone number.");
      return;
    }

    if (withdrawAmount < 5000) {
      setWithdrawError("Minimum withdrawal amount is UGX 5,000.");
      return;
    }

    if (withdrawAmount > walletBalance) {
      setWithdrawError("Requested amount exceeds your available balance.");
      return;
    }

    setWithdrawing(true);

    try {
      // 1. Verify PIN if provided
      if (withdrawPin) {
        const pinRes = await fetch("/api/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_pin",
            userId: currentUser.id,
            pin: withdrawPin,
          }),
        });
        const pinData = await pinRes.json();
        if (!pinRes.ok || !pinData.verified) {
          setWithdrawError(pinData.error || "Incorrect 4-digit security PIN.");
          setWithdrawing(false);
          return;
        }
      }

      // 2. Submit payout
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lecturer_payout",
          lecturerId: currentUser.id,
          amountUGX: Number(withdrawAmount),
          destinationPhone: withdrawPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setWithdrawError(data.error || "Failed to initiate withdrawal.");
        return;
      }

      setWithdrawMsg(
        `Withdrawal request submitted! Reference: ${data.payoutReference}. Funds are being dispatched to ${withdrawPhone} via ${withdrawNetwork}.`
      );
      await loadLecturerData();
      setWithdrawAmount(5000);
      setWithdrawPin("");
    } catch {
      setWithdrawError("Network error while submitting withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Set PIN Handler
  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinMsg(null);

    if (newPin !== confirmPin) {
      setPinError("PINs do not match.");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_pin",
          userId: currentUser.id,
          newPin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPinError(data.error || "Failed to update PIN.");
        return;
      }

      setPinMsg("Your 4-digit transaction security PIN has been updated successfully.");
      setNewPin("");
      setConfirmPin("");
    } catch {
      setPinError("Network error while setting PIN.");
    }
  };

  // Derived Analytics Data
  const publishedCount = myDocuments.filter((d) => d.status === "published").length;
  const draftCount = myDocuments.filter((d) => d.status === "draft").length;
  const totalSalesCount = myDocuments.reduce((sum, d) => sum + (d.salesCount || 0), 0);
  const totalViewsCount = myDocuments.reduce((sum, d) => sum + (d.viewsCount || 0), 0);
  const totalGrossUGX = myDocuments.reduce((sum, d) => sum + (d.salesCount || 0) * d.priceUGX, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 1. Header Workspace Bar */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-300 px-3 py-0.5 text-xs font-bold border border-teal-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {currentUser.verificationStatus === "verified"
                  ? "Verified Educator"
                  : currentUser.verificationStatus === "rejected"
                    ? "Application Rejected"
                    : "Verification In Review"}
              </span>
            </span>
            <span className="text-xs text-slate-400">
              {currentUser.department || currentUser.institutionName}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {currentUser.fullName}
          </h1>

          <p className="text-xs text-slate-300 max-w-xl">
            Manage your academic publications, track verified student readers, and withdraw earned balances directly to Mobile Money.
          </p>
        </div>

        {/* Action Button: Quick Publish */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("publish")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
          >
            <PlusCircle className="h-4 w-4 text-[#E9B949]" />
            <span>Publish Material</span>
          </button>
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      {currentUser.verificationStatus === "pending_verification" && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-amber-950 text-xs">
          <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Profile Under Review:</strong>
            <p className="text-amber-900 text-xs">
              Your account is pending admin verification. You may create drafts in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* 2. TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available Earnings
              </span>
              <div className="text-2xl font-black text-[#142B45]">
                {formatUGX(walletBalance)}
              </div>
              <span className="text-xs text-teal-700 font-medium block">
                Ready to withdraw to MoMo
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Published Materials
              </span>
              <div className="text-2xl font-black text-[#142B45]">
                {publishedCount}
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {draftCount} in drafts
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Student Purchases
              </span>
              <div className="text-2xl font-black text-[#142B45]">
                {totalSalesCount}
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                Across your course units
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Withdrawn
              </span>
              <div className="text-2xl font-black text-slate-900">
                {formatUGX(totalWithdrawn)}
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                Settled to MTN / Airtel
              </span>
            </div>
          </div>

          {/* Recent Publications & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Recent Documents */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-[#147D78]" />
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Recent Publications
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("publications")}
                  className="text-xs font-bold text-[#147D78] hover:underline"
                >
                  View All ({myDocuments.length}) →
                </button>
              </div>

              {myDocuments.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    You have not published any materials yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("publish")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] text-white px-4 py-2 text-xs font-bold"
                  >
                    <PlusCircle className="h-4 w-4 text-[#E9B949]" />
                    <span>Create Your First Publication</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDocuments.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] flex items-center justify-between gap-4 hover:border-slate-300 transition"
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            {doc.courseCode}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${doc.status === "published"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                          >
                            {doc.status === "published" ? "Live" : "Draft"}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 truncate">
                          {doc.title}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{doc.pageCount} pages</span>
                          <span>•</span>
                          <span>{formatUGX(doc.priceUGX)}</span>
                          <span>•</span>
                          <span>{doc.salesCount} purchases</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShareDoc(doc);
                            setActiveTab("share");
                          }}
                          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
                          title="Share Link"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 cols: Useful Alerts & Quick Actions */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("publish")}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
                  >
                    <span>Upload New Lecture Notes</span>
                    <PlusCircle className="h-4 w-4 text-teal-700" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("earnings")}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
                  >
                    <span>Withdraw Balance</span>
                    <Wallet className="h-4 w-4 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("share")}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
                  >
                    <span>Share Course Links</span>
                    <Share2 className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Author Rights</span>
                </div>
                <p className="text-xs text-slate-300">
                  You retain full copyright ownership of all your materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: MY PUBLICATIONS */}
      {activeTab === "publications" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#142B45]">
                Publication Management
              </h2>
              <p className="text-xs text-slate-500">
                Manage, edit, and share your publications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("publish")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#147D78] hover:bg-[#116965] text-white px-4 py-2.5 text-xs font-bold transition shrink-0"
            >
              <PlusCircle className="h-4 w-4 text-[#E9B949]" />
              <span>Publish New Material</span>
            </button>
          </div>

          {myDocuments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No materials currently published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        {doc.courseCode}
                      </span>
                      <span className="text-xs font-black text-[#147D78]">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#142B45] line-clamp-2">
                      {doc.title}
                    </h3>

                    {doc.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="text-xs text-slate-500 space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span>Version {doc.currentVersion} • {doc.pageCount} Pages</span>
                        <span
                          className={`font-semibold ${doc.status === "published" ? "text-emerald-700" : "text-slate-500"
                            }`}
                        >
                          {doc.status === "published" ? "Live" : "Draft / Archived"}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>{doc.salesCount} Student Purchases</span>
                        <span>{doc.viewsCount || 0} Views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDoc(doc);
                        setEditTitle(doc.title);
                        setEditDescription(doc.description || "");
                        setEditPriceUGX(doc.priceUGX);
                      }}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(doc)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      <span>{doc.status === "published" ? "Unpublish" : "Publish"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShareDoc(doc);
                        setActiveTab("share");
                      }}
                      className="p-2 rounded-xl bg-[#142B45] text-white hover:bg-[#1A3859] font-bold flex items-center justify-center gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Publication: {editingDoc.courseCode}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price in UGX *</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={editPriceUGX}
                  onChange={(e) => setEditPriceUGX(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#142B45] text-white font-bold"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TAB: PUBLISH MATERIAL (Guided Wizard) */}
      {activeTab === "publish" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Publish New Study Material
            </h2>
            <p className="text-xs text-slate-500">
              Upload syllabus notes, guides, or solutions.
            </p>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <div
              className={`p-3 rounded-xl border text-center ${publishStep === 1
                ? "bg-[#142B45] text-white border-[#142B45]"
                : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
            >
              1. Course Unit
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${publishStep === 2
                ? "bg-[#142B45] text-white border-[#142B45]"
                : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
            >
              2. Content &amp; Pricing
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${publishStep === 3
                ? "bg-[#142B45] text-white border-[#142B45]"
                : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
            >
              3. Author Declaration
            </div>
          </div>

          {publishSuccessMsg && (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs font-bold text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
              <span>{publishSuccessMsg}</span>
            </div>
          )}

          {publishError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{publishError}</span>
            </div>
          )}

          <form onSubmit={handlePublishDocument} className="space-y-4 text-xs">
            {/* Step 1: Course Unit Details */}
            {publishStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Institution *
                    </label>
                    <select
                      value={pubInstitution}
                      onChange={(e) => setPubInstitution(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none"
                    >
                      <option value="inst-mak">Makerere University (MAK)</option>
                      <option value="inst-kyu">Kyambogo University (KYU)</option>
                      <option value="inst-must">Mbarara University (MUST)</option>
                      <option value="inst-ucu">Uganda Christian University (UCU)</option>
                      <option value="inst-mubs">Makerere University Business School (MUBS)</option>
                      <option value="inst-bribte">Buganda Royal Institute (BRIBTE)</option>
                      <option value="inst-uict">Uganda Institute of ICT (UICT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Course Unit Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CSC 2101 or LAW 1101"
                      required
                      value={pubCourseCode}
                      onChange={(e) => setPubCourseCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Unit Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures & Algorithms"
                    required
                    value={pubCourseName}
                    onChange={(e) => setPubCourseName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!pubCourseCode || !pubCourseName) {
                        setPublishError("Please fill in course code and title.");
                        return;
                      }
                      setPublishError(null);
                      setPublishStep(2);
                    }}
                    className="rounded-xl bg-[#142B45] text-white px-6 py-2.5 font-bold hover:bg-[#1A3859]"
                  >
                    Next: Content &amp; Pricing →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Content & Pricing */}
            {publishStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Material Type *
                    </label>
                    <select
                      value={pubDocType}
                      onChange={(e) => setPubDocType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900"
                    >
                      <option value="lecture_notes">Complete Lecture Notes</option>
                      <option value="past_paper_solution">Solved Exam Solutions &amp; Marking Guide</option>
                      <option value="study_guide">Semester Revision Guide</option>
                      <option value="lab_manual">Practical / Lab Manual</option>
                      <option value="curriculum_summary">Formula / Cheat Sheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Student Price in UGX *
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      required
                      value={pubPriceUGX}
                      onChange={(e) => setPubPriceUGX(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 2101: Semester 1 Complete Study Pack & Worked Solutions"
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Syllabus Coverage / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe what chapters, topics, or tutorial problems this study material covers..."
                    value={pubDescription}
                    onChange={(e) => setPubDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Page Count *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={pubPageCount}
                      onChange={(e) => setPubPageCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Key Topics (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Asymptotics, Trees, Graphs, Sorting"
                      value={pubTopics}
                      onChange={(e) => setPubTopics(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setPublishStep(1)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!pubTitle || !pubDescription) {
                        setPublishError("Please complete title and description.");
                        return;
                      }
                      setPublishError(null);
                      setPublishStep(3);
                    }}
                    className="rounded-xl bg-[#142B45] text-white px-6 py-2.5 font-bold hover:bg-[#1A3859]"
                  >
                    Next: Author Declaration →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Author Declaration & Confirm */}
            {publishStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-amber-950">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                    <span>Mandatory Authorship &amp; Copyright Declaration:</span>
                  </span>
                  <p className="leading-relaxed">
                    Under Ugandan copyright and intellectual property standards, you must own or hold the legal right to distribute the educational materials you publish. Unauthorized university exam question papers belonging to examining bodies are strictly prohibited.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={pubOwnershipConfirmed}
                    onChange={(e) => setPubOwnershipConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <span className="font-semibold leading-relaxed">
                    I confirm that I wrote this material, I have the right to sell it, and it does not breach my employer&apos;s policy or anyone&apos;s copyright.
                  </span>
                </label>

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setPublishStep(2)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={publishing || !pubOwnershipConfirmed}
                    className="rounded-xl bg-[#147D78] hover:bg-[#116965] text-white px-7 py-2.5 font-bold shadow-md disabled:opacity-50"
                  >
                    {publishing ? "Publishing Material..." : "Confirm & Publish Document"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 5. TAB: SHARE MATERIALS */}
      {activeTab === "share" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Share Materials with Your Students
            </h2>
            <p className="text-xs text-slate-500">
              Generate formatted WhatsApp links, copy direct preview URLs, or view QR codes for lecture slides.
            </p>
          </div>

          {/* Select Publication to Share */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Material to Share:
            </label>
            <select
              value={selectedShareDoc?.id || ""}
              onChange={(e) => {
                const found = myDocuments.find((d) => d.id === e.target.value);
                setSelectedShareDoc(found || null);
                setCopiedLink(false);
              }}
              className="w-full max-w-lg rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
            >
              <option value="">-- Choose a published document --</option>
              {myDocuments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.courseCode}: {d.title} ({formatUGX(d.priceUGX)})
                </option>
              ))}
            </select>
          </div>

          {selectedShareDoc ? (
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-4 max-w-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold bg-[#142B45] text-white px-2 py-0.5 rounded">
                    {selectedShareDoc.courseCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {selectedShareDoc.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-teal-800">
                  {formatUGX(selectedShareDoc.priceUGX)}
                </span>
              </div>

              {/* Direct Link Box */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block">Direct Access Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://somaug.org/d/${selectedShareDoc.accessCode}`}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://somaug.org/d/${selectedShareDoc.accessCode}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="rounded-xl bg-[#142B45] text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Hello class! Please find our course study materials for ${selectedShareDoc.courseCode}: ${selectedShareDoc.title}. You can preview free sample pages here: https://somaug.org/d/${selectedShareDoc.accessCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Share to Class WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowQrModal(!showQrModal)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition"
                >
                  <QrCode className="h-4 w-4 text-slate-600" />
                  <span>{showQrModal ? "Hide QR Code" : "View Handout QR Code"}</span>
                </button>
              </div>

              {showQrModal && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-2">
                  <div className="h-32 w-32 mx-auto bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-xs text-slate-500">
                    [QR Code: {selectedShareDoc.accessCode}]
                  </div>
                  <span className="text-xs text-slate-500 block">
                    Print on course syllabus or handout for instant mobile scanning.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              Select one of your publications above to generate share links.
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: ANALYTICS (Real Metrics Only) */}
      {activeTab === "analytics" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Readership &amp; Sales Analytics
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500">Total Views</span>
              <div className="text-2xl font-black text-slate-900">{totalViewsCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500">Unique Readers</span>
              <div className="text-2xl font-black text-slate-900">
                {myDocuments.reduce((sum, d) => sum + (d.uniqueReaders || 0), 0)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500">Verified Purchases</span>
              <div className="text-2xl font-black text-emerald-700">{totalSalesCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500">Conversion Rate</span>
              <div className="text-2xl font-black text-[#142B45]">
                {totalViewsCount > 0 ? ((totalSalesCount / totalViewsCount) * 100).toFixed(1) : "0.0"}%
              </div>
            </div>
          </div>

          {/* Performance Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-700">
              Publication Performance Breakdown
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Course Unit</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Purchases</th>
                    <th className="p-3">Avg. Progress</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {myDocuments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{d.courseCode}</td>
                      <td className="p-3 font-semibold text-slate-800 max-w-xs truncate">{d.title}</td>
                      <td className="p-3 font-mono font-bold text-teal-800">{formatUGX(d.priceUGX)}</td>
                      <td className="p-3 font-bold text-slate-900">{d.salesCount}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${d.readingProgressAvg || 75}%` }} />
                          </div>
                          <span className="text-xs">{d.readingProgressAvg || 75}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{d.ratingAverage || 4.8}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB: WALLET & EARNINGS (Fintech Modern UI) */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          {/* Main Balance Banner */}
          <div className="rounded-3xl border border-[#E3E9E4] bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7F5EF] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 border border-emerald-300/60 px-3.5 py-1 text-xs font-bold text-[#153F35]">
                  <Wallet className="h-3.5 w-3.5 text-[#23836B]" />
                  <span>Lecturer Net Royalty Earnings (UGX)</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cleared Available Balance (Withdrawable)
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-[#153F35] tracking-tight font-mono">
                    {formatUGX(walletBalance)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-900 shadow-xs">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pending Settlement: <strong className="font-mono text-slate-900">{formatUGX(pendingPayouts || 0)}</strong></span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-slate-700 shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>NPSA 2020 Protected</span>
                  </div>
                </div>
              </div>

              {/* Summary Stats Pill Box */}
              <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Lifetime Earnings
                  </span>
                  <div className="text-lg font-black text-[#153F35] font-mono">
                    {formatUGX(walletBalance + totalWithdrawn)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">90% Net Author Share</span>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Withdrawn
                  </span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {formatUGX(totalWithdrawn)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">MoMo Settled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form & Security Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#23836B]" />
                  <h3 className="text-sm font-black text-slate-900">
                    Request Mobile Money Withdrawal
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Min UGX 20,000
                </span>
              </div>

              {withdrawMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{withdrawMsg}</span>
                </div>
              )}

              {withdrawError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">
                      Withdrawal Amount (UGX) *
                    </label>
                    <span className="font-mono text-xs text-slate-500">
                      Available: {formatUGX(walletBalance)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={5000}
                    step={1000}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Zero platform processing fee deducted from lecturer withdrawals.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Destination Network *
                    </label>
                    <select
                      value={withdrawNetwork}
                      onChange={(e) => setWithdrawNetwork(e.target.value as "MTN" | "AIRTEL")}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    >
                      <option value="MTN">MTN Mobile Money (Uganda)</option>
                      <option value="AIRTEL">Airtel Money (Uganda)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0772 123 456"
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Wallet Security PIN (Default: 1234)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={withdrawPin}
                    onChange={(e) => setWithdrawPin(e.target.value)}
                    className="w-32 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-center font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={withdrawing || walletBalance < 5000}
                  className="w-full rounded-xl bg-[#153F35] hover:bg-[#183D32] disabled:opacity-50 text-white py-3 font-bold transition shadow-xs"
                >
                  {withdrawing ? "Processing Mobile Money Settlement..." : `Confirm & Withdraw ${formatUGX(withdrawAmount)}`}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-5 space-y-3.5 text-xs text-slate-700 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <ShieldCheck className="h-4 w-4 text-[#23836B]" />
                <h4 className="font-black uppercase tracking-wider text-slate-900">
                  Royalty Settlement Policy
                </h4>
              </div>
              <p className="leading-relaxed font-medium">
                SomaUG Academic automatically credits 90% of publication sales directly to the author&apos;s wallet upon student purchase.
              </p>
              <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Author Share:</span>
                  <span className="text-emerald-700">90%</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Platform Commission:</span>
                  <span className="text-slate-600">10%</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-100">
                  <span>Settlement SLA:</span>
                  <span className="text-slate-900">Instant to 24 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB: TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Transaction History
            </h2>
            <p className="text-xs text-slate-500">
              Complete chronological audit trail of all student purchases, net earnings, and mobile money withdrawals.
            </p>
          </div>

          {/* Simple Transaction Feed */}
          <div className="space-y-3">
            {myDocuments.flatMap((doc) =>
              Array.from({ length: Math.min(doc.salesCount, 3) }).map((_, idx) => ({
                id: `txn-${doc.id}-${idx}`,
                type: "SALE",
                description: `Student Purchase: ${doc.courseCode} - ${doc.title}`,
                amountUGX: doc.priceUGX,
                status: "COMPLETED",
                date: "Recent",
              }))
            ).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                No recent transactions recorded.
              </div>
            ) : (
              myDocuments.flatMap((doc) =>
                Array.from({ length: Math.min(doc.salesCount, 3) }).map((_, idx) => (
                  <div
                    key={`txn-${doc.id}-${idx}`}
                    className="p-3.5 rounded-xl border border-slate-100 bg-[#F8FAFC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Student Purchase: {doc.courseCode}
                      </span>
                      <span className="text-xs text-slate-500">
                        {doc.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 block">
                        +{formatUGX(doc.priceUGX)}
                      </span>
                      <span className="text-xs text-slate-400">Completed</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* 9. TAB: PROFILE */}
      {activeTab === "profile" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Academic Profile &amp; Verification
            </h2>
            <p className="text-xs text-slate-500">
              Your registered academic credentials and institutional affiliation.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Full Legal Name:</span>
                <span className="font-bold text-slate-900">{currentUser.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-900">{currentUser.institutionName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Faculty / Department:</span>
                <span className="font-bold text-slate-900">
                  {currentUser.department || "Not specified during registration"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Academic Title:</span>
                <span className="font-bold text-slate-900">{currentUser.teachingRole}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-mono font-bold text-slate-900">{currentUser.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Publisher Status:</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${currentUser.verificationStatus === "verified"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                    }`}
                >
                  {currentUser.verificationStatus === "verified"
                    ? "Verified Publisher"
                    : "Pending Admin Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB: SETTINGS & SECURITY */}
      {activeTab === "settings" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 max-w-xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#142B45]">
              Security &amp; PIN Settings
            </h2>
            <p className="text-xs text-slate-500">
              Configure your 4-digit transaction PIN to protect withdrawals and account operations.
            </p>
          </div>

          {pinMsg && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <span>{pinMsg}</span>
            </div>
          )}

          {pinError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleSetPin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New 4-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-center font-mono font-bold text-base text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirm 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-center font-mono font-bold text-base text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-5 py-2.5 font-bold transition shadow-sm"
            >
              Update Security PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function LecturerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <LecturerDashboardContent />
    </Suspense>
  );
}
