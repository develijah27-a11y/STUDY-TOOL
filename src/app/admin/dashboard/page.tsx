"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Scale,
  RotateCcw,
  UserCheck,
  Flag,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Users,
  FileText,
  Sliders,
  Check,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";

interface AccountSummary {
  code: string;
  name: string;
  type: string;
  balanceUGX: number;
  entryCount: number;
}

interface ReconciliationReport {
  isStrictlyBalanced: boolean;
  totalLedgerDebitsUGX: number;
  totalLedgerCreditsUGX: number;
  discrepancyUGX: number;
  walletReconciliation: {
    studentWalletsTotalUGX: number;
    ledgerStudentLiabilityUGX: number;
    lecturerWalletsTotalUGX: number;
    ledgerLecturerLiabilityUGX: number;
    reservedWalletsTotalUGX: number;
    ledgerReservesLiabilityUGX: number;
  };
  accountSummaries: AccountSummary[];
}

interface LecturerApp {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  teachingRole: string;
  institutionalEmail?: string;
  verificationStatus: string;
}

interface RegisteredUserItem {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "lecturer" | "admin";
  verificationStatus?: string;
  institutionId?: string;
  department?: string;
  createdAt: string;
}

interface DocumentItem {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  priceUGX: number;
  status: string;
  lecturerName?: string;
  lecturerDepartment?: string;
  pageCount: number;
  createdAt: string;
}

interface ContentReportItem {
  id: string;
  documentId: string;
  category: string;
  details: string;
  status: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  studentId: string;
  documentId: string;
  grossAmountUGX: number;
  lecturerEarningsUGX: number;
  platformFeeUGX: number;
  status: string;
  receiptReference: string;
  createdAt: string;
}

interface AuditItem {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [recon, setRecon] = useState<ReconciliationReport | null>(null);
  const [lecturers, setLecturers] = useState<LecturerApp[]>([]);
  const [users, setUsers] = useState<RegisteredUserItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reports, setReports] = useState<ContentReportItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [commissionPercent, setCommissionPercent] = useState(15);
  const [minPayoutUGX, setMinPayoutUGX] = useState(10000);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Tab: overview | verification | users | documents | refunds | moderation | audit | settings
  const [activeTab, setActiveTab] = useState<
    "overview" | "verification" | "users" | "documents" | "refunds" | "moderation" | "audit" | "settings"
  >("overview");

  const [auditSearch, setAuditSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [docSearch, setDocSearch] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?adminId=user-admin-1");
      if (res.ok) {
        const data = await res.json();
        setRecon(data.reconciliation);
        setLecturers(data.lecturerProfiles || []);
        setUsers(data.registeredUsers || []);
        setDocuments(data.documents || []);
        setReports(data.reports || []);
        setOrders(data.orders || []);
        setAuditLogs(data.auditLogs || []);
        setCommissionPercent(data.settings?.commissionPercent ?? 15);
        setMinPayoutUGX(data.settings?.minLecturerPayoutUGX ?? 10000);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleReviewLecturer = async (lecturerId: string, decision: "approve" | "reject" | "suspend") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_lecturer",
          adminId: "user-admin-1",
          lecturerId,
          decision,
          rejectionReason: decision === "reject" ? "Insufficient department verification" : undefined,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Lecturer ${decision.toUpperCase()} status updated.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUser = async (targetUserId: string, role?: string, verificationStatus?: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user",
          adminId: "user-admin-1",
          targetUserId,
          role,
          verificationStatus,
        }),
      });
      if (res.ok) {
        setStatusBanner("User profile updated.");
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDocument = async (documentId: string, status: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_document",
          adminId: "user-admin-1",
          documentId,
          status,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Document status updated to ${status}.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRefund = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_refund",
          adminId: "user-admin-1",
          orderId,
          reason: "Administrator approved refund",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(`Order refunded. Compensating ledger transaction posted.`);
        await loadAdminData();
      } else {
        setStatusBanner(`Refund blocked: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateReport = async (reportId: string, decision: "takedown" | "dismiss") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate_report",
          adminId: "user-admin-1",
          reportId,
          decision,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Report resolved (${decision}).`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          adminId: "user-admin-1",
          commissionPercent: Number(commissionPercent),
          minLecturerPayoutUGX: Number(minPayoutUGX),
        }),
      });
      if (res.ok) {
        setStatusBanner("Platform policies saved.");
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchSearch =
      !userSearch.trim() ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()));
    return matchRole && matchSearch;
  });

  const filteredDocs = documents.filter((d) => {
    return (
      !docSearch.trim() ||
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.courseCode.toLowerCase().includes(docSearch.toLowerCase())
    );
  });

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="rounded-2xl bg-[#142B45] text-white p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-300 px-3 py-0.5 text-xs font-bold border border-teal-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Control Desk</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Platform Administration</h1>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Banner */}
      {statusBanner && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs font-mono text-emerald-400 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "overview", label: "Overview & Ledger", icon: Scale },
          { id: "verification", label: `Lecturer Approvals (${lecturers.filter((l) => l.verificationStatus !== "approved").length})`, icon: UserCheck },
          { id: "users", label: `Users (${users.length})`, icon: Users },
          { id: "documents", label: `Documents (${documents.length})`, icon: FileText },
          { id: "refunds", label: `Refunds (${orders.length})`, icon: RotateCcw },
          { id: "moderation", label: `Reports (${reports.filter((r) => r.status === "open").length})`, icon: Flag },
          { id: "audit", label: `Audit Log (${auditLogs.length})`, icon: FileSpreadsheet },
          { id: "settings", label: "Policies", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? "bg-[#142B45] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Ledger Reconciliation */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {recon && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Debits</span>
                <div className="text-xl font-black text-slate-900">{formatUGX(recon.totalLedgerDebitsUGX)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Credits</span>
                <div className="text-xl font-black text-slate-900">{formatUGX(recon.totalLedgerCreditsUGX)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Discrepancy</span>
                <div className="text-xl font-black text-emerald-600">{formatUGX(recon.discrepancyUGX)}</div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase">Ledger State</span>
                <div className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Strictly Balanced</span>
                </div>
              </div>
            </div>
          )}

          {/* Accounts Summary Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Chart of Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Account Name</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Balance</th>
                    <th className="pb-2 text-right">Postings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recon?.accountSummaries.map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-slate-900">{acc.code}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{acc.name}</td>
                      <td className="py-2.5 capitalize text-slate-500">{acc.type}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">{formatUGX(acc.balanceUGX)}</td>
                      <td className="py-2.5 text-right font-mono text-slate-500">{acc.entryCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lecturer Approvals */}
      {activeTab === "verification" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Lecturer Applications</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Educator</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lecturers.map((lec) => {
                  const isApproved = lec.verificationStatus === "approved";
                  return (
                    <tr key={lec.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">{lec.fullName}</span>
                        <span className="text-slate-500 font-mono text-xs">{lec.institutionalEmail || "No email"}</span>
                      </td>
                      <td className="py-3 text-slate-700">{lec.department}</td>
                      <td className="py-3 text-slate-700">{lec.teachingRole}</td>
                      <td className="py-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800"
                              : lec.verificationStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lec.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleReviewLecturer(lec.id, "approve")}
                              className="rounded-lg bg-[#147D78] hover:bg-[#116965] text-white px-2.5 py-1 text-xs font-bold transition"
                            >
                              Approve
                            </button>
                          )}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleReviewLecturer(lec.id, "suspend")}
                              className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 text-xs font-bold transition"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReviewLecturer(lec.id, "reject")}
                            className="rounded-lg bg-red-100 hover:bg-red-200 text-red-800 px-2.5 py-1 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">User Directory</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs outline-none"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="lecturer">Lecturers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Department / Info</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900 block">{u.fullName}</span>
                      <span className="text-slate-500 font-mono text-xs">{u.email}</span>
                    </td>
                    <td className="py-2.5 capitalize font-semibold text-slate-700">{u.role}</td>
                    <td className="py-2.5 text-slate-600">{u.department || "General"}</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-bold">
                        {u.verificationStatus || "registered"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.verificationStatus !== "verified" ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateUser(u.id, undefined, "verified")}
                            className="rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateUser(u.id, undefined, "suspended")}
                            className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Documents Review */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Publications Review</h3>
            <input
              type="text"
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              placeholder="Search title or course code..."
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Course Code</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{doc.courseCode}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{doc.title}</td>
                    <td className="py-2.5 font-mono text-slate-900">{formatUGX(doc.priceUGX)}</td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          doc.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.status === "takedown"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.status !== "published" && (
                          <button
                            type="button"
                            onClick={() => handleReviewDocument(doc.id, "published")}
                            className="rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Publish
                          </button>
                        )}
                        {doc.status !== "takedown" && (
                          <button
                            type="button"
                            onClick={() => handleReviewDocument(doc.id, "takedown")}
                            className="rounded-lg bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Takedown
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Refunds */}
      {activeTab === "refunds" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Student Purchases &amp; Refunds</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5">
                      <span className="font-mono font-bold text-slate-900 block">{o.orderNumber}</span>
                      <span className="text-slate-500 text-xs">{o.receiptReference}</span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{formatUGX(o.grossAmountUGX)}</td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          o.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "refunded"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {o.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => handleProcessRefund(o.id)}
                          className="rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 text-xs font-bold transition"
                        >
                          Execute Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Moderation */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Content Moderation Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900 capitalize">{r.category.replace("_", " ")}</td>
                    <td className="py-2.5 text-slate-700 max-w-sm">{r.details}</td>
                    <td className="py-2.5">
                      <span className="font-bold px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {r.status === "open" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleModerateReport(r.id, "takedown")}
                            className="rounded-lg bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Takedown
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerateReport(r.id, "dismiss")}
                            className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 text-xs font-bold transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Audit Logs</h3>
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search action..."
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono font-bold text-slate-900">{log.action}</td>
                    <td className="py-2 font-mono text-slate-600">{log.actorId}</td>
                    <td className="py-2 font-mono text-slate-500">{log.targetId}</td>
                    <td className="py-2 text-right text-slate-400 font-mono">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 8: Platform Settings */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Platform Policies</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Platform Commission Fee: {commissionPercent}%
              </label>
              <input
                type="range"
                min={0}
                max={50}
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full accent-[#147D78]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Mobile Money Payout (UGX)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={minPayoutUGX}
                onChange={(e) => setMinPayoutUGX(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-5 py-2 font-bold transition shadow"
            >
              Save Policies
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
