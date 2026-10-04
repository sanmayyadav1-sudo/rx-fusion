"use client";

import React, { useState } from "react";
import { 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Send, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Loader2
} from "lucide-react";
import { ArticleOrder, ArticleOrderFormData, OFFICIAL_SUPPORT_EMAIL } from "@/types/articleOrder";

interface SubmittedOrderResponse {
  success: boolean;
  order: ArticleOrder;
  emailDetails: {
    to: string;
    recipient: string;
    subject: string;
    body: string;
    mailtoUrl: string;
  };
  mailtoUrl: string;
}

export default function ArticleOrderServicePage() {
  const [formData, setFormData] = useState<ArticleOrderFormData>({
    service_type: "Review Article",
    name: "",
    email: "",
    mobile: "",
    topic: "",
    course: "",
    institution: "",
    word_count: 3000,
    references_count: 35,
    citation_style: "Vancouver",
    deadline: "",
    target_journal: "",
    additional_requirements: "",
    brief: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrderResponse | null>(null);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError("Please provide your full contact details (Name, Email, Mobile/WhatsApp).");
      return;
    }
    if (!formData.topic.trim()) {
      setError("Please state the specific article or research topic.");
      return;
    }
    if (!formData.course.trim() || !formData.institution.trim()) {
      setError("Please provide your course and institution information.");
      return;
    }
    if (!formData.deadline.trim()) {
      setError("Please specify your desired deadline date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/article-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSubmittedOrder(data);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmailText = () => {
    if (!submittedOrder?.emailDetails?.body) return;
    navigator.clipboard.writeText(submittedOrder.emailDetails.body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-900">
      
      <main className="flex-grow pt-24 sm:pt-28 pb-20 relative">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-[30rem] h-[30rem] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 relative">
          
          {/* Hero Section */}
          <header className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[11px] font-bold text-cyan-700 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>RxFusion Academic & Clinical Writing Support</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Order an Article / Research Paper
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Structured methodology assistance, systematic literature searches, bibliographic referencing, and manuscript structuring for pharmacy scholars, Pharm.D clinicians, and researchers.
            </p>
          </header>

          {/* Two Distinct Service Categories (Requirement 6) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category 1: Review Article */}
            <div 
              onClick={() => setFormData(prev => ({ ...prev, service_type: "Review Article" }))}
              className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                formData.service_type === "Review Article"
                  ? "bg-white border-cyan-500 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/5"
                  : "bg-white/80 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    formData.service_type === "Review Article" ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {formData.service_type === "Review Article" ? "Selected" : "Category 1"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">Review Article Assistance</h3>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive literature synthesis, narrative reviews, and systematic overviews of drug therapeutics, clinical pharmacology, and pharmaceutical science.
                </p>

                <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>In-depth PubMed, Scopus & ScienceDirect literature mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>Mechanism of action & clinical trial timeline structuring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>Vancouver or APA bibliographic citation management</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600">
                <span>Select Review Article</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Category 2: Research Article / Research Paper */}
            <div 
              onClick={() => setFormData(prev => ({ ...prev, service_type: "Research Article / Research Paper" }))}
              className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                formData.service_type === "Research Article / Research Paper"
                  ? "bg-white border-cyan-500 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/5"
                  : "bg-white/80 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    formData.service_type === "Research Article / Research Paper" ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {formData.service_type === "Research Article / Research Paper" ? "Selected" : "Category 2"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">Research Article / Paper</h3>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manuscript drafting for primary experimental studies, observational cohorts, clinical pharmacy audits, pharmacovigilance, and survey-based inquiries.
                </p>

                <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>IMRAD structure: Introduction, Methods, Results, Discussion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Statistical narrative synthesis and table/figure preparation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Journal author guideline compliance & formatting</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600">
                <span>Select Research Article</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </section>

          {/* CRITICAL ETHICAL DISCLAIMER (Requirement 6) */}
          <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-5 text-slate-600 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>Ethical & Academic Integrity Notice</span>
            </div>
            <p>
              RxFusion provides scientific and academic writing assistance, literature curation, and manuscript formatting strictly for educational, reference, and academic guidance purposes. <strong>We do not guarantee publication, journal acceptance, Scopus/indexing indexation, specific AI-detector thresholds, or experimental study outcomes.</strong> All author responsibility remains with the submitting researchers.
            </p>
          </div>

          {/* SUCCESS MODAL / CONFIRMATION (Requirement 8) */}
          {submittedOrder && (
            <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                    Request Recorded Successfully
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Order Ref: {submittedOrder.order?.order_number}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your request has been filed in the RxFusion academic order registry. A pre-addressed email message to our faculty review desk (<strong>{OFFICIAL_SUPPORT_EMAIL}</strong>) has been generated below.
              </p>

              {/* Email actions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Official Support Recipient:</span>
                  <strong className="text-cyan-700 font-mono">{OFFICIAL_SUPPORT_EMAIL}</strong>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={submittedOrder.emailDetails?.mailtoUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Email App (Pre-filled)</span>
                  </a>

                  <button
                    onClick={handleCopyEmailText}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-all"
                  >
                    {copiedBody ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBody ? "Copied to Clipboard!" : "Copy Order Details"}</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setSubmittedOrder(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Submit Another Article Request
                </button>
              </div>
            </div>
          )}

          {/* RESPONSIVE ORDER FORM (Requirement 7) */}
          {!submittedOrder && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Article / Research Order Specification
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fields marked with <strong className="text-rose-500">*</strong> are required for processing.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Service Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Service Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Review Article">Review Article (Comprehensive Literature Synthesis)</option>
                    <option value="Research Article / Research Paper">Research Article / Research Paper (Primary / Clinical Study)</option>
                  </select>
                </div>

                {/* 2. Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Dr. Rahul Sharma"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g., scholar@institution.edu"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="e.g., +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 3. Academic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Academic / Professional Course <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g., Pharm.D 5th Year / M.Pharm Pharmacology / Ph.D"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      College / Institution Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="e.g., Manipal College of Pharmaceutical Sciences"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 4. Topic & Scope */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Proposed Title / Topic <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., Pharmacotherapeutic Role of GLP-1 Receptor Agonists in Non-Alcoholic Fatty Liver Disease"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                {/* 5. Metrics: Word Count, References, Citation Style, Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Required Word Count <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="word_count"
                      min="500"
                      max="20000"
                      value={formData.word_count}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Number of References <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="references_count"
                      min="5"
                      max="200"
                      value={formData.references_count}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Citation Style <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="citation_style"
                      value={formData.citation_style}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Vancouver">Vancouver (Medical standard)</option>
                      <option value="APA">APA 7th Edition</option>
                      <option value="Other">Other / Journal Specific</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target Deadline <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 6. Journal Target Requirement (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Journal / Format Guidelines (Optional)
                  </label>
                  <input
                    type="text"
                    name="target_journal"
                    value={formData.target_journal}
                    onChange={handleChange}
                    placeholder="e.g., Indian Journal of Pharmacology / Elsevier European Journal of Pharmacology guidelines"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>

                {/* 7. Research Brief & Requirements */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Research / Article Brief & Specific Requirements
                  </label>
                  <textarea
                    name="brief"
                    rows={4}
                    value={formData.brief}
                    onChange={handleChange}
                    placeholder="Describe specific key sub-headings, target populations, inclusion criteria, or clinical trial mechanisms you want highlighted..."
                    className="w-full px-4 py-3 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    name="additional_requirements"
                    rows={2}
                    value={formData.additional_requirements}
                    onChange={handleChange}
                    placeholder="e.g., specific referencing software (Mendeley, Zotero) or flow-chart diagram formats..."
                    className="w-full px-4 py-3 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit Button (Requirement 7) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-lg shadow-cyan-600/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Article Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Your request will be routed directly to <strong>{OFFICIAL_SUPPORT_EMAIL}</strong> and logged in our system.
                  </p>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
