import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient, StudentProfileRecord } from "./authHelpers";

export interface DownloadAuthorizationResult {
  errorResponse?: NextResponse;
  authorized?: boolean;
  limitReached?: boolean;
  fileUrl?: string;
  freeDownloadsUsed?: number;
  downloadLimit?: number;
}

/**
 * Shared central download authorization service for notes.
 * Performs authentication, quota validation, atomic usage increment, and download logging.
 */
export async function authorizeNoteDownload(
  request: NextRequest,
  noteId: string,
  providedNoteTitle?: string
): Promise<DownloadAuthorizationResult> {
  const auth = await requireStudent(request);
  if (auth.errorResponse) return { errorResponse: auth.errorResponse };
  const student = auth.student;

  const supabase = getServiceSupabaseClient();

  // 1. Fetch fresh student profile to check latest download counts
  const { data: freshProfile, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", student.id)
    .single();

  const profile: StudentProfileRecord = freshProfile || student;

  if (profileError || !profile) {
    return {
      errorResponse: NextResponse.json({ error: "Student profile not found." }, { status: 404 })
    };
  }

  // 2. Enforce download quota limit
  if (profile.free_downloads_used >= profile.download_limit) {
    return {
      authorized: false,
      limitReached: true,
      freeDownloadsUsed: profile.free_downloads_used,
      downloadLimit: profile.download_limit
    };
  }

  // 3. Atomically increment free_downloads_used
  const { data: updated, error: updateError } = await supabase
    .from("student_profiles")
    .update({ 
      free_downloads_used: profile.free_downloads_used + 1,
      last_seen: new Date().toISOString()
    })
    .eq("id", profile.id)
    .lt("free_downloads_used", profile.download_limit)
    .select();

  if (updateError || !updated || updated.length === 0) {
    // Limit reached concurrently
    return {
      authorized: false,
      limitReached: true,
      freeDownloadsUsed: profile.download_limit,
      downloadLimit: profile.download_limit
    };
  }

  const updatedStudent = updated[0];

  // 4. Fetch target note details
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("id, title, file_url")
    .eq("id", noteId)
    .single();

  if (noteError || !note?.file_url) {
    return {
      errorResponse: NextResponse.json({ error: "Note file not found." }, { status: 404 })
    };
  }

  const noteTitle = providedNoteTitle || note.title || "Untitled Note";

  // 5. Log the download in note_downloads with student_id (fixes NOT NULL constraint issue)
  await supabase
    .from("note_downloads")
    .insert({
      student_id: profile.id,
      note_identifier: noteId,
      note_title: noteTitle
    });

  // Generate secure signed URL (valid 300 seconds) if note file is stored in Supabase storage
  let authorizedUrl = note.file_url;
  try {
    const bucketMarker = "/storage/v1/object/public/notes/";
    if (note.file_url.includes(bucketMarker)) {
      const storagePath = decodeURIComponent(note.file_url.substring(note.file_url.indexOf(bucketMarker) + bucketMarker.length));
      const { data: signedData } = await supabase.storage.from("notes").createSignedUrl(storagePath, 300);
      if (signedData?.signedUrl) {
        authorizedUrl = signedData.signedUrl;
      }
    }
  } catch (signErr) {
    console.warn("Could not generate signed URL, using direct file_url", signErr);
  }

  return {
    authorized: true,
    limitReached: false,
    fileUrl: authorizedUrl,
    freeDownloadsUsed: updatedStudent.free_downloads_used,
    downloadLimit: updatedStudent.download_limit
  };
}
