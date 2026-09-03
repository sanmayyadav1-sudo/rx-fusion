import { NextRequest, NextResponse } from "next/server";
import { authorizeNoteDownload } from "@/lib/downloadService";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteId, noteTitle } = body;

    if (!noteId) {
      return NextResponse.json({ error: "Missing noteId parameter." }, { status: 400 });
    }

    const result = await authorizeNoteDownload(request, noteId, noteTitle);

    if (result.errorResponse) {
      return result.errorResponse;
    }

    if (!result.authorized) {
      return NextResponse.json({
        authorized: false,
        limitReached: true,
        freeDownloadsUsed: result.freeDownloadsUsed,
        downloadLimit: result.downloadLimit
      }, { status: 403 });
    }

    return NextResponse.json({
      authorized: true,
      fileUrl: result.fileUrl,
      freeDownloadsUsed: result.freeDownloadsUsed,
      downloadLimit: result.downloadLimit
    });

  } catch (err: unknown) {
    console.error("Exception in note download authorization:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
