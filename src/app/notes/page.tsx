import { Metadata } from "next";
import NotesClient from "./NotesClient";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Pharmacy Notes | RxFusion",
  description: "Browse lecture notes organized by course stream — Pharm D, B Pharm, and D Pharm — and filter by year and subject.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [pharmDRes, bPharmRes, dPharmRes] = await Promise.all([
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("course", "Pharm D"),
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("course", "B Pharm"),
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("course", "D Pharm"),
  ]);

  const pharmDCount = pharmDRes.count ?? 0;
  const bPharmCount = bPharmRes.count ?? 0;
  const dPharmCount = dPharmRes.count ?? 0;

  return (
    <NotesClient
      pharmDCount={pharmDCount}
      bPharmCount={bPharmCount}
      dPharmCount={dPharmCount}
    />
  );
}
