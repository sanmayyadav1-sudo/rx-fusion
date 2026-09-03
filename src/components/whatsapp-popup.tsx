"use client";

import React from "react";
import { X, GraduationCap } from "lucide-react";
import { Profile } from "@/context/AuthContext";

interface WhatsappPopupProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export default function WhatsappPopup({ isOpen, onClose, profile }: WhatsappPopupProps) {
  // Keyboard Escape listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleContactClick = () => {
    if (!profile) return;

    const name = profile.full_name || "N/A";
    const course = profile.course === "Other" ? profile.custom_course || "Other" : profile.course || "N/A";
    const year = profile.current_year || "N/A";
    const college = profile.college_name || "N/A";
    const mobile = profile.mobile_number || "N/A";
    const email = profile.email || "N/A";

    const rawMessage = `Hello RxFusion 👋\n\nI have used my 2 free notes downloads on the RxFusion website and I want access to more notes.\n\nMy Details:\n\nName: ${name}\nCourse: ${course}\nYear: ${year}\nCollege: ${college}\nMobile: ${mobile}\nEmail: ${email}\n\nPlease help me get access to more RxFusion notes.\n\nThank you.`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/917350410894?text=${encodedMessage}`;
    
    // Open in a new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Download Limit Reached"
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center animate-scale-up overflow-hidden"
      >
        {/* Glow visual accents */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-450 hover:text-slate-700 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* RxFusion Logo */}
        <div className="flex flex-col items-center mb-5 mt-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-800">
            Rx<span className="text-cyan-500">Fusion</span>
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          You&apos;ve Used Your 2 Free Downloads
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6 px-2 font-semibold">
          You&apos;ve already downloaded 2 notes for free. Contact RxFusion on WhatsApp to get access to more pharmacy notes and learning resources.
        </p>

        {/* Actions */}
        <div className="space-y-3 w-full">
          <button
            onClick={handleContactClick}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-cyan-500/10 active:translate-y-0.5"
          >
            {/* Simple SVG icon for WhatsApp */}
            <svg
              className="w-4.5 h-4.5 text-white mr-1.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.63 1.977 14.154.952 11.53.951c-5.444 0-9.87 4.372-9.874 9.802-.001 1.73.463 3.42 1.343 4.927l-.958 3.5 3.6-.94c1.514.826 3.1 1.258 4.675 1.258h.023zm10.963-7.477c-.3-.15-1.77-.875-2.046-.975-.276-.1-.477-.15-.677.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.04-1.52-4.004-2.61-4.74-3.885-.196-.34-.02-.52.15-.69.15-.15.3-.35.45-.53.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.625-.926-2.225-.244-.589-.493-.51-.677-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.897 4.33.685.297 1.22.474 1.637.607.69.219 1.317.188 1.812.114.55-.082 1.77-.725 2.02-1.425.25-.7.25-1.3 1.75-1.4.075-.1.225-.25.075-.4z" />
            </svg>
            <span>Contact RxFusion on WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all text-center shadow-3xs"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
