"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from("contact_messages")
        .insert([{ name, email, message }]);

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred while sending your message. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      {/* Background radial overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-cyan-605 uppercase tracking-widest bg-cyan-50 px-3.5 py-1.5 rounded-full border border-cyan-100/50">
            CONTACT US
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Have a Question? We&apos;re Here to Help
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Have a question about RxFusion, pharmacy notes, colleges, resources, or website access? Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch px-2">
          {/* Column 1: Contact Cards */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Option 1: WhatsApp Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs text-left relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.63 1.977 14.154.952 11.53.951c-5.444 0-9.87 4.372-9.874 9.802-.001 1.73.463 3.42 1.343 4.927l-.958 3.5 3.6-.94c1.514.826 3.1 1.258 4.675 1.258h.023zm10.963-7.477c-.3-.15-1.77-.875-2.046-.975-.276-.1-.477-.15-.677.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.04-1.52-4.004-2.61-4.74-3.885-.196-.34-.02-.52.15-.69.15-.15.3-.35.45-.53.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.625-.926-2.225-.244-.589-.493-.51-.677-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.897 4.33.685.297 1.22.474 1.637.607.69.219 1.317.188 1.812.114.55-.082 1.77-.725 2.02-1.425.25-.7.25-1.3 1.75-1.4.075-.1.225-.25.075-.4z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">WhatsApp</span>
                    <h3 className="text-base font-extrabold text-slate-800 leading-tight">Chat with RxFusion</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Get in touch with us for RxFusion support and general queries.
                </p>
                <div className="text-sm font-bold text-slate-700">
                  +917350410894
                </div>
              </div>
              <div className="mt-5">
                <a
                  href={`https://wa.me/917350410894?text=${encodeURIComponent("Hello RxFusion 👋\n\nI am visiting the RxFusion website and I have a query. Please help me.\n\nThank you.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors duration-150 shadow-xs active:translate-y-0.5"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Option 2: Email Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs text-left relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider block">Email</span>
                    <h3 className="text-base font-extrabold text-slate-800 leading-tight">Email Support</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Send us your questions, suggestions, or support queries.
                </p>
                <div className="text-sm font-bold text-slate-700 break-all">
                  rxfusion.support@gmail.com
                </div>
              </div>
              <div className="mt-5">
                <a
                  href={`mailto:rxfusion.support@gmail.com?subject=${encodeURIComponent("RxFusion Website Query")}&body=${encodeURIComponent("Hello RxFusion Team,\n\nI am contacting you regarding a query about RxFusion.\n\nMy Query:\n\nThank you.")}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs transition-colors duration-150 shadow-xs active:translate-y-0.5"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xs text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Send a Message
            </h2>

            {success && (
              <div className="mb-6 p-4.5 rounded-xl bg-emerald-50 border border-emerald-250 flex items-start space-x-3 text-sm text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-emerald-900">Message Sent Successfully!</h3>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Thank you for reaching out. We will read your feedback and get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-sm text-red-650">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm placeholder-slate-400"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm placeholder-slate-400"
                    placeholder="your.email@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >
                  Message Content
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm resize-none placeholder-slate-400"
                  placeholder="How can we assist you with study materials, syllabus configs, or other details..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-xl font-bold text-sm transition-colors duration-150 shadow-sm shadow-cyan-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
