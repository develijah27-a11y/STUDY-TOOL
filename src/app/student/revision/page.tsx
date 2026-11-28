"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Highlighter,
  Search,
  BookOpen,
  ArrowUpRight,
  Plus,
  Trash2,
  FileText,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  X,
  RotateCw,
  Eye,
} from "lucide-react";
import {
  offlineStorage,
  StudyAnnotation,
} from "@/lib/offline/offline-storage";

export default function PersonalRevisionPage() {
  const [annotations, setAnnotations] = useState<StudyAnnotation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "photo" | "highlight" | "note">("all");
  const [loading, setLoading] = useState(true);

  // New Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<"photo" | "text">("photo");
  const [newNoteSubject, setNewNoteSubject] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNotePage, setNewNotePage] = useState("1");

  // Photo State
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [smartCleanEnabled, setSmartCleanEnabled] = useState(true);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  // Lightbox Modal for viewing photos in full size
  const [lightboxAnnotation, setLightboxAnnotation] = useState<StudyAnnotation | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      if (lightboxAnnotation?.id === id) {
        setLightboxAnnotation(null);
      }
    } catch (err) {
      console.error("Failed to delete annotation:", err);
    }
  };

  // Helper to process, resize and optimize handwritten photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize down to max 1280px for performance & compact storage
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          setPhotoDataUrl(compressed);
        } else {
          setPhotoDataUrl(reader.result as string);
        }
        setPhotoProcessing(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file inputs so the same photo can be re-selected if needed
    e.target.value = "";
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalTab === "photo" && !photoDataUrl) {
      return;
    }
    if (modalTab === "text" && !newNoteText.trim()) {
      return;
    }

    const noteItem: StudyAnnotation = {
      id: `custom-note-${Date.now()}`,
      documentId: "custom",
      pageNumber: Number(newNotePage) || 1,
      type: modalTab === "photo" ? "photo" : "note",
      title: newNoteSubject.trim() || (modalTab === "photo" ? "Handwritten Note" : "Study Note"),
      content: newNoteText.trim() || undefined,
      imageUrl: modalTab === "photo" && photoDataUrl ? photoDataUrl : undefined,
      color: modalTab === "photo" ? "cyan" : "yellow",
      createdAt: new Date().toISOString(),
    };

    try {
      await offlineStorage.saveAnnotation(noteItem);
      setAnnotations((prev) => [noteItem, ...prev]);
      setNewNoteSubject("");
      setNewNoteText("");
      setNewNotePage("1");
      setPhotoDataUrl(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save personal revision note:", err);
    }
  };

  const filteredAnnotations = annotations.filter((item) => {
    const matchesFilter = filterType === "all" || item.type === filterType;
    const content = item.content || "";
    const title = item.title || "";
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      content.toLowerCase().includes(query) ||
      title.toLowerCase().includes(query);
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
            Handwritten photo notes, saved study points, and textbook highlights for exam revision.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalTab("photo");
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition self-start sm:self-auto"
        >
          <Camera className="h-4 w-4" />
          <span>Add Notes / Photo</span>
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
            placeholder="Search revision notes or handwritten topics..."
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {(
            [
              { id: "all", label: "All Notes" },
              { id: "photo", label: "Handwritten Photos" },
              { id: "note", label: "Typed Notes" },
              { id: "highlight", label: "Highlights" },
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
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center mx-auto">
            <Camera className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No revision notes found
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take a photo of your handwritten lecture notes or write typed notes using the button above to revise easily anywhere.
          </p>
          <button
            type="button"
            onClick={() => {
              setModalTab("photo");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
          >
            <Camera className="h-4 w-4" />
            <span>Snap Handwritten Notes</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnotations.map((item) => {
            const isHighlight = item.type === "highlight";
            const isPhoto = item.type === "photo";
            const isCustom = item.documentId === "custom";

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isPhoto
                          ? "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                          : isHighlight
                            ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isPhoto ? "Handwritten Note" : isHighlight ? "Highlight" : "Study Note"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.title && (
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                  )}

                  {/* Photo Thumbnail */}
                  {isPhoto && item.imageUrl && (
                    <div
                      onClick={() => setLightboxAnnotation(item)}
                      className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 cursor-pointer group aspect-video sm:aspect-4/3 flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title || "Handwritten revision notes"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{
                          filter: "contrast(125%) brightness(105%)",
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold backdrop-blur-2xs">
                        <Maximize2 className="h-4 w-4" />
                        <span>Enlarge Notes</span>
                      </div>
                    </div>
                  )}

                  {item.content && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                      {isHighlight ? `"${item.content}"` : item.content}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isPhoto && (
                      <button
                        type="button"
                        onClick={() => setLightboxAnnotation(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Photo</span>
                      </button>
                    )}
                    {!isCustom && (
                      <Link
                        href={`/student/read/${item.documentId}?page=${item.pageNumber}`}
                        className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>Open Document</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

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
            );
          })}
        </div>
      )}

      {/* Add Note Modal (Photo Snap or Typed Note) */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Add Personal Revision Notes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Mode Tabs: Photo of Handwritten Notes vs Typed Note */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setModalTab("photo")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  modalTab === "photo"
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Snap Handwritten Notes</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("text")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  modalTab === "text"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Type Text Note</span>
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Photo Upload / Capture Section */}
              {modalTab === "photo" && (
                <div className="space-y-3">
                  {/* Hidden native camera/file inputs */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!photoDataUrl ? (
                    <div className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-850 bg-sky-50/50 dark:bg-sky-950/30 p-6 text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                        <Camera className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Take Photo of your Handwritten Notes
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Clean smart storage for lecture jottings, formulas, and tutorial summaries.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Open Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload from Gallery</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 max-h-64 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoDataUrl}
                          alt="Captured handwritten note"
                          className="max-h-64 w-auto object-contain"
                          style={{
                            filter: smartCleanEnabled
                              ? "contrast(135%) brightness(105%) grayscale(15%)"
                              : "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl(null)}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition"
                          title="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smartCleanEnabled}
                            onChange={(e) => setSmartCleanEnabled(e.target.checked)}
                            className="rounded accent-sky-600"
                          />
                          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                          <span>Smart Paper Contrast (Enhances legibility)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          Retake
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject or Topic
                </label>
                <input
                  type="text"
                  required
                  value={newNoteSubject}
                  onChange={(e) => setNewNoteSubject(e.target.value)}
                  placeholder="e.g. Constitutional Law Lecture 4, Calculus Derivative Proof"
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {modalTab === "photo" ? "Key Points / Caption (Optional)" : "Revision Content"}
                </label>
                <textarea
                  rows={modalTab === "photo" ? 2 : 4}
                  required={modalTab === "text"}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={
                    modalTab === "photo"
                      ? "Brief summary of what's written on this page for quick search..."
                      : "Write formulas, exam definitions, statutory principles, or study notes..."
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={photoProcessing || (modalTab === "photo" && !photoDataUrl)}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition"
                >
                  Save to Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Size Photo View */}
      {lightboxAnnotation && lightboxAnnotation.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-between p-4"
          onClick={() => setLightboxAnnotation(null)}
        >
          <div
            className="w-full max-w-4xl flex items-center justify-between text-white pb-3 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm sm:text-base font-black">
                {lightboxAnnotation.title || "Handwritten Revision Notes"}
              </h3>
              <p className="text-xs text-slate-300">
                Saved on {new Date(lightboxAnnotation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxAnnotation(null)}
              className="h-8 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>

          <div
            className="flex-1 w-full max-w-4xl flex items-center justify-center p-2 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxAnnotation.imageUrl}
              alt={lightboxAnnotation.title || "Full size handwritten notes"}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              style={{
                filter: "contrast(130%) brightness(105%)",
              }}
            />
          </div>

          {lightboxAnnotation.content && (
            <div
              className="w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-white text-xs mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium text-slate-200">{lightboxAnnotation.content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
