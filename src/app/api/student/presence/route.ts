import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const supabase = getServiceSupabaseClient();
    const { error } = await supabase
      .from("student_profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", student.id);

    if (error) {
      console.error("Error updating student presence last_seen:", error);
      return NextResponse.json({ error: "Failed to update presence." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Exception in presence API route:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
