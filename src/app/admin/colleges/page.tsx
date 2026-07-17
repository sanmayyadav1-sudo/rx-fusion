"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Plus, Trash2, Edit, Loader2, Upload, 
  AlertCircle, CheckCircle2, Search, MapPin, Eye, EyeOff, Star, Trash
} from "lucide-react";

interface CourseState {
  id?: string;
  course_name: string;
  course_duration: string;
  intake: string;
  course_fee: string;
  eligibility: string;
  is_active: boolean;
}

interface College {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  overview: string;
  city: string;
  state: string;
  college_type: string;
  logo_url: string;
  address: string;
  official_website: string;
  admission_website: string;
  contact_number: string;
  admission_email: string;
  admission_status: string;
  admission_session: string;
  eligibility: string;
  admission_process: string;
  entrance_exam: string;
  fees_information: string;
  hostel_information: string;
  clinical_training_information: string;
  placement_information: string;
  pci_status: string;
  pci_reference_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  updated_at: string;
  college_courses?: CourseState[];
}

export default function CollegesAdmin() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search filter for table
  const [searchTerm, setSearchTerm] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [collegeType, setCollegeType] = useState("Private");
  const [address, setAddress] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [admissionWebsite, setAdmissionWebsite] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [admissionEmail, setAdmissionEmail] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("not_updated");
  const [admissionSession, setAdmissionSession] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [admissionProcess, setAdmissionProcess] = useState("");
  const [entranceExam, setEntranceExam] = useState("");
  const [feesInformation, setFeesInformation] = useState("");
  const [hostelInformation, setHostelInformation] = useState("");
  const [clinicalTrainingInformation, setClinicalTrainingInformation] = useState("");
  const [placementInformation, setPlacementInformation] = useState("");
  const [pciStatus, setPciStatus] = useState("not_verified");
  const [pciReferenceUrl, setPciReferenceUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  // Courses Form State
  const [courses, setCourses] = useState<CourseState[]>([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("colleges")
        .select(`
          *,
          college_courses (*)
        `)
        .order("display_order", { ascending: true });

      if (dbError) throw dbError;
      if (data) setColleges(data as unknown as College[]);
    } catch (err) {
      console.error("Error loading colleges:", err);
      setError("Failed to fetch colleges list.");
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
    setName(val);
    if (!editId) setSlug(generateSlug(val));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only PNG, JPG, JPEG, and WEBP images are supported.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB limit.");
        return;
      }
      setLogoFile(file);
      setError(null);
    }
  };

  const addCourseRow = () => {
    setCourses([
      ...courses,
      {
        course_name: "B.Pharm",
        course_duration: "4 Years",
        intake: "60",
        course_fee: "",
        eligibility: "",
        is_active: true
      }
    ]);
  };

  const removeCourseRow = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourseField = (index: number, field: keyof CourseState, value: string | boolean) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value } as CourseState;
    setCourses(updated);
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setShortDescription("");
    setOverview("");
    setCity("");
    setState("");
    setCollegeType("Private");
    setAddress("");
    setOfficialWebsite("");
    setAdmissionWebsite("");
    setContactNumber("");
    setAdmissionEmail("");
    setAdmissionStatus("not_updated");
    setAdmissionSession("");
    setEligibility("");
    setAdmissionProcess("");
    setEntranceExam("");
    setFeesInformation("");
    setHostelInformation("");
    setClinicalTrainingInformation("");
    setPlacementInformation("");
    setPciStatus("not_verified");
    setPciReferenceUrl("");
    setIsFeatured(false);
    setIsPublished(true);
    setDisplayOrder(0);
    setLogoFile(null);
    setCurrentLogoUrl(null);
    setCourses([]);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (college: College) => {
    setEditId(college.id);
    setName(college.name);
    setSlug(college.slug);
    setShortDescription(college.short_description || "");
    setOverview(college.overview || "");
    setCity(college.city);
    setState(college.state);
    setCollegeType(college.college_type || "Private");
    setAddress(college.address || "");
    setOfficialWebsite(college.official_website || "");
    setAdmissionWebsite(college.admission_website || "");
    setContactNumber(college.contact_number || "");
    setAdmissionEmail(college.admission_email || "");
    setAdmissionStatus(college.admission_status);
    setAdmissionSession(college.admission_session || "");
    setEligibility(college.eligibility || "");
    setAdmissionProcess(college.admission_process || "");
    setEntranceExam(college.entrance_exam || "");
    setFeesInformation(college.fees_information || "");
    setHostelInformation(college.hostel_information || "");
    setClinicalTrainingInformation(college.clinical_training_information || "");
    setPlacementInformation(college.placement_information || "");
    setPciStatus(college.pci_status);
    setPciReferenceUrl(college.pci_reference_url || "");
    setIsFeatured(college.is_featured);
    setIsPublished(college.is_published);
    setDisplayOrder(college.display_order);
    setCurrentLogoUrl(college.logo_url);
    setLogoFile(null);
    
    // Set Courses
    if (college.college_courses) {
      setCourses(college.college_courses);
    } else {
      setCourses([]);
    }

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !slug.trim() || !city.trim() || !state.trim()) {
      setError("Please complete all required fields (Name, Slug, City, State).");
      return;
    }

    setSaving(true);
    let logoUrl = currentLogoUrl || "";

    try {
      // 1. Upload Logo if selected
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("college-logos")
          .upload(storagePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("college-logos")
          .getPublicUrl(storagePath);

        logoUrl = publicUrl;
      }

      // 2. Prepare payload
      const payload = {
        name,
        slug,
        short_description: shortDescription,
        overview,
        city,
        state,
        college_type: collegeType,
        logo_url: logoUrl || null,
        address,
        official_website: officialWebsite,
        admission_website: admissionWebsite,
        contact_number: contactNumber,
        admission_email: admissionEmail,
        admission_status: admissionStatus,
        admission_session: admissionSession,
        eligibility,
        admission_process: admissionProcess,
        entrance_exam: entranceExam,
        fees_information: feesInformation,
        hostel_information: hostelInformation,
        clinical_training_information: clinicalTrainingInformation,
        placement_information: placementInformation,
        pci_status: pciStatus,
        pci_reference_url: pciReferenceUrl,
        is_featured: isFeatured,
        is_published: isPublished,
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      };

      let collegeId = editId;

      // 3. Upsert College
      if (editId) {
        const { error: dbError } = await supabase
          .from("colleges")
          .update(payload)
          .eq("id", editId);

        if (dbError) throw dbError;
      } else {
        const { data: insertData, error: dbError } = await supabase
          .from("colleges")
          .insert([payload])
          .select("id")
          .single();

        if (dbError) throw dbError;
        collegeId = insertData.id;
      }

      if (!collegeId) throw new Error("Could not retrieve college ID.");

      // 4. Save Courses (delete existing and insert new for clean synchronization)
      const { error: deleteCoursesError } = await supabase
        .from("college_courses")
        .delete()
        .eq("college_id", collegeId);

      if (deleteCoursesError) throw deleteCoursesError;

      if (courses.length > 0) {
        const coursesToInsert = courses.map((c) => ({
          college_id: collegeId,
          course_name: c.course_name,
          course_duration: c.course_duration,
          intake: c.intake,
          course_fee: c.course_fee,
          eligibility: c.eligibility,
          is_active: c.is_active
        }));

        const { error: insertCoursesError } = await supabase
          .from("college_courses")
          .insert(coursesToInsert);

        if (insertCoursesError) throw insertCoursesError;
      }

      setSuccess(editId ? "College profile updated successfully!" : "New college profile published successfully!");
      resetForm();
      fetchColleges();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save college profile.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollege = async () => {
    if (!deleteConfirmId) return;

    try {
      const collegeToDelete = colleges.find((c) => c.id === deleteConfirmId);
      if (collegeToDelete?.logo_url) {
        try {
          const url = new URL(collegeToDelete.logo_url);
          const pathMatch = url.pathname.match(/\/college-logos\/(.+)$/);
          if (pathMatch?.[1]) {
            await supabase.storage
              .from("college-logos")
              .remove([pathMatch[1]]);
          }
        } catch (e) {
          console.error("Storage clean up failed:", e);
        }
      }

      const { error: dbError } = await supabase
        .from("colleges")
        .delete()
        .eq("id", deleteConfirmId);

      if (dbError) throw dbError;

      setSuccess("College profile and courses deleted successfully.");
      setDeleteConfirmId(null);
      fetchColleges();
    } catch (err) {
      console.error("Error deleting college:", err);
      setError("Failed to delete college profile.");
    }
  };

  // Filter local colleges list by search
  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
            Manage Pharmacy Colleges
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, update, and manage directory records and admissions.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add College</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add / Edit Form Block */}
      {showForm && (
        <form onSubmit={handleSaveCollege} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20 space-y-6">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest border-b border-slate-800/60 pb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>{editId ? "Edit Pharmacy College Profile" : "Create New Pharmacy College Profile"}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">College Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Manipal College of Pharmaceutical Sciences"
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Slug (URL Route) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="manipal-college-of-pharmaceutical-sciences"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-mono text-cyan-400 bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A brief 1-2 sentence tagline for directory search listings."
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Detailed Overview</label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Detailed institution history, campus environment, vision, and summary..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Manipal"
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">College Type</label>
                  <select
                    value={collegeType}
                    onChange={(e) => setCollegeType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    <option value="Government" className="bg-slate-900">Government</option>
                    <option value="Private" className="bg-slate-900">Private</option>
                    <option value="Deemed University" className="bg-slate-900">Deemed University</option>
                    <option value="University Department" className="bg-slate-900">University Department</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Full Postal Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete location coordinates, PIN Code..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Official Website</label>
                  <input
                    type="url"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://manipal.edu"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-mono text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Admission Portal Website</label>
                  <input
                    type="url"
                    value={admissionWebsite}
                    onChange={(e) => setAdmissionWebsite(e.target.value)}
                    placeholder="https://manipal.edu/admissions.html"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-mono text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91-824-2224445"
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Admission Email Address</label>
                  <input
                    type="email"
                    value={admissionEmail}
                    onChange={(e) => setAdmissionEmail(e.target.value)}
                    placeholder="admissions@manipal.edu"
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Logo upload & Status settings */}
            <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">College Logo</label>
                <div className="flex flex-col items-center gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                  <div className="w-20 h-20 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden">
                    {logoFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(logoFile)}
                        alt="Logo Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : currentLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentLogoUrl}
                        alt="Current Logo"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-slate-300 hover:text-white transition-all duration-200 active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">PNG, JPG, WEBP (Max 2MB)</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Admission Status</label>
                <select
                  value={admissionStatus}
                  onChange={(e) => setAdmissionStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                >
                  <option value="not_updated" className="bg-slate-900">Not Updated</option>
                  <option value="admission_open" className="bg-slate-900">Admission Open</option>
                  <option value="admission_closed" className="bg-slate-900">Admission Closed</option>
                  <option value="update_soon" className="bg-slate-900">Admission Update Soon</option>
                  <option value="contact_college" className="bg-slate-900">Contact College</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Academic Session Year</label>
                <input
                  type="text"
                  value={admissionSession}
                  onChange={(e) => setAdmissionSession(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">PCI Status</label>
                <select
                  value={pciStatus}
                  onChange={(e) => setPciStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                >
                  <option value="not_verified" className="bg-slate-900">Verification Pending / Not Updated</option>
                  <option value="verified_by_admin" className="bg-slate-900">Verified by Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">PCI Reference URL</label>
                <input
                  type="url"
                  value={pciReferenceUrl}
                  onChange={(e) => setPciReferenceUrl(e.target.value)}
                  placeholder="https://www.pci.nic.in/pdf/Decisions.pdf"
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-mono text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1.5 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    Published
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible/Tabbed extra detail blocks */}
          <div className="border-t border-slate-800/60 pt-6">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Admissions, Fees, Placements & Hostel Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Eligibility Details</label>
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="Eligibility details for courses (e.g. 10+2 with PCB/PCM, minimum 50% marks)..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Admission Process</label>
                <textarea
                  value={admissionProcess}
                  onChange={(e) => setAdmissionProcess(e.target.value)}
                  placeholder="Detailed steps for counseling, direct application, or merit list..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Entrance Exam Requirements</label>
                <input
                  type="text"
                  value={entranceExam}
                  onChange={(e) => setEntranceExam(e.target.value)}
                  placeholder="KCET / GPAT / NEET / Management Merit"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Fees & Scholarship Overview</label>
                <textarea
                  value={feesInformation}
                  onChange={(e) => setFeesInformation(e.target.value)}
                  placeholder="Fee structure summaries, installment policies, state scholarships..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Hostel & Accommodation</label>
                <textarea
                  value={hostelInformation}
                  onChange={(e) => setHostelInformation(e.target.value)}
                  placeholder="Hostel fees, food facilities, room sharing..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Clinical & Internship Training</label>
                <textarea
                  value={clinicalTrainingInformation}
                  onChange={(e) => setClinicalTrainingInformation(e.target.value)}
                  placeholder="Hospital tie-ups for Pharm D internships, lab facilities..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Courses Configuration Section */}
          <div className="border-t border-slate-800/60 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Configured Courses & Seat Intake</h4>
                <p className="text-[11px] text-slate-400">Add B.Pharm, Pharm.D, D.Pharm programs offered by this institution.</p>
              </div>
              <button
                type="button"
                onClick={addCourseRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-cyan-400 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course Program
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-slate-800/60 border-dashed rounded-xl text-center text-xs text-slate-400">
                No course programs configured yet for this college. Click &quot;Add Course Program&quot; above to add offerings.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="p-2.5">Course Name</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Seat Intake</th>
                      <th className="p-2.5">Annual Fee</th>
                      <th className="p-2.5 text-center">Active</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {courses.map((course, index) => (
                      <tr key={index} className="hover:bg-slate-800/20">
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.course_name}
                            onChange={(e) => updateCourseField(index, "course_name", e.target.value)}
                            placeholder="B.Pharm / Pharm.D"
                            className="w-full min-w-[120px] px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.course_duration}
                            onChange={(e) => updateCourseField(index, "course_duration", e.target.value)}
                            placeholder="4 Years"
                            className="w-full min-w-[100px] px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.intake}
                            onChange={(e) => updateCourseField(index, "intake", e.target.value)}
                            placeholder="60 Seats"
                            className="w-full min-w-[80px] px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.course_fee || ""}
                            onChange={(e) => updateCourseField(index, "course_fee", e.target.value)}
                            placeholder="₹ 1,20,000 / Year"
                            className="w-full min-w-[120px] px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={course.is_active}
                            onChange={(e) => updateCourseField(index, "is_active", e.target.checked)}
                            className="rounded accent-cyan-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCourseRow(index)}
                            className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/60">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <span>Save College Profile</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Colleges List Panel */}
      {!showForm && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-950/20">
          {/* List Search & Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search college, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredColleges.length} of {colleges.length} records.
            </span>
          </div>

          {/* Colleges List Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400 mt-2">Loading directory records...</p>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No colleges match your active search terms.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/40">
                    <th className="p-3">Logo</th>
                    <th className="p-3">College Name</th>
                    <th className="p-3">City & State</th>
                    <th className="p-3">Courses</th>
                    <th className="p-3">Admission</th>
                    <th className="p-3 text-center">Featured</th>
                    <th className="p-3 text-center">Published</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredColleges.map((college) => {
                    const uniqueCourses = Array.from(
                      new Set(college.college_courses?.map((c) => c.course_name) || [])
                    );

                    // Map admission status cleanly
                    const getStatusName = (status: string) => {
                      const s = status?.toLowerCase() || "";
                      if (s === "admission_open" || s === "admission open") return "Admission Open";
                      if (s === "admission_closed" || s === "admission closed") return "Admission Closed";
                      if (s === "update_soon" || s === "admission update soon") return "Update Soon";
                      if (s === "contact_college" || s === "contact college") return "Contact College";
                      return "Not Updated";
                    };

                    return (
                      <tr key={college.id} className="hover:bg-slate-800/20 transition-colors duration-150">
                        <td className="p-3">
                          <div className="w-9 h-9 rounded-xl border border-slate-700/80 bg-slate-800/60 flex items-center justify-center overflow-hidden">
                            {college.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={college.logo_url}
                                alt={college.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-100">
                          {college.name}
                        </td>
                        <td className="p-3 text-slate-300 font-medium">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span>{college.city}, {college.state}</span>
                          </div>
                        </td>
                        <td className="p-3 max-w-[150px] truncate" title={uniqueCourses.join(" • ")}>
                          {uniqueCourses.length > 0 ? (
                            <span className="font-semibold text-slate-300">{uniqueCourses.join(", ")}</span>
                          ) : (
                            <span className="text-slate-500 italic">None configured</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            college.admission_status.toLowerCase().includes("open") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            college.admission_status.toLowerCase().includes("closed") ? "bg-slate-800/60 text-slate-400 border border-slate-700/30" :
                            college.admission_status.toLowerCase().includes("soon") || college.admission_status.toLowerCase().includes("contact") ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-slate-800/60 text-slate-400 border border-slate-700/30"
                          }`}>
                            {getStatusName(college.admission_status)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {college.is_featured ? (
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto animate-pulse" />
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {college.is_published ? (
                            <Eye className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-rose-450 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(college)}
                              className="p-2 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800 hover:border-cyan-500/20 transition-all duration-150"
                              title="Edit College Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(college.id)}
                              className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                              title="Delete College"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Delete College?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently remove the college profile, uploaded logo image, and all configured course details from the directory database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollege}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200 active:scale-95"
              >
                Delete College
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
