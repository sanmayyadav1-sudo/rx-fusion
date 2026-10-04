"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ClipboardList, 
  Search, 
  Mail, 
  Copy, 
  Check, 
  Eye, 
  Trash2, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Building, 
  BookOpen, 
  Calendar,
  X
} from "lucide-react";
import { ArticleOrder, ArticleOrdersSummary, OrderStatus } from "@/types/articleOrder";

const STATUS_LIST: OrderStatus[] = [
  "New",
  "Contacted",
  "In Progress",
  "Waiting for Information",
  "Completed",
  "Cancelled"
];

export default function ArticleOrdersAdminPage() {
  const [orders, setOrders] = useState<ArticleOrder[]>([]);
  const [summary, setSummary] = useState<ArticleOrdersSummary>({
    totalOrders: 0,
    newOrders: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");

  // Drawer / Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ArticleOrder | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("New");
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedService !== "all") params.set("service_type", selectedService);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (dateQuery) params.set("date", dateQuery);

      const res = await fetch(`/api/admin/article-orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load article orders");
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedService, selectedStatus, searchQuery, dateQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenOrder = (order: ArticleOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setInternalNotes(order.internal_notes || "");
    setCopiedEmail(false);
  };

  const handleUpdateStatusAndNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/admin/article-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: editStatus,
          internal_notes: internalNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setSelectedOrder(data.order);
      fetchOrders();
      alert("Order status & internal notes updated successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving updates");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) return;
    try {
      await fetch(`/api/admin/article-orders?id=${id}`, { method: "DELETE" });
      if (selectedOrder?.id === id) setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Failed to delete order");
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formatOrderEmail = (order: ArticleOrder) => {
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

    return {
      mailtoUrl: `mailto:rxfusion.support@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  };

  const handleOpenEmailClient = (order: ArticleOrder) => {
    const emailMeta = formatOrderEmail(order);
    window.location.href = emailMeta.mailtoUrl;
  };

  return (
    <div className="space-y-6 text-slate-200 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Article & Research Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review Article & Research Paper requests submitted by students and healthcare researchers.
          </p>
        </div>
      </div>

      {/* KPI Cards (Requirement 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-cyan-400 mb-1">{summary.totalOrders}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-amber-400 mb-1">{summary.newOrders}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Orders (Uncontacted)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
            <Loader2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-sky-400 mb-1">{summary.inProgress}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress / Contacted</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-1">{summary.completed}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed Orders</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3 backdrop-blur-md shadow-xl shadow-slate-950/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Service Types</option>
            <option value="Review Article">Review Article</option>
            <option value="Research Article / Research Paper">Research Article</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {STATUS_LIST.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateQuery}
            onChange={(e) => setDateQuery(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500"
            title="Filter by Order Date"
          />

          {(selectedService !== "all" || selectedStatus !== "all" || searchQuery || dateQuery) && (
            <button
              onClick={() => {
                setSelectedService("all");
                setSelectedStatus("all");
                setSearchQuery("");
                setDateQuery("");
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold">Loading article orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/10 border-dashed border border-slate-800/60 rounded-2xl m-6">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No article orders found</p>
            <p className="text-[11px] text-slate-500 mt-1">Submitted student requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service & Topic</th>
                  <th className="p-4 text-center">Deadline</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const isReview = order.service_type === "Review Article";
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors duration-150 group">
                      <td className="p-4 space-y-1">
                        <div className="font-mono font-bold text-cyan-400">{order.order_number}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-white group-hover:text-cyan-200">{order.name}</div>
                        <div className="text-[11px] text-slate-400">{order.email}</div>
                        <div className="text-[10px] text-slate-500">{order.mobile}</div>
                      </td>

                      <td className="p-4 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          isReview
                            ? "bg-violet-500/10 text-violet-300 border border-violet-500/30"
                            : "bg-sky-500/10 text-sky-300 border border-sky-500/30"
                        }`}>
                          {order.service_type}
                        </span>
                        <div className="font-semibold text-slate-200 line-clamp-1">{order.topic}</div>
                        <div className="text-[10px] text-slate-400">
                          {order.word_count} words • {order.references_count} refs • {order.citation_style}
                        </div>
                      </td>

                      <td className="p-4 text-center font-bold text-amber-300">
                        {order.deadline}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          order.status === "New"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : order.status === "In Progress" || order.status === "Contacted"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : order.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleOpenOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700"
                            title="Inspect Full Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEmailClient(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-sky-400 border border-slate-700"
                            title="Open Email Client"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(order.id, order.order_number)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL ORDER INSPECTION & MANAGEMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {selectedOrder.order_number}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{selectedOrder.topic}</h2>
              <p className="text-xs text-slate-400">
                Service: <strong className="text-cyan-300">{selectedOrder.service_type}</strong> • Submitted: {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Details</span>
                <div className="font-bold text-white text-sm">{selectedOrder.name}</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedOrder.email}</span>
                  <button
                    onClick={() => handleCopyEmail(selectedOrder.email)}
                    className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedOrder.mobile}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Affiliation</span>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  <span>Course: {selectedOrder.course}</span>
                </div>
                <div className="text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Institution: {selectedOrder.institution}</span>
                </div>
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deadline: {selectedOrder.deadline}</span>
                </div>
              </div>
            </div>

            {/* Scope / Specs */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Word Count</span>
                <p className="font-bold text-white mt-0.5">{selectedOrder.word_count} words</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">References</span>
                <p className="font-bold text-white mt-0.5">{selectedOrder.references_count} citations</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Citation Style</span>
                <p className="font-bold text-cyan-400 mt-0.5">{selectedOrder.citation_style}</p>
              </div>
            </div>

            {/* Target Journal & Scope */}
            {selectedOrder.target_journal && (
              <div className="text-xs">
                <strong className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Target Journal / Format:</strong>
                <p className="text-slate-200 bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">{selectedOrder.target_journal}</p>
              </div>
            )}

            {selectedOrder.brief && (
              <div className="text-xs">
                <strong className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Research Brief / Scope:</strong>
                <p className="text-slate-200 bg-slate-800/30 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.brief}
                </p>
              </div>
            )}

            {selectedOrder.additional_requirements && (
              <div className="text-xs">
                <strong className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Additional Requirements:</strong>
                <p className="text-slate-200 bg-slate-800/30 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.additional_requirements}
                </p>
              </div>
            )}

            {/* Status Change & Internal Notes */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    {STATUS_LIST.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => handleOpenEmailClient(selectedOrder)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Email App</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Internal Administrative Notes (Private)
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record communication logs, faculty reviewer assigned, draft progress..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800 border border-slate-700 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleUpdateStatusAndNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Status & Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
