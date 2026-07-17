"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Loader2, 
  ArrowLeft,
  FileText,
  ShieldAlert
} from "lucide-react";

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
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [fitWidth, setFitWidth] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

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
            contentUrl: `/notes/${encodeURIComponent(data.course)}`
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

  // 3. Fetch PDF Stream and Load Document
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

        // @ts-expect-error Subpath import for browser PDF.js bundle
        const pdfjsLib = await import("pdfjs-dist/build/pdf.min.js");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
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

  // 4. Render Page helper
  const renderPage = useCallback(async (pageNo: number, scaleFactor: number, fitToWidth: boolean) => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      // Cancel previous render task if active
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(pageNo);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      let viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      
      let renderScale = scaleFactor;
      if (fitToWidth) {
        renderScale = containerWidth / viewport.width;
        // Cap fitWidth render scale at 1.5 for premium readability
        if (renderScale > 1.5) renderScale = 1.5;
        setZoom(renderScale);
      }
      
      viewport = page.getViewport({ scale: renderScale });
      
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: context,
        transform: transform || undefined,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: unknown) {
      const renderErr = err as { name?: string };
      if (renderErr?.name === "RenderingCancelledException") {
        // Safe to ignore: user navigated or zoomed before render finished
      } else {
        console.error("PDF page render error:", err);
      }
    }
  }, [pdfDoc]);

  // 5. Trigger page render on page/zoom/document changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum, zoom, fitWidth);
    }
  }, [pdfDoc, pageNum, zoom, fitWidth, renderPage]);

  // 6. Handle window resize for dynamic responsive scaling
  useEffect(() => {
    if (!pdfDoc) return;
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (fitWidth) {
          renderPage(pageNum, zoom, true);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [pdfDoc, pageNum, zoom, fitWidth, renderPage]);

  // UI Handlers
  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < numPages) setPageNum(pageNum + 1);
  };

  const handleZoomIn = () => {
    setFitWidth(false);
    setZoom(prev => Math.min(prev + 0.15, 3.0));
  };

  const handleZoomOut = () => {
    setFitWidth(false);
    setZoom(prev => Math.max(prev - 0.15, 0.5));
  };

  const handleFitWidth = () => {
    setFitWidth(true);
  };

  const preventDefaultContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Loading indicator screen
  if (authLoading || (loadingNote && !error)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-bold tracking-wide">Loading Notes...</p>
      </div>
    );
  }

  // Error/Security Warning screen
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700/50 p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Access Warning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={() => router.push("/notes")}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
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
              <span className="text-[10px] text-slate-450 font-bold hidden sm:inline">
                {note?.subject}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[280px] sm:max-w-md mt-0.5">
              {note?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-2xs font-extrabold text-cyan-500 uppercase tracking-widest bg-cyan-950/10 px-2.5 py-1 rounded-lg border border-cyan-900/10 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Secure Preview
          </span>
        </div>
      </header>

      {/* 2. PDF Rendering Container */}
      <div 
        ref={containerRef}
        onContextMenu={preventDefaultContextMenu}
        className="flex-1 overflow-auto bg-slate-950 flex items-start justify-center p-4 sm:p-6 relative min-h-0"
      >
        {loadingPdf ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-xs font-bold tracking-wider text-slate-500 animate-pulse">Rendering Secure View...</p>
          </div>
        ) : (
          <div className="shadow-2xl border border-slate-800 rounded-xl overflow-hidden bg-white max-w-full">
            <canvas ref={canvasRef} className="block pointer-events-none" />
          </div>
        )}
      </div>

      {/* 3. Floating Navigation and Zoom controls bar */}
      <footer className="bg-slate-900 border-t border-slate-850 px-4 py-3 flex items-center justify-between text-slate-200 select-none z-10 gap-4 flex-wrap">
        
        {/* Navigation Page controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pageNum <= 1 || loadingPdf}
            className="p-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-350 rounded-xl transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-300 min-w-[70px] text-center">
            {loadingPdf ? "Page 0 of 0" : `Page ${pageNum} of ${numPages}`}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNum >= numPages || loadingPdf}
            className="p-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-355 rounded-xl transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleZoomOut}
            disabled={loadingPdf}
            className="p-2 bg-slate-850 hover:bg-slate-850 hover:text-white text-slate-350 rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-2xs font-bold text-slate-400 min-w-[40px] text-center hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={loadingPdf}
            className="p-2 bg-slate-850 hover:bg-slate-850 hover:text-white text-slate-350 rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />
          <button
            onClick={handleFitWidth}
            disabled={loadingPdf}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-2xs font-bold
              ${fitWidth 
                ? "bg-cyan-500 hover:bg-cyan-600 text-white" 
                : "bg-slate-850 hover:bg-slate-800 text-slate-350"
              }`}
            title="Fit Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Fit Width</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
