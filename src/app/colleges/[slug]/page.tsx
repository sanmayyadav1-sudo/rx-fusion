import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import CollegeDetailClient from "./CollegeDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: college } = await supabase
    .from("colleges")
    .select("name, short_description")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!college) {
    return {
      title: "College Not Found | RxFusion",
    };
  }

  return {
    title: `${college.name} - Admission, Courses, Fees | RxFusion`,
    description: college.short_description || `Explore admission status, pharmacy courses, fee structure, hostel, and clinical training information for ${college.name} on RxFusion.`,
  };
}

export default function Page() {
  return <CollegeDetailClient />;
}
