import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({ results: {} });
  }

  try {
    const supabase = getServiceSupabaseClient();
    const ilikeQuery = `%${query}%`;

    // Perform concurrent case-insensitive ilike search queries across all 12 platform entities
    const [
      notesRes,
      drugsRes,
      casesRes,
      blogsRes,
      newsRes,
      resourcesRes,
      collegesRes,
      vivaRes,
      labsRes,
      flashcardsRes,
      qbankRes,
      qpapersRes
    ] = await Promise.all([
      supabase
        .from("notes")
        .select("id, title, course, semester, subject")
        .or(`title.ilike.${ilikeQuery},subject.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("drug_of_the_day")
        .select("id, drug_name, generic_name, drug_class, slug")
        .eq("status", "published")
        .or(`drug_name.ilike.${ilikeQuery},generic_name.ilike.${ilikeQuery},drug_class.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("clinical_cases")
        .select("id, title, department, disease, slug")
        .eq("status", "published")
        .or(`title.ilike.${ilikeQuery},department.ilike.${ilikeQuery},disease.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("blogs")
        .select("id, title, slug")
        .ilike("title", ilikeQuery)
        .limit(5),
      supabase
        .from("news")
        .select("id, title")
        .ilike("title", ilikeQuery)
        .limit(5),
      supabase
        .from("resources")
        .select("id, title, description")
        .or(`title.ilike.${ilikeQuery},description.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("colleges")
        .select("id, name, city, state, slug")
        .eq("is_published", true)
        .or(`name.ilike.${ilikeQuery},city.ilike.${ilikeQuery},state.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("viva_questions")
        .select("id, question, answer, subject, course, year")
        .or(`question.ilike.${ilikeQuery},subject.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("lab_manuals")
        .select("id, title, experiment_number, aim, subject, course, year")
        .or(`title.ilike.${ilikeQuery},subject.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("flashcards")
        .select("id, term, definition, subject, course, year")
        .eq("is_published", true)
        .or(`term.ilike.${ilikeQuery},definition.ilike.${ilikeQuery},subject.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("question_bank")
        .select("id, question, subject, course, year")
        .eq("is_published", true)
        .or(`question.ilike.${ilikeQuery},subject.ilike.${ilikeQuery}`)
        .limit(5),
      supabase
        .from("question_papers")
        .select("id, title, subject, university, course, year")
        .eq("is_published", true)
        .or(`title.ilike.${ilikeQuery},subject.ilike.${ilikeQuery},university.ilike.${ilikeQuery}`)
        .limit(5)
    ]);

    const results: Record<string, Array<Record<string, unknown>>> = {};

    if (notesRes.data && notesRes.data.length > 0) {
      results.notes = notesRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: `Subject: ${item.subject} | Course: ${item.course}`,
        category: `Sem/Yr ${item.semester}`,
        url: `/notes/${encodeURIComponent(item.course)}`
      }));
    }

    if (drugsRes.data && drugsRes.data.length > 0) {
      results.drugs = drugsRes.data.map((item) => ({
        id: item.id,
        title: item.drug_name,
        description: `Generic: ${item.generic_name}`,
        category: item.drug_class,
        url: `/drugs/${item.slug}`
      }));
    }

    if (casesRes.data && casesRes.data.length > 0) {
      results.cases = casesRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: `Department: ${item.department} | Disease: ${item.disease}`,
        category: item.department,
        url: `/cases/${item.slug}`
      }));
    }

    if (blogsRes.data && blogsRes.data.length > 0) {
      results.blogs = blogsRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: "Blog Article",
        category: "Blog",
        url: `/blogs/${item.slug}`
      }));
    }

    if (newsRes.data && newsRes.data.length > 0) {
      results.news = newsRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: "Latest Pharmacy News Update",
        category: "News",
        url: "/news"
      }));
    }

    if (resourcesRes.data && resourcesRes.data.length > 0) {
      results.resources = resourcesRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "Pharmacy Study Resource",
        category: "Resource",
        url: "/resources"
      }));
    }

    if (collegesRes.data && collegesRes.data.length > 0) {
      results.colleges = collegesRes.data.map((item) => ({
        id: item.id,
        title: item.name,
        description: `Location: ${item.city}, ${item.state}`,
        category: "College",
        url: `/colleges/${item.slug}`
      }));
    }

    if (vivaRes.data && vivaRes.data.length > 0) {
      results.viva = vivaRes.data.map((item) => ({
        id: item.id,
        title: item.question,
        description: `Subject: ${item.subject} | Course: ${item.course}`,
        category: "Viva Question",
        url: "/viva"
      }));
    }

    if (labsRes.data && labsRes.data.length > 0) {
      results.labs = labsRes.data.map((item) => ({
        id: item.id,
        title: `${item.experiment_number ? `${item.experiment_number}: ` : ""}${item.title}`,
        description: `Aim: ${item.aim}`,
        category: "Lab Manual",
        url: `/labs`
      }));
    }

    if (flashcardsRes.data && flashcardsRes.data.length > 0) {
      results.flashcards = flashcardsRes.data.map((item) => ({
        id: item.id,
        title: item.term,
        description: item.definition ? `Definition: ${item.definition}` : `Subject: ${item.subject}`,
        category: "Flashcard",
        url: "/flashcards"
      }));
    }

    if (qbankRes.data && qbankRes.data.length > 0) {
      results.question_bank = qbankRes.data.map((item) => ({
        id: item.id,
        title: item.question,
        description: `Subject: ${item.subject} | Course: ${item.course}`,
        category: "Question Bank",
        url: "/question-bank"
      }));
    }

    if (qpapersRes.data && qpapersRes.data.length > 0) {
      results.question_papers = qpapersRes.data.map((item) => ({
        id: item.id,
        title: item.title,
        description: `University: ${item.university} | Subject: ${item.subject}`,
        category: "Question Paper",
        url: "/question-papers"
      }));
    }

    return NextResponse.json({ results });
  } catch (err: unknown) {
    console.error("Exception in GET unified search:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
