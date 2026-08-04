"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Loader2, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Sidebar, 
  RotateCw, 
  ShieldAlert,
  Lock,
  DownloadCloud
} from "lucide-react";

interface PdfViewerProps {
  arrayBuffer?: ArrayBuffer | null;
  url?: string;
  documentTitle?: string;
  preventDownload?: boolean;
}

export default function PdfViewer({ 
  arrayBuffer, 
  url, 
  documentTitle = "Secure PDF Document",
  preventDownload = true 
}: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.2);
  const [fitMode, setFitMode] = useState<"custom" | "width" | "page">("width");
  const [rotation, setRotation] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");

  // Search state
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Bookmarks state (persistent in localStorage)
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  // Load Bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pdf_bookmarks_${documentTitle}`);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [documentTitle]);

  const toggleBookmark = (page: number) => {
    let updated: number[];
    if (bookmarks.includes(page)) {
      updated = bookmarks.filter(b => b !== page);
    } else {
      updated = [...bookmarks, page].sort((a, b) => a - b);
    }
    setBookmarks(updated);
    try {
      localStorage.setItem(`pdf_bookmarks_${documentTitle}`, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  // 1. Core PDF Loading Logic
  const loadPdf = useCallback(async (password?: string) => {
    setLoading(true);
    setError(null);
    setPasswordRequired(false);

    try {
      // Import PDF.js dynamically
      // @ts-expect-error Subpath import for browser PDF.js bundle
      const pdfjsLib = await import("pdfjs-dist/build/pdf.min.js");
      
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      let loadingTask;
      if (arrayBuffer) {
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0), password });
      } else if (url) {
        loadingTask = pdfjsLib.getDocument({ url, password });
      } else {
        throw new Error("No PDF source provided.");
      }

      loadingTask.onPassword = (_updatePassword: (pw: string) => void, reason: number) => {
        if (reason === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
          setPasswordRequired(true);
          setLoading(false);
        } else if (reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
          setError("Incorrect password. Please try again.");
          setPasswordRequired(true);
          setLoading(false);
        }
      };

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setPageNum(1);
      setLoading(false);
    } catch (err: unknown) {
      const errObj = err as { name?: string; message?: string };
      if (errObj?.name === "PasswordException") {
        setPasswordRequired(true);
        setLoading(false);
      } else {
        console.error("PDF loading error:", err);
        setError(errObj?.message || "Failed to load PDF document.");
        setLoading(false);
      }
    }
  }, [arrayBuffer, url]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // 2. Render Page Function
  const renderPage = useCallback(async (pageNo: number, scaleFactor: number, currentFitMode: "custom" | "width" | "page", currentRotation: number) => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(pageNo);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      let viewport = page.getViewport({ scale: 1, rotation: currentRotation });
      const containerWidth = containerRef.current.clientWidth - 48;
      const containerHeight = containerRef.current.clientHeight - 48;

      let computedScale = scaleFactor;
      if (currentFitMode === "width") {
        computedScale = containerWidth / viewport.width;
        if (computedScale > 2.0) computedScale = 2.0;
        setZoom(computedScale);
      } else if (currentFitMode === "page") {
        const scaleW = containerWidth / viewport.width;
        const scaleH = containerHeight / viewport.height;
        computedScale = Math.min(scaleW, scaleH);
        setZoom(computedScale);
      }

      viewport = page.getViewport({ scale: computedScale, rotation: currentRotation });
      
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
      if (renderErr?.name !== "RenderingCancelledException") {
        console.error("Page render error:", err);
      }
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum, zoom, fitMode, rotation);
    }
  }, [pdfDoc, pageNum, zoom, fitMode, rotation, renderPage]);

  // Window Resize Listener for Responsive Fit Width
  useEffect(() => {
    if (!pdfDoc) return;
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (fitMode === "width" || fitMode === "page") {
          renderPage(pageNum, zoom, fitMode, rotation);
        }
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [pdfDoc, pageNum, zoom, fitMode, rotation, renderPage]);

  // Search Implementation
  const handleSearch = async () => {
    if (!pdfDoc || !searchTerm.trim()) return;
    setIsSearching(true);
    const matches: number[] = [];
    const term = searchTerm.toLowerCase();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => (item as { str?: string }).str || "").join(" ").toLowerCase();
        if (pageText.includes(term)) {
          matches.push(i);
        }
      } catch {
        // Skip page error
      }
    }

    setSearchResults(matches);
    setIsSearching(false);
    if (matches.length > 0) {
      setCurrentSearchIndex(0);
      setPageNum(matches[0]);
    } else {
      setCurrentSearchIndex(-1);
    }
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIdx);
    setPageNum(searchResults[nextIdx]);
  };

  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIdx);
    setPageNum(searchResults[prevIdx]);
  };

  // Prevent right-click / context menu if download protection enabled
  const handleContextMenu = (e: React.MouseEvent) => {
    if (preventDownload) {
      e.preventDefault();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setPageNum(prev => Math.min(prev + 1, numPages));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setPageNum(prev => Math.max(prev - 1, 1));
      } else if (e.key === "+" || (e.ctrlKey && e.key === "=")) {
        setFitMode("custom");
        setZoom(prev => Math.min(prev + 0.15, 3.0));
      } else if (e.key === "-" || (e.ctrlKey && e.key === "-")) {
        setFitMode("custom");
        setZoom(prev => Math.max(prev - 0.15, 0.5));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages]);

  // Password Prompt UI
  if (passwordRequired) {
    return (
      <div className="min-h-[500px] bg-slate-950 flex items-center justify-center p-6 text-slate-100 rounded-3xl border border-slate-800">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Password Protected Document</h3>
          <p className="text-xs text-slate-400">This PDF document is encrypted. Please enter the password to view.</p>
          <form onSubmit={(e) => { e.preventDefault(); loadPdf(passwordInput); }} className="space-y-3">
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition-colors">
              Unlock PDF
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Error UI with Retry
  if (error) {
    return (
      <div className="min-h-[500px] bg-slate-950 flex items-center justify-center p-6 text-slate-100 rounded-3xl border border-slate-800">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Unable to Load PDF</h3>
          <p className="text-xs text-slate-400">{error}</p>
          <button onClick={() => loadPdf()} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] min-h-[550px] bg-slate-950 text-slate-100 rounded-3xl border border-slate-850 shadow-2xl overflow-hidden select-none">
      
      {/* 1. Primary Toolbar */}
      <header className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 flex items-center justify-between gap-3 flex-wrap z-20">
        
        {/* Left Actions (Sidebar, Title, Bookmarks) */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-xl transition-colors ${showThumbnails ? "bg-cyan-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
            title="Toggle Thumbnails Sidebar"
          >
            <Sidebar className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleBookmark(pageNum)}
            className={`p-2 rounded-xl transition-colors ${bookmarks.includes(pageNum) ? "bg-amber-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
            title={bookmarks.includes(pageNum) ? "Remove Bookmark" : "Bookmark Page"}
          >
            {bookmarks.includes(pageNum) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <span className="text-xs font-bold text-slate-300 truncate max-w-[200px] sm:max-w-xs ml-1">
            {documentTitle}
          </span>
        </div>

        {/* Middle Page Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setPageNum(prev => Math.max(prev - 1, 1))}
            disabled={pageNum <= 1 || loading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNum}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= numPages) setPageNum(val);
              }}
              className="w-11 px-1.5 py-0.5 text-center bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-extrabold focus:outline-none"
            />
            <span>/ {numPages}</span>
          </div>

          <button
            onClick={() => setPageNum(prev => Math.min(prev + 1, numPages))}
            disabled={pageNum >= numPages || loading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls (Zoom, Fit, Search) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setFitMode("custom"); setZoom(prev => Math.max(prev - 0.15, 0.5)); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-2xs font-extrabold text-slate-400 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => { setFitMode("custom"); setZoom(prev => Math.min(prev + 0.15, 3.0)); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setFitMode("width")}
            className={`px-2.5 py-1 rounded-xl text-2xs font-extrabold transition-colors flex items-center gap-1 ${fitMode === "width" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            title="Fit Width"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Fit Width</span>
          </button>

          <button
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-xl transition-colors ${showSearch ? "bg-cyan-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
            title="Search in PDF"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* Search Sub-bar */}
      {showSearch && (
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2 animate-fade-in">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search text in document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="flex-1 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button onClick={handleSearch} className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl">
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </button>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold ml-2">
              <span>{currentSearchIndex + 1} of {searchResults.length} matches</span>
              <button onClick={prevSearchResult} className="p-1 bg-slate-800 hover:bg-slate-700 rounded"><ChevronLeft className="w-3 h-3" /></button>
              <button onClick={nextSearchResult} className="p-1 bg-slate-800 hover:bg-slate-700 rounded"><ChevronRight className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      )}

      {/* Main Body (Thumbnails + Canvas Container) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <aside className="w-48 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto space-y-3 flex-shrink-0 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Page Navigation</h4>
            {Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPageNum(p)}
                className={`w-full py-3 px-2 rounded-xl border text-center transition-all text-xs font-bold ${pageNum === p ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}
              >
                Page {p}
                {bookmarks.includes(p) && <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 inline ml-1.5" />}
              </button>
            ))}
          </aside>
        )}

        {/* PDF Canvas View Area */}
        <div 
          ref={containerRef}
          onContextMenu={handleContextMenu}
          className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex items-start justify-center relative min-h-0"
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-bold text-slate-500 animate-pulse">Initializing Enterprise PDF Viewer...</p>
            </div>
          ) : (
            <div className="shadow-2xl border border-slate-800 rounded-xl overflow-hidden bg-white max-w-full">
              <canvas ref={canvasRef} className="block pointer-events-none" />
            </div>
          )}
        </div>

      </div>

      {/* Footer Banner */}
      <footer className="bg-slate-900 border-t border-slate-850 px-4 py-2 flex items-center justify-between text-2xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>RxFusion Secure Stream Engine</span>
        </div>
        {preventDownload && (
          <span className="text-amber-400 font-bold uppercase tracking-wider">Protected Preview Mode</span>
        )}
      </footer>

    </div>
  );
}
