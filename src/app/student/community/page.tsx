"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  ShieldCheck,
  Search,
  PlusCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Filter,
} from "lucide-react";

interface DiscussionThread {
  id: string;
  courseCode: string;
  topic: string;
  authorName: string;
  authorRole: "Student" | "Lecturer" | "Tutor";
  repliesCount: number;
  lastActive: string;
  isModerated: boolean;
}

export default function StudentCommunityPage() {
  const [filterCourse, setFilterCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("CSC 2101");
  const [newContent, setNewContent] = useState("");
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const [threads, setThreads] = useState<DiscussionThread[]>([
    {
      id: "thread-1",
      courseCode: "CSC 2101",
      topic: "Understanding Asymptotic Run-time of Divide-and-Conquer Recurrences",
      authorName: "Assoc. Prof. David Okello",
      authorRole: "Lecturer",
      repliesCount: 14,
      lastActive: "2 hours ago",
      isModerated: true,
    },
    {
      id: "thread-2",
      courseCode: "CSC 2101",
      topic: "Key differences between Adjacency Matrix and Adjacency List representations",
      authorName: "Grace Namukasa",
      authorRole: "Student",
      repliesCount: 8,
      lastActive: "4 hours ago",
      isModerated: true,
    },
    {
      id: "thread-3",
      courseCode: "LAW 1101",
      topic: "Distinguishing Ratio Decidendi from Obiter Dicta in East African Case Law",
      authorName: "Adv. Brian Katusiime",
      authorRole: "Tutor",
      repliesCount: 19,
      lastActive: "1 day ago",
      isModerated: true,
    },
    {
      id: "thread-4",
      courseCode: "BBA 1202",
      topic: "Double-entry reconciliation for inventory valuation under FIFO vs Weighted Average",
      authorName: "Ivan Mugisha",
      authorRole: "Student",
      repliesCount: 6,
      lastActive: "2 days ago",
      isModerated: true,
    },
  ]);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newThread: DiscussionThread = {
      id: `thread-${Date.now()}`,
      courseCode: newCourseCode,
      topic: newTopic,
      authorName: "You (Active Student)",
      authorRole: "Student",
      repliesCount: 0,
      lastActive: "Just now",
      isModerated: true,
    };

    setThreads([newThread, ...threads]);
    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      setShowNewThreadModal(false);
      setNewTopic("");
      setNewContent("");
    }, 1200);
  };

  const filteredThreads = threads.filter((t) => {
    const matchCourse = filterCourse === "all" || t.courseCode === filterCourse;
    const matchSearch =
      !searchQuery.trim() ||
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCourse && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-300 px-3 py-0.5 text-xs font-bold border border-teal-500/30">
            <Users className="h-3.5 w-3.5" />
            <span>Academic Discussion Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Course Study Groups &amp; Q&amp;A
          </h1>
          <p className="text-xs text-slate-300">
            Course questions and discussions with peers and tutors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewThreadModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-5 py-2.5 text-xs font-bold text-white shadow-md transition shrink-0"
        >
          <PlusCircle className="h-4 w-4 text-[#E9B949]" />
          <span>Ask Question / Start Thread</span>
        </button>
      </div>

      {/* Moderation Guarantee Banner */}
      <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3 text-xs text-teal-950">
        <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
        <span className="leading-relaxed">
          <strong>Academic Moderation Policy:</strong> Discussions are reviewed by verified tutors and educators. Solicitations, spam, and exam leaks are strictly prohibited.
        </span>
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussion topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#147D78]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600">Course Unit:</span>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">All Course Units</option>
            <option value="CSC 2101">CSC 2101</option>
            <option value="LAW 1101">LAW 1101</option>
            <option value="BBA 1202">BBA 1202</option>
          </select>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-3">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#147D78] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#142B45] text-white px-2 py-0.5 rounded">
                  {thread.courseCode}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    thread.authorRole === "Lecturer"
                      ? "bg-purple-100 text-purple-800"
                      : thread.authorRole === "Tutor"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {thread.authorRole}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  By {thread.authorName} • {thread.lastActive}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {thread.topic}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <span>{thread.repliesCount} replies</span>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#147D78]"
              >
                View Discussion →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Start a Course Discussion
              </h3>
              <button
                type="button"
                onClick={() => setShowNewThreadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {createdSuccess ? (
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span>Discussion topic created and submitted to moderation queue!</span>
              </div>
            ) : (
              <form onSubmit={handleCreateThread} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Unit *
                  </label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  >
                    <option value="CSC 2101">CSC 2101: Data Structures &amp; Algorithms</option>
                    <option value="LAW 1101">LAW 1101: Law of Contract &amp; Torts</option>
                    <option value="BBA 1202">BBA 1202: Financial Accounting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Question / Discussion Topic Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How to solve Dijkstra's shortest path with negative cycles?"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Details &amp; Context *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or discussion point in detail..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewThreadModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#142B45] text-white font-bold hover:bg-[#1A3859]"
                  >
                    Post Topic
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

