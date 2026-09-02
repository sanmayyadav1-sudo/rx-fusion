import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json({ error: "Missing noteId parameter." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  // Use standard createClient since this runs in a Server API Route handler
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Fetch the correct file_url and title from the database using noteId
    const { data: note, error: fetchError } = await supabase
      .from("notes")
      .select("file_url, title")
      .eq("id", noteId)
      .single();

    if (fetchError || !note?.file_url) {
      console.error("Note fetch failed or file_url is empty:", fetchError);
      return NextResponse.json({ error: "Note not found or invalid." }, { status: 404 });
    }

    // 2. Write download metrics log to note_downloads table
    const { error: logError } = await supabase
      .from("note_downloads")
      .insert([{ note_identifier: noteId, note_title: note.title || "Untitled Note" }]);

    if (logError) {
      console.error("Database log insertion failed:", logError);
    }

    // 3. Redirect to the resolved secure URL
    return NextResponse.redirect(note.file_url);

  } catch (err) {
    console.error("Failed handling note download:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
