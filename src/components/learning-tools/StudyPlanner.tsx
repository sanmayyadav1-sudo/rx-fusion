"use client";

import React, { useState } from "react";

export default function StudyPlanner() {
  const [tasks, setTasks] = useState<string[]>([
    "Review renal dose adjustments in CKD",
    "Prepare SOAP note for tomorrow's ward round",
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      setTasks((prev) => [...prev, trimmed]);
      setInputVal("");
    }
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <form onSubmit={handleAddTask}>
        <label htmlFor="ts">Add a study task</label>
        <input
          id="ts"
          type="text"
          placeholder="e.g. Read antimicrobial stewardship guidelines"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit" className="btn" id="ta" style={{ marginTop: "10px" }}>
          Add task
        </button>
      </form>

      <ul id="tl" style={{ marginTop: "14px", paddingLeft: "18px" }}>
        {tasks.map((task, idx) => (
          <li key={idx} style={{ marginTop: "6px" }}>
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}

