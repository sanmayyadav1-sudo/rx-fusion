export const OFFICIAL_SUPPORT_EMAIL = "rxfusion.support@gmail.com";

export type ArticleServiceType = "Review Article" | "Research Article / Research Paper";

export type CitationStyle = "Vancouver" | "APA" | "Other";

export type OrderStatus =
  | "New"
  | "Contacted"
  | "In Progress"
  | "Waiting for Information"
  | "Completed"
  | "Cancelled";

export interface ArticleOrder {
  id: string;
  order_number: string;
  service_type: ArticleServiceType;
  name: string;
  email: string;
  mobile: string;
  topic: string;
  course: string;
  institution: string;
  word_count: number;
  references_count: number;
  citation_style: CitationStyle;
  deadline: string;
  target_journal?: string | null;
  additional_requirements?: string | null;
  brief?: string | null;
  status: OrderStatus;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleOrderFormData {
  service_type: ArticleServiceType;
  name: string;
  email: string;
  mobile: string;
  topic: string;
  course: string;
  institution: string;
  word_count: number | string;
  references_count: number | string;
  citation_style: CitationStyle;
  deadline: string;
  target_journal?: string;
  additional_requirements?: string;
  brief?: string;
}

export interface ArticleOrdersSummary {
  totalOrders: number;
  total?: number;
  newOrders: number;
  new?: number;
  inProgress: number;
  in_progress?: number;
  completed: number;
}
