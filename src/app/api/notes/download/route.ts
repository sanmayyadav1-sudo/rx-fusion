import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, noteId, noteTitle } = body;

    if (!studentId || !noteId) {
      return NextResponse.json({ error: "Missing studentId or noteId parameters." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch the student's current profile details
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("free_downloads_used, download_limit")
      .eq("id", studentId)
      .single();

    if (profileError || !profile) {
      console.error("Error retrieving student profile:", profileError);
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // 2. Check if the download limit is already reached
    if (profile.free_downloads_used >= profile.download_limit) {
      return NextResponse.json({ 
        authorized: false, 
        limitReached: true, 
        freeDownloadsUsed: profile.free_downloads_used,
        downloadLimit: profile.download_limit
      });
    }

    // 3. Try to atomically increment the download count if it is still below the limit
    const { data: updated, error: updateError } = await supabase
      .from("student_profiles")
      .update({ 
        free_downloads_used: profile.free_downloads_used + 1,
        last_seen: new Date().toISOString()
      })
      .eq("id", studentId)
      .lt("free_downloads_used", profile.download_limit)
      .select();

    if (updateError || !updated || updated.length === 0) {
      // Limit was hit concurrently or update failed
      return NextResponse.json({ 
        authorized: false, 
        limitReached: true, 
        freeDownloadsUsed: profile.download_limit,
        downloadLimit: profile.download_limit
      });
    }

    const updatedProfile = updated[0];

    // 4. Log the download in the download history
    await supabase
      .from("note_downloads")
      .insert({
        student_id: studentId,
        note_identifier: noteId,
        note_title: noteTitle || "Untitled Note"
      });

    // 5. Fetch the secure file URL of the note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("file_url")
      .eq("id", noteId)
      .single();

    if (noteError || !note?.file_url) {
      console.error("Error fetching note file URL:", noteError);
      return NextResponse.json({ error: "Note file not found." }, { status: 404 });
    }

    return NextResponse.json({
      authorized: true,
      fileUrl: note.file_url,
      freeDownloadsUsed: updatedProfile.free_downloads_used,
      downloadLimit: updatedProfile.download_limit
    });

  } catch (err: unknown) {
    console.error("Exception in note download authorization:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
