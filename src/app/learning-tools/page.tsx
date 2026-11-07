"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DoseCalculator from "@/components/learning-tools/DoseCalculator";
import InteractionChecker from "@/components/learning-tools/InteractionChecker";
import DailyQuiz from "@/components/DailyQuiz";
import Flashcards from "@/components/learning-tools/Flashcards";
import StudyPlanner from "@/components/learning-tools/StudyPlanner";
import ProgressTracker from "@/components/learning-tools/ProgressTracker";

const TOOLS = [
  "Dose calculator",
  "Interaction checker",
  "MCQ quiz",
  "Flashcards",
  "Study planner",
  "Progress tracker",
] as const;

export default function LearningToolsPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <>
      <PageHeader
        title="Learning Tools"
        description="Practice tools for calculation, interactions, recall and planning."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          {/* Tabs */}
          <div className="tabs" role="tablist">
            {TOOLS.map((tool, idx) => (
              <button
                key={tool}
                role="tab"
                className={activeTab === idx ? "on" : ""}
                onClick={() => setActiveTab(idx)}
              >
                {tool}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tp" style={{ marginTop: "20px" }}>
            {activeTab === 0 && <DoseCalculator />}
            {activeTab === 1 && <InteractionChecker />}
            {activeTab === 2 && (
              <div className="card" style={{ maxWidth: "560px" }}>
                <DailyQuiz />
              </div>
            )}
            {activeTab === 3 && <Flashcards />}
            {activeTab === 4 && <StudyPlanner />}
            {activeTab === 5 && <ProgressTracker />}
          </div>
        </div>
      </section>
    </>
  );
}

