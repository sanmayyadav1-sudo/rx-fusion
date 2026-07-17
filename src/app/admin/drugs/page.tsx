"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pill, Plus, Trash2, Edit, Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface Drug {
  id: string;
  slug: string;
  drug_name: string;
  generic_name: string;
  drug_class: string;
  image_url: string;
  moa: string;
  uses: string;
  side_effects: string;
  contraindications: string;
  interactions: string;
  clinical_pearl: string;
  viva_questions: string;
  exam_point: string;
  status: "draft" | "published" | "scheduled";
  author: string;
  created_at: string;
}

export default function DrugsAdmin() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [drugName, setDrugName] = useState("");
  const [slug, setSlug] = useState("");
  const [genericName, setGenericName] = useState("");
  const [drugClass, setDrugClass] = useState("");
  const [moa, setMoa] = useState("");
  const [uses, setUses] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [contraindications, setContraindications] = useState("");
  const [interactions, setInteractions] = useState("");
  const [clinicalPearl, setClinicalPearl] = useState("");
  const [vivaQuestions, setVivaQuestions] = useState("");
  const [examPoint, setExamPoint] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [author, setAuthor] = useState("RxFusion Admin");
  const [publishDate, setPublishDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("drug_of_the_day")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setDrugs(data as Drug[]);
    } catch (err) {
      console.error("Error loading drugs:", err);
      setError("Failed to fetch drugs repository.");
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

  const handleNameChange = (val: string) => {
    setDrugName(val);
    if (!editId) setSlug(generateSlug(val));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setDrugName("");
    setSlug("");
    setGenericName("");
    setDrugClass("");
    setMoa("");
    setUses("");
    setSideEffects("");
    setContraindications("");
    setInteractions("");
    setClinicalPearl("");
    setVivaQuestions("");
    setExamPoint("");
    setStatus("draft");
    setAuthor("RxFusion Admin");
    setPublishDate("");
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (drug: Drug) => {
    setEditId(drug.id);
    setDrugName(drug.drug_name);
    setSlug(drug.slug);
    setGenericName(drug.generic_name);
    setDrugClass(drug.drug_class);
    setMoa(drug.moa || "");
    setUses(drug.uses || "");
    setSideEffects(drug.side_effects || "");
    setContraindications(drug.contraindications || "");
    setInteractions(drug.interactions || "");
    setClinicalPearl(drug.clinical_pearl || "");
    setVivaQuestions(drug.viva_questions || "");
    setExamPoint(drug.exam_point || "");
    setStatus(drug.status);
    setAuthor(drug.author);
    
    // Set formatted datetime-local
    if (drug.created_at) {
      const date = new Date(drug.created_at);
      const tzOffset = date.getTimezoneOffset() * 60000; // in ms
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setPublishDate(localISOTime);
    } else {
      setPublishDate("");
    }
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!drugName.trim() || !genericName.trim() || !drugClass.trim() || !slug.trim()) {
      setError("Please complete all required fields (Name, Generic Name, Class, Slug).");
      return;
    }

    setSaving(true);
    let imageUrl = "";

    try {
      // 1. Upload Featured Image to Storage if file selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `drugs/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(storagePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(storagePath);

        imageUrl = publicUrl;
      }

      // 2. Prepare payload
      const payload: Record<string, string | null | undefined> = {
        drug_name: drugName,
        slug,
        generic_name: genericName,
        drug_class: drugClass,
        moa,
        uses,
        side_effects: sideEffects,
        contraindications,
        interactions,
        clinical_pearl: clinicalPearl,
        viva_questions: vivaQuestions,
        exam_point: examPoint,
        status,
        author,
        updated_at: new Date().toISOString()
      };

      if (imageUrl) {
        payload.image_url = imageUrl;
      }

      if (publishDate) {
        payload.created_at = new Date(publishDate).toISOString();
      }

      // 3. Insert or Update
      if (editId) {
        const { error: dbError } = await supabase
          .from("drug_of_the_day")
          .update(payload)
          .eq("id", editId);

        if (dbError) throw dbError;
        setSuccess("Drug profile updated successfully!");
      } else {
        const { error: dbError } = await supabase
          .from("drug_of_the_day")
          .insert([payload]);

        if (dbError) throw dbError;
        setSuccess("New drug profile published/saved successfully!");
      }

      resetForm();
      fetchDrugs();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save drug profile.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDrug = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this drug profile?")) return;

    try {
      // Clean up storage image if it exists
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/images\/(.+)$/);
          if (pathMatch?.[1]) {
            const { error: storageError } = await supabase.storage
              .from("images")
              .remove([decodeURIComponent(pathMatch[1])]);
            if (storageError) console.warn("Image delete warning:", storageError.message);
          }
        } catch (e) {
          console.warn("Could not parse image URL for deletion:", imageUrl, e);
        }
      }

      const { error: dbError } = await supabase
        .from("drug_of_the_day")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setDrugs(drugs.filter((d) => d.id !== id));
      setSuccess("Drug profile deleted successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete drug profile.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Drug of the Day Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and publish pharmacology summaries, mechanisms, and viva questions.
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
          <span>{showForm ? "Hide Form" : "Create Drug Profile"}</span>
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

      {/* Editor Form */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 max-w-4xl animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            {editId ? "Edit Pharmacology Profile" : "Create New Pharmacology Profile"}
          </h2>

          <form onSubmit={handleSaveDrug} className="space-y-5">
            {/* Row 1: Drug Name & Generic Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Drug Name *
                </label>
                <input
                  type="text"
                  required
                  value={drugName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Lisinopril"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Generic Name *
                </label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. Lisinopril dihydrate"
                />
              </div>
            </div>

            {/* Row 2: Slug & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  placeholder="lisinopril"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Drug Class *
                </label>
                <input
                  type="text"
                  required
                  value={drugClass}
                  onChange={(e) => setDrugClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. ACE Inhibitor"
                />
              </div>
            </div>

            {/* Row 3: Author & Publish/Schedule Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Publish / Schedule Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
              </div>
            </div>

            {/* Image File upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Drug Image Cover
              </label>
              <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 group">
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-sm text-slate-500 group-hover:text-slate-300">
                  {imageFile ? imageFile.name : "Click to select drug molecular/capsule image"}
                </span>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            <div className="h-px bg-slate-800 my-5" />

            {/* Rich-Text Textareas */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mechanism of Action (MOA)
                </label>
                <textarea
                  rows={4}
                  value={moa}
                  onChange={(e) => setMoa(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                  placeholder="Describe molecular drug targets, receptor actions, cascades..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Therapeutic Uses
                </label>
                <textarea
                  rows={3}
                  value={uses}
                  onChange={(e) => setUses(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                  placeholder="Primary clinical indications, off-label uses..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Side Effects
                </label>
                <textarea
                  rows={3}
                  value={sideEffects}
                  onChange={(e) => setSideEffects(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                  placeholder="Common adverse reactions, toxicities..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Contraindications
                  </label>
                  <textarea
                    rows={3}
                    value={contraindications}
                    onChange={(e) => setContraindications(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                    placeholder="Absolute and relative contraindications..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Drug Interactions
                  </label>
                  <textarea
                    rows={3}
                    value={interactions}
                    onChange={(e) => setInteractions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                    placeholder="Key CYP450 interactions, synergisms..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Clinical Pearl
                </label>
                <textarea
                  rows={3}
                  value={clinicalPearl}
                  onChange={(e) => setClinicalPearl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                  placeholder="Practical prescribing/monitoring tips for practicing pharmacists..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Viva Questions
                  </label>
                  <textarea
                    rows={4}
                    value={vivaQuestions}
                    onChange={(e) => setVivaQuestions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                    placeholder="Questions commonly asked by examiners..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Exam Point
                  </label>
                  <textarea
                    rows={4}
                    value={examPoint}
                    onChange={(e) => setExamPoint(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none"
                    placeholder="Must-know summary keywords for theory papers..."
                  />
                </div>
              </div>
            </div>

            {/* Status Select Box */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Posting Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "scheduled")}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                <option value="draft">Save Draft</option>
                <option value="published">Publish Instantly</option>
                <option value="scheduled">Schedule Post</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3">
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
                  <span>{editId ? "Update Profile" : "Save Profile"}</span>
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

      {/* Drugs Inventory Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h2 className="text-md font-bold text-white mb-6">Drugs Archive Repository</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : drugs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No drugs listed yet</p>
            <p className="text-xs text-slate-650 mt-1">
              Add a new drug profile above to begin populating the daily library.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Drug Info", "Class", "Status", "Publish Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drugs.map((d) => (
                  <tr key={d.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors group">
                    <td className="py-3.5 px-4 first:pl-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-50 leading-none">
                            {d.drug_name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">
                            Generic: {d.generic_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-450">{d.drug_class}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        d.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : d.status === "scheduled"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-450 text-slate-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDrug(d.id, d.image_url)}
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
