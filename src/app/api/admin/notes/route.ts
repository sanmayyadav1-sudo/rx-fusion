import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const { title, description, subject, semester, fileUrl } = body;

    if (!title?.trim() || !subject?.trim() || !semester || !fileUrl?.trim()) {
      return NextResponse.json({ error: "Title, subject, semester, and file URL are required." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        subject: subject.trim(),
        semester: parseInt(semester, 10),
        course: "Pharm D",
        file_url: fileUrl.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json({ error: "Failed to create note: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note });
  } catch (err: unknown) {
    console.error("Admin notes POST error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json({ error: "Missing note id parameter." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // 1. Fetch note to retrieve file_url before deleting record
    const { data: noteToDelete } = await supabase
      .from("notes")
      .select("file_url")
      .eq("id", noteId)
      .maybeSingle();

    if (noteToDelete?.file_url) {
      try {
        const bucketMarker = "/storage/v1/object/public/notes/";
        const signMarker = "/storage/v1/object/sign/notes/";
        let storagePath: string | null = null;

        if (noteToDelete.file_url.includes(bucketMarker)) {
          storagePath = decodeURIComponent(noteToDelete.file_url.substring(noteToDelete.file_url.indexOf(bucketMarker) + bucketMarker.length));
        } else if (noteToDelete.file_url.includes(signMarker)) {
          const pathWithQuery = noteToDelete.file_url.substring(noteToDelete.file_url.indexOf(signMarker) + signMarker.length);
          storagePath = decodeURIComponent(pathWithQuery.split("?")[0]);
        }

        if (storagePath) {
          // Remove the physical file from Supabase storage bucket
          await supabase.storage.from("notes").remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn("Storage file cleanup warning on note deletion:", storageErr);
      }
    }

    // 2. Delete database record
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error);
      return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Admin notes DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

