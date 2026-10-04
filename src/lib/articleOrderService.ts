import fs from "fs";
import path from "path";
import { getServiceSupabaseClient } from "./authHelpers";
import { ArticleOrder, ArticleOrderFormData, ArticleOrdersSummary, OrderStatus } from "@/types/articleOrder";

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "article_orders.json");

export const OFFICIAL_SUPPORT_EMAIL = "rxfusion.support@gmail.com";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RX-ART-${dateStr}-${randomSuffix}`;
}

export class ArticleOrderService {
  static async createOrder(formData: ArticleOrderFormData): Promise<ArticleOrder> {
    const now = new Date().toISOString();
    const id = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = generateOrderNumber();

    const parsedWordCount = typeof formData.word_count === "number"
      ? formData.word_count
      : parseInt(String(formData.word_count).replace(/[^0-9]/g, ""), 10) || 0;

    const parsedReferencesCount = typeof formData.references_count === "number"
      ? formData.references_count
      : parseInt(String(formData.references_count).replace(/[^0-9]/g, ""), 10) || 0;

    const record: ArticleOrder = {
      id,
      order_number: orderNumber,
      service_type: formData.service_type,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      topic: formData.topic.trim(),
      course: formData.course.trim(),
      institution: formData.institution.trim(),
      word_count: parsedWordCount,
      references_count: parsedReferencesCount,
      citation_style: formData.citation_style,
      deadline: formData.deadline.trim(),
      target_journal: formData.target_journal?.trim() || null,
      additional_requirements: formData.additional_requirements?.trim() || null,
      brief: formData.brief?.trim() || null,
      status: "New",
      internal_notes: null,
      created_at: now,
      updated_at: now
    };

    // Try Supabase first
    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("article_orders").insert(record).select().single();
      if (!error && data) {
        this.syncLocal(record);
        return data as ArticleOrder;
      }
    } catch {
      // Fallback
    }

    this.syncLocal(record);
    return record;
  }

  private static syncLocal(record: ArticleOrder): void {
    const list = readJsonFile<ArticleOrder[]>(ORDERS_FILE, []);
    const idx = list.findIndex(o => o.id === record.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    writeJsonFile(ORDERS_FILE, list);
  }

  static async getAllOrders(filters?: {
    service_type?: string;
    status?: string;
    search?: string;
    date?: string;
  }): Promise<ArticleOrder[]> {
    try {
      const supabase = getServiceSupabaseClient();
      let query = supabase.from("article_orders").select("*");

      if (filters?.service_type) query = query.eq("service_type", filters.service_type);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) {
        let results = data as ArticleOrder[];
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          results = results.filter(
            o =>
              o.order_number.toLowerCase().includes(s) ||
              o.name.toLowerCase().includes(s) ||
              o.email.toLowerCase().includes(s) ||
              o.topic.toLowerCase().includes(s)
          );
        }
        return results;
      }
    } catch {
      // Fallback
    }

    let list = readJsonFile<ArticleOrder[]>(ORDERS_FILE, []);
    if (filters?.service_type) {
      list = list.filter(o => o.service_type === filters.service_type);
    }
    if (filters?.status) {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters?.date) {
      list = list.filter(o => o.created_at.startsWith(filters.date!));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        o =>
          o.order_number.toLowerCase().includes(s) ||
          o.name.toLowerCase().includes(s) ||
          o.email.toLowerCase().includes(s) ||
          o.topic.toLowerCase().includes(s)
      );
    }

    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  static async getOrderById(id: string): Promise<ArticleOrder | null> {
    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("article_orders").select("*").eq("id", id).maybeSingle();
      if (!error && data) return data as ArticleOrder;
    } catch {
      // Fallback
    }

    const list = readJsonFile<ArticleOrder[]>(ORDERS_FILE, []);
    return list.find(o => o.id === id) || null;
  }

  static async updateOrderStatusAndNotes(
    id: string,
    updates: { status?: OrderStatus; internal_notes?: string }
  ): Promise<ArticleOrder | null> {
    const now = new Date().toISOString();
    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase
        .from("article_orders")
        .update({ ...updates, updated_at: now })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        this.syncLocal(data as ArticleOrder);
        return data as ArticleOrder;
      }
    } catch {
      // Fallback
    }

    const list = readJsonFile<ArticleOrder[]>(ORDERS_FILE, []);
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.internal_notes !== undefined ? { internal_notes: updates.internal_notes } : {}),
      updated_at: now
    };
    writeJsonFile(ORDERS_FILE, list);
    return list[idx];
  }

  static async deleteOrder(id: string): Promise<boolean> {
    try {
      const supabase = getServiceSupabaseClient();
      await supabase.from("article_orders").delete().eq("id", id);
    } catch {
      // Fallback
    }

    const list = readJsonFile<ArticleOrder[]>(ORDERS_FILE, []);
    writeJsonFile(ORDERS_FILE, list.filter(o => o.id !== id));
    return true;
  }

  static async getSummary(): Promise<ArticleOrdersSummary> {
    const list = await this.getAllOrders();
    const newCount = list.filter(o => o.status === "New").length;
    const inProgCount = list.filter(o => o.status === "In Progress" || o.status === "Contacted").length;
    const compCount = list.filter(o => o.status === "Completed").length;
    return {
      totalOrders: list.length,
      total: list.length,
      newOrders: newCount,
      new: newCount,
      inProgress: inProgCount,
      in_progress: inProgCount,
      completed: compCount
    };
  }

  /**
   * Helper to format email subject and body for submission or admin client opening
   */
  static formatEmailDetails(order: ArticleOrder | ArticleOrderFormData) {
    const isReview = order.service_type === "Review Article";
    const subjectPrefix = isReview ? "Review Article Order" : "Research Article Order";
    const subject = `${subjectPrefix} – [${order.topic}]`;

    const body = `Name: ${order.name}
Email: ${order.email}
Mobile: ${order.mobile}
Service: ${order.service_type}
Topic: ${order.topic}
Course: ${order.course}
College/Institution: ${order.institution}
Word Count: ${order.word_count}
References: ${order.references_count}
Citation Style: ${order.citation_style}
Deadline: ${order.deadline}
Journal/Target: ${order.target_journal || "N/A"}
Additional Requirements: ${order.additional_requirements || "None"}
Brief / Research Scope: ${order.brief || "N/A"}`;

    const mailtoUrl = `mailto:${OFFICIAL_SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return {
      to: OFFICIAL_SUPPORT_EMAIL,
      recipient: OFFICIAL_SUPPORT_EMAIL,
      subject,
      body,
      mailtoUrl
    };
  }

  static formatEmail(order: ArticleOrder | ArticleOrderFormData) {
    return this.formatEmailDetails(order);
  }

  static generateMailto(order: ArticleOrder | ArticleOrderFormData): string {
    return this.formatEmailDetails(order).mailtoUrl;
  }

  static async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<ArticleOrder | null> {
    return this.updateOrderStatusAndNotes(id, { status, internal_notes: notes });
  }
}
