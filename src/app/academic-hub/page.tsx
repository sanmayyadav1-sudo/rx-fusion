import React from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { YR, SL, SUB } from "@/lib/rxfusionData";

export const metadata = {
  title: "Academic Hub",
  description: "Select your Pharm.D year to open its notes, question banks and study resources.",
};

export default function AcademicHubPage() {
  return (
    <>
      <PageHeader
        title="Academic Hub"
        description="Select your Pharm.D year to open its notes, question banks and study resources."
      />
      <section className="s" style={{ paddingTop: "36px" }}>
        <div className="wrap">
          <div className="g3">
            {YR.map((y, i) => (
              <Link key={y} className="card" href={`/academic-hub/${SL[i]}`}>
                <div className="serif" style={{ fontSize: "54px", color: "var(--blue)" }}>
                  {i + 1}
                </div>
                <h3>{y} year</h3>
                <p style={{ color: "var(--tx2)", fontSize: "14.5px" }}>
                  {SUB[i].slice(0, 3).join(", ")} and more.
                </p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: "24px", color: "var(--tx2)", fontSize: "14px" }}>
            Exclusively structured for Pharm.D 1st through 6th year and clinical interns.
          </p>
        </div>
      </section>
    </>
  );
}

