"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Stethoscope, Plus, Trash2, Edit, Loader2, Upload, AlertCircle, CheckCircle2, FileText } from "lucide-react";

interface Case {
  id: string;
  slug: string;
  title: string;
  department: string;
  disease: string;
  age: number;
  gender: string;
  chief_complaint: string;
  history: string;
  medication_history: string;
  findings: string;
  diagnosis: string;
  treatment: string;
  monitoring: string;
  outcome: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  discussion: string;
  learning_points: string;
  attachments: string[];
  status: "draft" | "published";
  author: string;
  created_at: string;
}

const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Nephrology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Oncology",
  "Infectious Diseases",
  "Psychiatry",
  "Dermatology",
  "Pediatrics",
  "Others"
];

export default function CasesAdmin() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [department, setDepartment] = useState("Cardiology");
  const [disease, setDisease] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [medicationHistory, setMedicationHistory] = useState("");
  const [findings, setFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [monitoring, setMonitoring] = useState("");
  const [outcome, setOutcome] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [discussion, setDiscussion] = useState("");
  const [learningPoints, setLearningPoints] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [author, setAuthor] = useState("RxFusion Admin");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinical_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setCases(data as Case[]);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to fetch clinical cases.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val: string) =>
    val
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editId) setSlug(generateSlug(val));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFiles(e.target.files);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDepartment("Cardiology");
    setDisease("");
    setAge("");
    setGender("Male");
    setChiefComplaint("");
    setHistory("");
    setMedicationHistory("");
    setFindings("");
    setDiagnosis("");
    setTreatment("");
    setMonitoring("");
    setOutcome("");
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setDiscussion("");
    setLearningPoints("");
    setStatus("draft");
    setAuthor("RxFusion Admin");
    setExistingAttachments([]);
    setNewFiles(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (c: Case) => {
    setEditId(c.id);
    setTitle(c.title);
    setSlug(c.slug);
    setDepartment(c.department);
    setDisease(c.disease);
    setAge(c.age);
    setGender(c.gender);
    setChiefComplaint(c.chief_complaint || "");
    setHistory(c.history || "");
    setMedicationHistory(c.medication_history || "");
    setFindings(c.findings || "");
    setDiagnosis(c.diagnosis || "");
    setTreatment(c.treatment || "");
    setMonitoring(c.monitoring || "");
    setOutcome(c.outcome || "");
    setSubjective(c.subjective || "");
    setObjective(c.objective || "");
    setAssessment(c.assessment || "");
    setPlan(c.plan || "");
    setDiscussion(c.discussion || "");
    setLearningPoints(c.learning_points || "");
    setStatus(c.status);
    setAuthor(c.author);
    setExistingAttachments(c.attachments || []);
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !disease.trim() || age === "" || !slug.trim()) {
      setError("Please fill all required fields (Title, Disease, Patient Age, Slug).");
      return;
    }

    setSaving(true);
    const uploadedUrls: string[] = [...existingAttachments];

    try {
      // Upload new files
      if (newFiles && newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const fileExt = file.name.split(".").pop();
          const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const storagePath = `cases/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(storagePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(storagePath);

          uploadedUrls.push(publicUrl);
        }
      }

      // Payload
      const payload: Record<string, string | number | string[] | null | undefined> = {
        title,
        slug,
        department,
        disease,
        age: Number(age),
        gender,
        chief_complaint: chiefComplaint,
        history,
        medication_history: medicationHistory,
        findings,
        diagnosis,
        treatment,
        monitoring,
        outcome,
        subjective,
        objective,
        assessment,
        plan,
        discussion,
        learning_points: learningPoints,
        attachments: uploadedUrls,
        status,
        author,
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error: dbError } = await supabase
          .from("clinical_cases")
          .update(payload)
          .eq("id", editId);

        if (dbError) throw dbError;
        setSuccess("Clinical case updated successfully!");
      } else {
        const { error: dbError } = await supabase
          .from("clinical_cases")
          .insert([payload]);

        if (dbError) throw dbError;
        setSuccess("New clinical case published successfully!");
      }

      resetForm();
      fetchCases();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save clinical case.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCase = async (id: string, attachments: string[]) => {
    if (!confirm("Are you sure you want to delete this clinical case?")) return;

    try {
      // Clean up attachment files from storage
      if (attachments && attachments.length > 0) {
        for (const urlStr of attachments) {
          try {
            const url = new URL(urlStr);
            const pathMatch = url.pathname.match(/\/images\/(.+)$/);
            if (pathMatch?.[1]) {
              await supabase.storage
                .from("images")
                .remove([decodeURIComponent(pathMatch[1])]);
            }
          } catch (e) {
            console.warn("Could not clean up file:", urlStr, e);
          }
        }
      }

      const { error: dbError } = await supabase
        .from("clinical_cases")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setCases(cases.filter((c) => c.id !== id));
      setSuccess("Clinical case deleted successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete clinical case.");
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setExistingAttachments(existingAttachments.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Clinical Cases Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author and publish patient SOAP notes, clinical logs, and diagnostic studies.
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
          <span>{showForm ? "Hide Form" : "Compose Clinical Case"}</span>
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

      {/* Compose Form */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 max-w-4xl animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            {editId ? "Edit Case Report File" : "Compose New Clinical Case"}
          </h2>

          <form onSubmit={handleSaveCase} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Management of Type-2 Diabetes in Geriatric Patient"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Slug (URL Parameter) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="diabetes-management-geriatric"
                />
              </div>
            </div>

            {/* Department, Disease, Age, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Disease / Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Essential Hypertension"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Patient Age *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. 65"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Patient Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            {/* Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Case Reviewer / Author
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800 my-5" />

            {/* SOAP Section */}
            <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>SOAP Charting Sections</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Subjective (S)</label>
                  <textarea
                    rows={4}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Patient complaints, symptoms, drug history narrative..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Objective (O)</label>
                  <textarea
                    rows={4}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Vital signs, blood tests, laboratory reports, physical findings..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Assessment (A)</label>
                  <textarea
                    rows={4}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Pharmacist assessment, drug-related problems (DRP), disease controls..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plan (P)</label>
                  <textarea
                    rows={4}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Therapeutic recommendations, dosage adjustments, counseling plans..."
                  />
                </div>
              </div>
            </div>

            {/* Case Content Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Chief Complaint
                </label>
                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                  placeholder="Primary reason patient sought medical help..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  History of Present Illness (HPI)
                </label>
                <textarea
                  rows={3}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                  placeholder="Chronological timeline of symptoms, social/family history..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Medication History
                </label>
                <textarea
                  rows={3}
                  value={medicationHistory}
                  onChange={(e) => setMedicationHistory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                  placeholder="Home medications, compliance, previous drug reactions..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Lab / Clinical Findings
                  </label>
                  <textarea
                    rows={4}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Lab values, ECG summaries, radiological assessments..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Treatment Plan Details
                  </label>
                  <textarea
                    rows={4}
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Prescribed pharmaceutical regimens, dosages, frequency..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Monitoring Parameters
                  </label>
                  <textarea
                    rows={3}
                    value={monitoring}
                    onChange={(e) => setMonitoring(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Adverse reactions to monitor, renal/hepatic audits..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Clinical Outcome
                  </label>
                  <textarea
                    rows={3}
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Discharge status, clinical recovery stats..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Clinical Discussion & Therapeutic Rationale
                </label>
                <textarea
                  rows={4}
                  value={discussion}
                  onChange={(e) => setDiscussion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                  placeholder="Explain why drugs were selected, guidelines referenced (e.g. ACC/AHA, JNC8)..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Learning Points & Clinical Pearls
                </label>
                <textarea
                  rows={3}
                  value={learningPoints}
                  onChange={(e) => setLearningPoints(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                  placeholder="Major takeaways for pharmacy students..."
                />
              </div>
            </div>

            {/* Existing Attachments list */}
            {existingAttachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Case Attachments
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {existingAttachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <span className="truncate text-slate-400 max-w-[200px]">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Multi-upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Upload Reports / Case PDFs (Multi-select)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group">
                <Upload className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1" />
                <span className="text-xs text-slate-500 group-hover:text-slate-300">
                  {newFiles && newFiles.length > 0
                    ? `${newFiles.length} file(s) selected`
                    : "Choose PDF files, lab reports, or attachment assets"}
                </span>
                <input type="file" className="hidden" multiple onChange={handleFilesChange} accept=".pdf,image/*" />
              </label>
            </div>

            {/* Status Select Box */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Posting Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                <option value="draft">Save Draft</option>
                <option value="published">Publish Instantly</option>
              </select>
            </div>

            {/* Form actions */}
            <div className="flex gap-3">
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
                  <span>{editId ? "Update Case" : "Save Case Report"}</span>
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

      {/* Case Studies Inventory Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h2 className="text-md font-bold text-white mb-6">Clinical Case Files Repository</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No cases recorded yet</p>
            <p className="text-xs text-slate-650 mt-1">
              Start by creating a patient case folder with SOAP charting details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Case Info", "Department", "Patient Profile", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors group">
                    <td className="py-3.5 px-4 first:pl-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-50 leading-none">
                            {c.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">
                            Disease: {c.disease}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-450">{c.department}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {c.gender}, {c.age} Years Old
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        c.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-450 text-slate-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCase(c.id, c.attachments)}
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
    </div>
  );
}
