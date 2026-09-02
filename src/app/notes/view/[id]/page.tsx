"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  ArrowLeft,
  FileText,
  ShieldAlert
} from "lucide-react";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <p className="text-xs font-bold tracking-wider text-slate-500 animate-pulse">Initializing Enterprise PDF Engine...</p>
    </div>
  )
});

interface Note {
  id: string;
  title: string;
  course: string;
  semester: number;
  subject: string;
  description: string;
}

export default function SecureNoteViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Session Redirect Guard
  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [profile, authLoading, router]);

  // 2. Fetch Note Metadata
  useEffect(() => {
    if (!noteId || !profile) return;
    const studentId = profile.id;

    async function fetchNoteMetadata() {
      try {
        setLoadingNote(true);
        const { data, error: noteError } = await supabase
          .from("notes")
          .select("id, title, course, semester, subject, description")
          .eq("id", noteId)
          .single();

        if (noteError || !data) {
          throw new Error("Notes file is currently unavailable.");
        }
        setNote(data as Note);

        // Log note preview activity
        fetch("/api/student/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: studentId,
            contentType: "notes",
            contentId: data.id,
            contentTitle: data.title,
            contentUrl: `/notes/view/${data.id}`
          })
        }).catch(err => console.error("Error logging note activity:", err));
        
      } catch (err: unknown) {
        console.error("Error retrieving note metadata:", err);
        const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : err instanceof Error ? err.message : "Unable to load these notes right now.";
        setError(msg);
      } finally {
        setLoadingNote(false);
      }
    }

    fetchNoteMetadata();
  }, [noteId, profile]);

  // 3. Fetch PDF Stream ArrayBuffer
  useEffect(() => {
    if (!noteId || !profile) return;
    const studentId = profile.id;

    let isCancelled = false;

    async function loadPdfDocument() {
      try {
        setLoadingPdf(true);
        const res = await fetch(`/api/student/notes/view?noteId=${noteId}&studentId=${studentId}`);
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized session. Please re-login.");
          }
          throw new Error("Failed to load PDF document.");
        }

        const arrayBuffer = await res.arrayBuffer();
        if (isCancelled) return;

        setPdfArrayBuffer(arrayBuffer);
        setLoadingPdf(false);
      } catch (err: unknown) {
        console.error("Error loading PDF document:", err);
        if (!isCancelled) {
          const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : err instanceof Error ? err.message : "Failed to load note document.";
          setError(msg);
          setLoadingPdf(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isCancelled = true;
    };
  }, [noteId, profile]);

  // Loading indicator screen
  if (authLoading || (loadingNote && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-bold tracking-wide">Loading Notes...</p>
      </div>
    );
  }

  // Error/Security Warning screen
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Access Warning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={() => router.push("/notes")}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  const courseFolderUrl = note ? `/notes/${encodeURIComponent(note.course)}` : "/notes";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col select-none">
      
      {/* 1. Header Toolbar */}
      <header className="bg-slate-900 border-b border-slate-850 py-3 px-4 sm:px-6 flex items-center justify-between text-slate-100 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href={courseFolderUrl}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors flex-shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-1.5 py-0.5 rounded">
                {note?.course}
              </span>
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                {note?.subject}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[280px] sm:max-w-md mt-0.5">
              {note?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-2xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-2.5 py-1 rounded-lg border border-cyan-900/20 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Secure Enterprise Preview
          </span>
        </div>
      </header>

      {/* 2. PDF Viewer Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {loadingPdf ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-bold tracking-wider text-slate-500 animate-pulse">Decrypting &amp; Preparing Secure Stream...</p>
          </div>
        ) : (
          <PdfViewer 
            arrayBuffer={pdfArrayBuffer}
            documentTitle={note?.title || "Note Document"}
            preventDownload={true}
          />
        )}
      </main>

    </div>
  );
}
