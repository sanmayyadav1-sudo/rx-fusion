import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

function getStoragePath(fileUrl: string): string | null {
  try {
    const bucketMarker = "/storage/v1/object/public/notes/";
    const privateMarker = "/storage/v1/object/private/notes/";
    const signMarker = "/storage/v1/object/sign/notes/";
    
    let index = fileUrl.indexOf(bucketMarker);
    if (index !== -1) {
      return decodeURIComponent(fileUrl.substring(index + bucketMarker.length));
    }
    
    index = fileUrl.indexOf(privateMarker);
    if (index !== -1) {
      return decodeURIComponent(fileUrl.substring(index + privateMarker.length));
    }

    index = fileUrl.indexOf(signMarker);
    if (index !== -1) {
      const pathAndQuery = fileUrl.substring(index + signMarker.length);
      const pathPart = pathAndQuery.split("?")[0];
      return decodeURIComponent(pathPart);
    }

    // Fallback: search for notes folder separator
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    const notesSegment = "/notes/";
    const notesIndex = pathname.indexOf(notesSegment);
    if (notesIndex !== -1) {
      return decodeURIComponent(pathname.substring(notesIndex + notesSegment.length));
    }
  } catch (err) {
    console.error("Failed to parse file_url storage path:", err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "Missing noteId parameter." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // Fetch note details
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("file_url")
      .eq("id", noteId)
      .single();

    if (noteError || !note?.file_url) {
      console.error(`[ProxyPDF] Note not found: ${noteId}`, noteError);
      return NextResponse.json({ error: "Note file not found." }, { status: 404 });
    }

    // Extract path and fetch from storage
    const filePath = getStoragePath(note.file_url);
    if (!filePath) {
      const res = await fetch(note.file_url);
      if (!res.ok) {
        throw new Error("Failed to fetch public file URL directly");
      }
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
        }
      });
    }

    const { data, error } = await supabase.storage.from("notes").download(filePath);
    if (error || !data) {
      console.error(`[ProxyPDF] Error downloading file from storage path: ${filePath}`, error);
      return NextResponse.json({ error: "Failed to download note file." }, { status: 404 });
    }

    const buffer = await data.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600"
      }
    });

  } catch (err: unknown) {
    console.error("Exception in note view proxy:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
