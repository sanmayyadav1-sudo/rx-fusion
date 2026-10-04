import { NextRequest, NextResponse } from "next/server";
import { ArticleOrderService } from "@/lib/articleOrderService";
import { ArticleOrderFormData, ArticleServiceType, CitationStyle } from "@/types/articleOrder";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      service_type,
      name,
      email,
      mobile,
      topic,
      course,
      institution,
      word_count,
      references_count,
      citation_style,
      deadline,
      target_journal,
      additional_requirements,
      brief
    } = body;

    // Strict validation
    if (!service_type || !["Review Article", "Research Article / Research Paper"].includes(service_type)) {
      return NextResponse.json({ error: "Please select a valid service type." }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!mobile || mobile.trim().length < 7) {
      return NextResponse.json({ error: "Valid mobile or WhatsApp number is required." }, { status: 400 });
    }
    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Article/Research topic is required." }, { status: 400 });
    }
    if (!course || !course.trim()) {
      return NextResponse.json({ error: "Academic or professional course is required." }, { status: 400 });
    }
    if (!institution || !institution.trim()) {
      return NextResponse.json({ error: "College or institution name is required." }, { status: 400 });
    }
    if (!word_count || isNaN(Number(word_count)) || Number(word_count) <= 0) {
      return NextResponse.json({ error: "Valid required word count is required." }, { status: 400 });
    }
    if (!references_count || isNaN(Number(references_count)) || Number(references_count) < 0) {
      return NextResponse.json({ error: "Valid number of required references is required." }, { status: 400 });
    }
    if (!citation_style || !["Vancouver", "APA", "Other"].includes(citation_style)) {
      return NextResponse.json({ error: "Valid citation style (Vancouver, APA, or Other) is required." }, { status: 400 });
    }
    if (!deadline || !deadline.trim()) {
      return NextResponse.json({ error: "Target deadline is required." }, { status: 400 });
    }

    const formData: ArticleOrderFormData = {
      service_type: service_type as ArticleServiceType,
      name,
      email,
      mobile,
      topic,
      course,
      institution,
      word_count: Number(word_count),
      references_count: Number(references_count),
      citation_style: citation_style as CitationStyle,
      deadline,
      target_journal,
      additional_requirements,
      brief
    };

    const savedOrder = await ArticleOrderService.createOrder(formData);
    const emailDetails = ArticleOrderService.formatEmailDetails(savedOrder);

    return NextResponse.json({
      success: true,
      order: savedOrder,
      emailDetails
    });
  } catch (err: unknown) {
    console.error("Error creating article order:", err);
    const msg = err instanceof Error ? err.message : "Failed to submit article order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
