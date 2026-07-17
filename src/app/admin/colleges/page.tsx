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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-slate-55 pb-24">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Manage Pharmacy Colleges
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Create, update, and manage directory records and admissions.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add College
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Add / Edit Form Block */}
      {showForm && (
        <form onSubmit={handleSaveCollege} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            {editId ? "Edit Pharmacy College" : "Create New Pharmacy College"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Manipal College of Pharmaceutical Sciences"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug (URL Route) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="manipal-college-of-pharmaceutical-sciences"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A brief 1-2 sentence tagline for directory search listings."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Overview</label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Detailed institution history, campus environment, vision, and summary..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Manipal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College Type</label>
                  <select
                    value={collegeType}
                    onChange={(e) => setCollegeType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Deemed University">Deemed University</option>
                    <option value="University Department">University Department</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Postal Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete location coordinates, PIN Code..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Official Website</label>
                  <input
                    type="url"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://manipal.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission Portal Website</label>
                  <input
                    type="url"
                    value={admissionWebsite}
                    onChange={(e) => setAdmissionWebsite(e.target.value)}
                    placeholder="https://manipal.edu/admissions.html"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91-824-2224445"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission Email Address</label>
                  <input
                    type="email"
                    value={admissionEmail}
                    onChange={(e) => setAdmissionEmail(e.target.value)}
                    placeholder="admissions@manipal.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Logo upload & Status settings */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">College Logo</label>
                <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
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
                      <GraduationCap className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg text-xs font-semibold cursor-pointer text-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">PNG, JPG, WEBP (Max 2MB)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission Status</label>
                <select
                  value={admissionStatus}
                  onChange={(e) => setAdmissionStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="not_updated">Not Updated</option>
                  <option value="admission_open">Admission Open</option>
                  <option value="admission_closed">Admission Closed</option>
                  <option value="update_soon">Admission Update Soon</option>
                  <option value="contact_college">Contact College</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Session Year</label>
                <input
                  type="text"
                  value={admissionSession}
                  onChange={(e) => setAdmissionSession(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PCI Status</label>
                <select
                  value={pciStatus}
                  onChange={(e) => setPciStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="not_verified">Verification Pending / Not Updated</option>
                  <option value="verified_by_admin">Verified by Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PCI Reference URL</label>
                <input
                  type="url"
                  value={pciReferenceUrl}
                  onChange={(e) => setPciReferenceUrl(e.target.value)}
                  placeholder="https://www.pci.nic.in/pdf/Decisions.pdf"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1.5 space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    Published
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible/Tabbed extra detail blocks */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Admissions, Fees, Placements & Hostel Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eligibility Details</label>
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="Eligibility details for courses (e.g. 10+2 with PCB/PCM, minimum 50% marks)..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission Process</label>
                <textarea
                  value={admissionProcess}
                  onChange={(e) => setAdmissionProcess(e.target.value)}
                  placeholder="Step-by-step registration instructions, seat allotment guidelines..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entrance Exams Accepted</label>
                <textarea
                  value={entranceExam}
                  onChange={(e) => setEntranceExam(e.target.value)}
                  placeholder="MET, KCET, GPAT, NEET, or institutional tests..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fees Information</label>
                <textarea
                  value={feesInformation}
                  onChange={(e) => setFeesInformation(e.target.value)}
                  placeholder="Tuition fees schedule, security deposits, refund guidelines..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostel & Accommodation</label>
                <textarea
                  value={hostelInformation}
                  onChange={(e) => setHostelInformation(e.target.value)}
                  placeholder="Hostel fee structure, amenities, mess charges..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hospital / Clinical Training Details</label>
                <textarea
                  value={clinicalTrainingInformation}
                  onChange={(e) => setClinicalTrainingInformation(e.target.value)}
                  placeholder="Hospital tie-up name (e.g. Kasturba Hospital), medical rotations..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Placement Information</label>
                <textarea
                  value={placementInformation}
                  onChange={(e) => setPlacementInformation(e.target.value)}
                  placeholder="Top recruiters, placement rates, highest and average package..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Courses sub-table section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Courses Offered</h4>
              <button
                type="button"
                onClick={addCourseRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-205 border border-slate-250 rounded-lg text-xs font-bold text-slate-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                No courses added yet. Click &quot;+ Add Course&quot; to configure streams.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <th className="p-3">Course Name</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Intake</th>
                      <th className="p-3">Approx Fee</th>
                      <th className="p-3">Eligibility Details</th>
                      <th className="p-3 text-center">Active</th>
                      <th className="p-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course, index) => (
                      <tr key={index} className="hover:bg-slate-50/20">
                        <td className="p-2">
                          <select
                            value={course.course_name}
                            onChange={(e) => updateCourseField(index, "course_name", e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded bg-white font-semibold text-slate-700 focus:outline-none"
                          >
                            <option value="Pharm.D">Pharm.D</option>
                            <option value="Pharm.D Post Baccalaureate">Pharm.D Post Baccalaureate</option>
                            <option value="B.Pharm">B.Pharm</option>
                            <option value="D.Pharm">D.Pharm</option>
                            <option value="M.Pharm">M.Pharm</option>
                            <option value="Other Pharmacy Course">Other Pharmacy Course</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.course_duration}
                            onChange={(e) => updateCourseField(index, "course_duration", e.target.value)}
                            placeholder="4 Years"
                            className="w-20 px-2 py-1 border border-slate-200 rounded bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.intake}
                            onChange={(e) => updateCourseField(index, "intake", e.target.value)}
                            placeholder="60 Seats"
                            className="w-20 px-2 py-1 border border-slate-200 rounded bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.course_fee}
                            onChange={(e) => updateCourseField(index, "course_fee", e.target.value)}
                            placeholder="₹ 1,50,000 / Yr"
                            className="w-32 px-2 py-1 border border-slate-200 rounded bg-white font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={course.eligibility}
                            onChange={(e) => updateCourseField(index, "eligibility", e.target.value)}
                            placeholder="10+2 with PCB/PCM"
                            className="w-full min-w-[150px] px-2 py-1 border border-slate-200 rounded bg-white"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={course.is_active}
                            onChange={(e) => updateCourseField(index, "is_active", e.target.checked)}
                            className="rounded text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCourseRow(index)}
                            className="p-1 hover:text-red-500 text-slate-400 transition-colors"
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
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-250 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save College Profile"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Colleges List Panel */}
      {!showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* List Search & Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredColleges.length} of {colleges.length} records.
            </span>
          </div>

          {/* Colleges List Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-slate-500 mt-2">Loading directory records...</p>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No colleges match your active search terms.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
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
                <tbody className="divide-y divide-slate-100 text-xs">
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
                      <tr key={college.id} className="hover:bg-slate-50/20">
                        <td className="p-3">
                          <div className="w-9 h-9 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                            {college.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={college.logo_url}
                                alt={college.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {college.name}
                        </td>
                        <td className="p-3 text-slate-550 font-semibold flex items-center gap-1 h-full mt-2.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {college.city}, {college.state}
                        </td>
                        <td className="p-3 max-w-[150px] truncate" title={uniqueCourses.join(" • ")}>
                          {uniqueCourses.length > 0 ? (
                            <span className="font-semibold text-slate-600">{uniqueCourses.join(", ")}</span>
                          ) : (
                            <span className="text-slate-400 italic">None configured</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            college.admission_status.toLowerCase().includes("open") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            college.admission_status.toLowerCase().includes("closed") ? "bg-red-50 text-red-600 border border-red-100" :
                            college.admission_status.toLowerCase().includes("soon") ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            college.admission_status.toLowerCase().includes("contact") ? "bg-sky-50 text-sky-600 border border-sky-100" :
                            "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {getStatusName(college.admission_status)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {college.is_featured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {college.is_published ? (
                            <Eye className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(college)}
                              className="p-1 hover:text-primary text-slate-400 transition-colors"
                              title="Edit College Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(college.id)}
                              className="p-1 hover:text-red-500 text-slate-400 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete College?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently remove the college profile, uploaded logo image, and all configured course details from the directory database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollege}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
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
