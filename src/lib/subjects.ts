import { Subject } from "@/types/supabase";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (typeof window !== "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createServerClient: createSSR } = require("@supabase/ssr");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies } = require("next/" + "headers");
    const cookieStore = cookies();
    return createSSR(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored
          }
        },
      },
    });
  }
}

// Fetch all subjects for a given course + year
export async function getSubjectsByCourseAndYear(courseId: string, yearNumber: number): Promise<Subject[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course", courseId)
    .eq("year_number", yearNumber)
    .order("subject_name", { ascending: true });

  if (error) throw error;
  return (data || []) as Subject[];
}

// Fetch all unique subjects for a course (all years)
export async function getAllSubjectsByCourse(courseId: string): Promise<Subject[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course", courseId)
    .order("year_number", { ascending: true })
    .order("subject_name", { ascending: true });

  if (error) throw error;
  return (data || []) as Subject[];
}

// Admin: create a new subject
export async function createSubject(courseId: string, yearNumber: number, subjectName: string): Promise<Subject> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .insert([
      {
        course: courseId as "Pharm D" | "B Pharm" | "D Pharm",
        year_number: yearNumber,
        subject_name: subjectName,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

// Admin: delete a subject (check if any notes are linked first — if yes, throw error: "Cannot delete subject with linked notes")
export async function deleteSubject(subjectId: string): Promise<void> {
  const supabase = getSupabase();

  // Check if any notes are linked to this subject
  const { data: linkedNotes, error: checkError } = await supabase
    .from("notes")
    .select("id")
    .eq("subject_id", subjectId)
    .limit(1);

  if (checkError) throw checkError;

  if (linkedNotes && linkedNotes.length > 0) {
    throw new Error("Cannot delete subject with linked notes");
  }

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);

  if (error) throw error;
}
