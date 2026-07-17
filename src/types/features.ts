export interface DrugOfTheDay {
  id: string;
  slug: string;
  drug_name: string;
  generic_name: string;
  drug_class: string;
  image_url: string | null;
  moa: string | null;
  uses: string | null;
  side_effects: string | null;
  contraindications: string | null;
  interactions: string | null;
  clinical_pearl: string | null;
  viva_questions: string | null;
  exam_point: string | null;
  status: "draft" | "published" | "scheduled";
  author: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalCase {
  id: string;
  slug: string;
  title: string;
  department: string;
  disease: string;
  age: number;
  gender: string;
  chief_complaint: string | null;
  history: string | null;
  medication_history: string | null;
  findings: string | null;
  diagnosis: string | null;
  treatment: string | null;
  monitoring: string | null;
  outcome: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  discussion: string | null;
  learning_points: string | null;
  attachments: string[] | null;
  status: "draft" | "published";
  author: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'exam_update' | 'new_notes' | 'news_update' | 'important_notice' | 'event' | 'general';
  banner_url: string | null;
  button_text: string | null;
  button_url: string | null;
  pdf_url: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  auto_hide_duration: number | null;
  show_once_per_session: boolean;
  created_at: string;
  updated_at: string;
}
