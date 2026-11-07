import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: name?.trim() || "Pharm.D Scholar",
        email: email?.trim() || "support@rxfusion.org",
        message: message.trim(),
      });

    if (error) {
      console.error("Error inserting contact message:", error);
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Message received! Our clinical team will respond shortly." });
  } catch (err: unknown) {
    console.error("Contact API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

