"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  X,
  FileText,
  ExternalLink,
  Download
} from "lucide-react";
import { Announcement } from "@/types/features";

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Announcement["type"]>("announcement");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<Announcement["priority"]>("medium");
  const [isActive, setIsActive] = useState(true);
  const [autoHideDuration, setAutoHideDuration] = useState<number | "">("");
  const [showOncePerSession, setShowOncePerSession] = useState(false);

  // Attachment states
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      if (data) setAnnouncements(data as Announcement[]);
    } catch (err) {
      console.error("Error loading announcements:", err);
      setError("Failed to fetch announcements repository.");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("announcement");
    setButtonText("");
    setButtonUrl("");
    setStartDate("");
    setEndDate("");
    setPriority("medium");
    setIsActive(true);
    setAutoHideDuration("");
    setShowOncePerSession(false);
    setBannerFile(null);
    setExistingBannerUrl(null);
    setPdfFile(null);
    setExistingPdfUrl(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (ann: Announcement) => {
    setEditId(ann.id);
    setTitle(ann.title);
    setMessage(ann.message);
    setType(ann.type);
    setButtonText(ann.button_text || "");
    setButtonUrl(ann.button_url || "");
    setPriority(ann.priority);
    setIsActive(ann.is_active);
    setAutoHideDuration(ann.auto_hide_duration || "");
    setShowOncePerSession(ann.show_once_per_session);
    setExistingBannerUrl(ann.banner_url);
    setExistingPdfUrl(ann.pdf_url);

    // Format ISO Dates to local YYYY-MM-DDTHH:mm
    if (ann.start_date) {
      const date = new Date(ann.start_date);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setStartDate(localISOTime);
    } else {
      setStartDate("");
    }

    if (ann.end_date) {
      const date = new Date(ann.end_date);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setEndDate(localISOTime);
    } else {
      setEndDate("");
    }

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const { error: patchErr } = await supabase
        .from("announcements")
        .update({ is_active: !ann.is_active, updated_at: new Date().toISOString() })
        .eq("id", ann.id);

      if (patchErr) throw patchErr;
      setAnnouncements(announcements.map((a) => a.id === ann.id ? { ...a, is_active: !a.is_active } : a));
      setSuccess("Announcement status updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !message.trim()) {
      setError("Title and Message content are required.");
      return;
    }

    setSaving(true);
    let finalBannerUrl = existingBannerUrl;
    let finalPdfUrl = existingPdfUrl;

    try {
      // 1. Upload Banner Image if selected
      if (bannerFile) {
        const fileExt = bannerFile.name.split(".").pop();
        const uniqueFileName = `banner_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `announcements/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(storagePath, bannerFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(storagePath);

        finalBannerUrl = publicUrl;
      }

      // 2. Upload PDF attachment if selected
      if (pdfFile) {
        const fileExt = pdfFile.name.split(".").pop();
        const uniqueFileName = `doc_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `announcements/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(storagePath, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(storagePath);

        finalPdfUrl = publicUrl;
      }

      // 3. Payload
      const payload: Record<string, string | number | boolean | null | undefined> = {
        title,
        message,
        type,
        button_text: buttonText.trim() ? buttonText : null,
        button_url: buttonUrl.trim() ? buttonUrl : null,
        banner_url: finalBannerUrl,
        pdf_url: finalPdfUrl,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        priority,
        is_active: isActive,
        auto_hide_duration: autoHideDuration !== "" ? Number(autoHideDuration) : null,
        show_once_per_session: showOncePerSession,
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error: dbError } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editId);

        if (dbError) throw dbError;
        setSuccess("Announcement updated successfully!");
      } else {
        const { error: dbError } = await supabase
          .from("announcements")
          .insert([payload]);

        if (dbError) throw dbError;
        setSuccess("New announcement created successfully!");
      }

      resetForm();
      fetchAnnouncements();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save announcement.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann: Announcement) => {
    if (!confirm("Are you sure you want to delete this announcement popup campaign?")) return;

    try {
      // Cleanup files in storage
      const pathsToDelete: string[] = [];
      
      if (ann.banner_url) {
        try {
          const url = new URL(ann.banner_url);
          const pathMatch = url.pathname.match(/\/images\/(.+)$/);
          if (pathMatch?.[1]) pathsToDelete.push(decodeURIComponent(pathMatch[1]));
        } catch {}
      }

      if (ann.pdf_url) {
        try {
          const url = new URL(ann.pdf_url);
          const pathMatch = url.pathname.match(/\/images\/(.+)$/);
          if (pathMatch?.[1]) pathsToDelete.push(decodeURIComponent(pathMatch[1]));
        } catch {}
      }

      if (pathsToDelete.length > 0) {
        await supabase.storage
          .from("images")
          .remove(pathsToDelete);
      }

      const { error: dbError } = await supabase
        .from("announcements")
        .delete()
        .eq("id", ann.id);

      if (dbError) throw dbError;
      setAnnouncements(announcements.filter((a) => a.id !== ann.id));
      setSuccess("Announcement deleted successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete announcement.");
    }
  };

  const getPriorityColor = (lvl: Announcement["priority"]) => {
    switch (lvl) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };



  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Announcements & Popups Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author and schedule global modal popups to alert users upon landing.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Hide Form" : "Create Announcement"}</span>
        </button>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-sm text-red-300 animate-fade-in max-w-4xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-sm text-emerald-400 animate-fade-in max-w-4xl">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form editor */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 max-w-4xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-md font-bold text-white">
              {editId ? "Edit Announcement Campaign" : "New Announcement Campaign"}
            </h2>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:bg-slate-700 transition-all"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Preview Mockup</span>
            </button>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-6">
            {/* Title & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Schedule for End Semester Examinations"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Announcement Category (Type)
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Announcement["type"])}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <option value="announcement" className="bg-slate-900">Announcement</option>
                  <option value="exam_update" className="bg-slate-900">Exam Update</option>
                  <option value="new_notes" className="bg-slate-900">New Notes Available</option>
                  <option value="news_update" className="bg-slate-900">News Update</option>
                  <option value="important_notice" className="bg-slate-900">Important Notice</option>
                  <option value="event" className="bg-slate-900">Event</option>
                  <option value="general" className="bg-slate-900">General Information</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Message Content *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                placeholder="Compose the announcement details. Standard HTML linebreaks are preserved."
              />
            </div>

            {/* Banner Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Banner Image (Optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group">
                  <Upload className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1" />
                  <span className="text-xs text-slate-500 group-hover:text-slate-300">
                    {bannerFile ? bannerFile.name : existingBannerUrl ? "Image Linked (Click to change)" : "Select image cover asset"}
                  </span>
                  <input type="file" className="hidden" onChange={handleBannerChange} accept="image/*" />
                </label>
                {existingBannerUrl && !bannerFile && (
                  <span className="text-[10px] text-slate-550 block mt-1 truncate">Current: {existingBannerUrl}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  PDF Attachment (Optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group">
                  <Upload className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1" />
                  <span className="text-xs text-slate-500 group-hover:text-slate-300">
                    {pdfFile ? pdfFile.name : existingPdfUrl ? "Document Linked (Click to change)" : "Select PDF syllabus/table file"}
                  </span>
                  <input type="file" className="hidden" onChange={handlePdfChange} accept=".pdf" />
                </label>
                {existingPdfUrl && !pdfFile && (
                  <span className="text-[10px] text-slate-550 block mt-1 truncate">Current: {existingPdfUrl}</span>
                )}
              </div>
            </div>

            {/* CTA Button Text & Button URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Action Button Label (Optional)
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Read Circular"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Action Button URL
                </label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="https://example.com/exam-timetable"
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Scheduling Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Expiry Scheduling Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            {/* Priority & Auto-Hide & Session limits & Active status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Priority level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Announcement["priority"])}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Auto-Hide (Seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  value={autoHideDuration}
                  onChange={(e) => setAutoHideDuration(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="e.g. 10 (Optional)"
                />
              </div>

              <div className="flex flex-col justify-end pt-2">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Limit</span>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={showOncePerSession}
                    onChange={(e) => setShowOncePerSession(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-800 focus:ring-0"
                  />
                  <span>Show Once Per Session</span>
                </label>
              </div>

              <div className="flex flex-col justify-end pt-2">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publishing Status</span>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-800 focus:ring-0"
                  />
                  <span>Mark Active</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-850">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editId ? "Update Campaign" : "Publish Campaign"}</span>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-400 hover:text-white border border-slate-750 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Campaigns List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h2 className="text-md font-bold text-white mb-6">Announcement Campaigns</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <Megaphone className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No popups configured yet</p>
            <p className="text-xs text-slate-650 mt-1">
              Add a new announcement above to launch a landing notification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Announcement Info", "Category", "Priority", "Scheduling", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors group">
                    <td className="py-3.5 px-4 first:pl-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="max-w-xs sm:max-w-md">
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-50 leading-tight truncate">
                            {ann.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1 truncate">
                            {ann.message}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="capitalize font-semibold text-slate-400">
                        {ann.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityColor(ann.priority)}`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 space-y-1">
                      {ann.start_date || ann.end_date ? (
                        <>
                          {ann.start_date && (
                            <p className="leading-none">Start: {new Date(ann.start_date).toLocaleDateString()}</p>
                          )}
                          {ann.end_date && (
                            <p className="leading-none">End: {new Date(ann.end_date).toLocaleDateString()}</p>
                          )}
                        </>
                      ) : (
                        <span>Immediate / Permanent</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(ann)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={ann.is_active ? "Mark Inactive" : "Mark Active"}
                      >
                        {ann.is_active ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                            <ToggleRight className="w-6 h-6 text-emerald-400" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                            <ToggleLeft className="w-6 h-6 text-slate-600" />
                            <span>Inactive</span>
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(ann)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-450 text-slate-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulated Live Preview Mockup Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
            {/* Top Close */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulated category indicator line */}
            <div className={`h-1.5 -mx-6 -mt-6 ${
              type === "important_notice" ? "bg-red-500" :
              type === "exam_update" ? "bg-blue-500" :
              type === "new_notes" ? "bg-emerald-500" :
              type === "news_update" ? "bg-purple-500" :
              type === "event" ? "bg-yellow-500" :
              "bg-cyan-500"
            }`} />

            <div className="space-y-4">
              {/* Type Badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {type.replace(/_/g, " ")}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                {title || "Template Announcement Title"}
              </h3>

              {/* Banner image simulator */}
              {bannerFile || existingBannerUrl ? (
                <div className="w-full aspect-video rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                  {bannerFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(bannerFile)}
                      alt="Banner Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={existingBannerUrl!}
                      alt="Banner Preview"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              ) : null}

              {/* Message */}
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {message || "This is a preview of your notification contents. Specify announcement text to display detailed guidance."}
              </p>

              {/* PDF Document attachment mockup */}
              {(pdfFile || existingPdfUrl) && (
                <div className="flex items-center gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-400 cursor-pointer">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Download circular document ({pdfFile ? pdfFile.name : "Linked Document"})</span>
                  <Download className="w-3.5 h-3.5 ml-auto text-emerald-500" />
                </div>
              )}

              {/* CTA link button */}
              {buttonUrl.trim() && (
                <a
                  href={buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <span>{buttonText || "Learn More"}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Footer controls simulator */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" disabled className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800" />
                <span>Don&apos;t Show Again Today</span>
              </label>
              <span>Priority: <strong className="uppercase text-slate-400">{priority}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
