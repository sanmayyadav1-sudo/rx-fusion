export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: "notes" | "blogs" | "resources";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type: "notes" | "blogs" | "resources";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: "notes" | "blogs" | "resources";
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          course: "Pharm D";
          semester: number;
          subject: string;
          file_url: string;
          category_id: string | null;
          created_at: string;
          subject_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          course?: "Pharm D";
          semester: number;
          subject: string;
          file_url: string;
          category_id?: string | null;
          created_at?: string;
          subject_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          course?: "Pharm D";
          semester?: number;
          subject?: string;
          file_url?: string;
          category_id?: string | null;
          created_at?: string;
          subject_id?: string | null;
        };
      };
      subjects: {
        Row: {
          id: string;
          course: "Pharm D";
          year_number: number;
          subject_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course?: "Pharm D";
          year_number: number;
          subject_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course?: "Pharm D";
          year_number?: number;
          subject_name?: string;
          created_at?: string;
        };
      };
    };
  };
}

export interface Subject {
  id: string;
  course: "Pharm D";
  year_number: number;
  subject_name: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  description: string | null;
  course: string;
  semester: number;
  subject: string;
  file_url: string;
  category_id: string | null;
  created_at: string;
  subject_id: string | null;
  subjects?: {
    id: string;
    subject_name: string;
    course: string;
    year_number: number;
  } | null;
}
