"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { RES } from "@/lib/rxfusionData";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function ResourcesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleDownloadResource = (resourceTitle: string) => {
    if (!user) {
      showToast("Please sign in to download clinical templates.");
      return;
    }
    showToast(`Downloading ${resourceTitle}...`);
    // Create quick text/csv/pdf blob download for clinical template
    const blobContent = `RxFusion Clinical Resource\nTitle: ${resourceTitle}\nCurriculum: Pharm.D Exclusive\nDate: ${new Date().toLocaleDateString()}\n\nOfficial template verified for Pharm.D hospital clerkship and clinical rounds.`;
    const blob = new Blob([blobContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resourceTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Pharm.D Clinical Resources"
        description="Standardized ward clerkship templates, adverse drug reaction forms, laboratory reference sheets and clinical rotation documentation."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap g3">
          {RES.map((r) => (
            <div key={r.title} className="card">
              <span className="pill">Clinical Template</span>
              <h3 style={{ marginTop: "10px" }}>{r.title}</h3>
              <p style={{ color: "var(--tx2)", fontSize: "14px", marginTop: "6px", lineHeight: "1.6" }}>
                {r.desc}
              </p>
              <button
                className="btn o"
                style={{ marginTop: "16px", padding: "7px 14px", fontSize: "13px" }}
                onClick={() => handleDownloadResource(r.title)}
              >
                Download Template
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
