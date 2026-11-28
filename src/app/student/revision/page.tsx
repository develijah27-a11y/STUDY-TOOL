"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Highlighter,
  Search,
  BookOpen,
  ArrowUpRight,
  Plus,
  Trash2,
  FileText,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  offlineStorage,
  StudyAnnotation,
} from "@/lib/offline/offline-storage";

export default function PersonalRevisionPage() {
  const [annotations, setAnnotations] = useState<StudyAnnotation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "highlight" | "note">("all");
  const [loading, setLoading] = useState(true);

  // New Note Modal / Input
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteSubject, setNewNoteSubject] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNotePage, setNewNotePage] = useState("1");

  useEffect(() => {
    async function loadNotes() {
      try {
        const items = await offlineStorage.getAllAnnotations();
        setAnnotations(items);
      } catch (err) {
        console.error("Failed to load revision notes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const handleDeleteNote = async (id: string, documentId: string) => {
    try {
      await offlineStorage.deleteAnnotation(id, documentId);
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete annotation:", err);
    }
  };

  const handleAddCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteItem: StudyAnnotation = {
      id: `custom-note-${Date.now()}`,
      documentId: "custom",
      pageNumber: Number(newNotePage) || 1,
      type: "note",
      content: newNoteSubject.trim() ? `[${newNoteSubject.trim()}] ${newNoteText.trim()}` : newNoteText.trim(),
      color: "yellow",
      createdAt: new Date().toISOString(),
    };

    try {
      await offlineStorage.saveAnnotation(noteItem);
      setAnnotations((prev) => [noteItem, ...prev]);
      setNewNoteSubject("");
      setNewNoteText("");
      setNewNotePage("1");
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save personal revision note:", err);
    }
  };

  const filteredAnnotations = annotations.filter((item) => {
    const matchesFilter = filterType === "all" || item.type === filterType;
    const content = item.content || "";
    const matchesSearch =
      searchQuery.trim() === "" ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Highlighter className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Personal Revision
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Your personal reading notes, key definitions, and exam revision summaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Revision Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or definitions..."
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(
            [
              { id: "all", label: "All Notes" },
              { id: "highlight", label: "Highlights" },
              { id: "note", label: "Marginal Notes" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === tab.id
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revision Notes List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading notes...</div>
      ) : filteredAnnotations.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
          <FileText className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No revision notes found
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Highlight text while reading course materials, or tap &ldquo;Add Revision Note&rdquo; above to record key concepts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnotations.map((item) => {
            const isHighlight = item.type === "highlight";
            const isCustom = item.documentId === "custom";

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      {isHighlight ? "Highlight" : "Study Note"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      Page {item.pageNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                    {isHighlight ? `"${item.content}"` : item.content}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isCustom && (
                      <Link
                        href={`/student/read/${item.documentId}?page=${item.pageNumber}`}
                        className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>Open Document</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(item.id, item.documentId)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Note Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Add Revision Note
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddCustomNote} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject or Topic
                </label>
                <input
                  type="text"
                  value={newNoteSubject}
                  onChange={(e) => setNewNoteSubject(e.target.value)}
                  placeholder="e.g. Constitutional Law, Software Architecture"
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Write formulas, exam definitions, statutory principles, or study notes..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

