import { NextRequest, NextResponse } from "next/server";
import { authorizeNoteDownload } from "@/lib/downloadService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json({ error: "Missing noteId parameter." }, { status: 400 });
  }

  try {
    const result = await authorizeNoteDownload(request, noteId);

    if (result.errorResponse) {
      return result.errorResponse;
    }

    if (!result.authorized || !result.fileUrl) {
      return NextResponse.json(
        {
          error: "Free download limit reached. Upgrade or view online.",
          limitReached: true,
          freeDownloadsUsed: result.freeDownloadsUsed,
          downloadLimit: result.downloadLimit
        },
        { status: 403 }
      );
    }

    return NextResponse.redirect(result.fileUrl);
  } catch (err: unknown) {
    console.error("Failed handling note download direct GET:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
