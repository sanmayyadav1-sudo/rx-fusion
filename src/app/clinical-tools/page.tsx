"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  RefreshCw, 
  Scale, 
  Activity, 
  Flame, 
  Droplet, 
  Clock, 
  Layers, 
  Sparkles, 
  AlertCircle,
  Heart,
  ShieldAlert,
  Thermometer,
  Zap,
  Info
} from "lucide-react";
import {
  calculateBMI,
  calculateBSA,
  calculateIBW,
  calculateCrCl,
  calculateEGFR,
  calculateCorrectedCalcium,
  calculateAnionGap,
  calculateCorrectedSodium,
  calculateChildPugh,
  calculateMELD,
  calculateCHADS2VASC,
  calculateHASBLED,
  calculatePediatricDose,
  calculateIVFlowRate,
  calculateInfusionRate,
  convertUnits,
  CalculatorResult
} from "@/lib/calculators";

type ToolType = 
  | "bmi" 
  | "bsa" 
  | "crcl" 
  | "egfr"
  | "ibw" 
  | "corrected_ca"
  | "anion_gap"
  | "corrected_na"
  | "child_pugh"
  | "meld"
  | "chads2vasc"
  | "has_bled"
  | "pediatric" 
  | "iv_flow" 
  | "infusion_rate" 
  | "unit_converter";

export default function ClinicalToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("bmi");

  // State values for tools
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [serumCreatinine, setSerumCreatinine] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bsaMethod, setBsaMethod] = useState<"mosteller" | "dubois">("mosteller");

  // Electrolyte & Lab states
  const [serumCa, setSerumCa] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [hco3, setHco3] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bilirubin, setBilirubin] = useState("");
  const [inr, setInr] = useState("");
  const [encephalopathy, setEncephalopathy] = useState<1 | 2 | 3>(1);
  const [ascites, setAscites] = useState<1 | 2 | 3>(1);
  const [dialysis, setDialysis] = useState(false);

  // Score checkboxes
  const [chf, setChf] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [strokeVte, setStrokeVte] = useState(false);
  const [vascular, setVascular] = useState(false);

  const [abnormalRenal, setAbnormalRenal] = useState(false);
  const [abnormalLiver, setAbnormalLiver] = useState(false);
  const [bleedingHistory, setBleedingHistory] = useState(false);
  const [labileINR, setLabileINR] = useState(false);
  const [drugs, setDrugs] = useState(false);
  const [alcohol, setAlcohol] = useState(false);

  // Dosing & Infusion
  const [recommendedDose, setRecommendedDose] = useState("");
  const [frequency, setFrequency] = useState<1 | 2 | 3 | 4>(3);
  const [volume, setVolume] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"hours" | "minutes">("hours");
  const [dropFactor, setDropFactor] = useState("20");

  // Unit converter
  const [convVal, setConvVal] = useState("");
  const [convType, setConvType] = useState<"lb_kg" | "kg_lb" | "mg_mcg" | "mcg_mg" | "ml_l" | "l_ml" | "in_cm" | "cm_in">("lb_kg");

  // Output Result
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const resetFields = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setSerumCreatinine("");
    setSerumCa("");
    setAlbumin("");
    setNa("");
    setCl("");
    setHco3("");
    setGlucose("");
    setBilirubin("");
    setInr("");
    setRecommendedDose("");
    setVolume("");
    setTime("");
    setConvVal("");
    setChf(false);
    setHypertension(false);
    setDiabetes(false);
    setStrokeVte(false);
    setVascular(false);
    setAbnormalRenal(false);
    setAbnormalLiver(false);
    setBleedingHistory(false);
    setLabileINR(false);
    setDrugs(false);
    setAlcohol(false);
    setResult(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let res: CalculatorResult | null = null;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const scr = parseFloat(serumCreatinine);

    switch (activeTool) {
      case "bmi":
        res = calculateBMI(w, h);
        break;
      case "bsa":
        res = calculateBSA(w, h, bsaMethod);
        break;
      case "ibw":
        res = calculateIBW(h, gender, w);
        break;
      case "crcl":
        res = calculateCrCl(a, w, scr, gender, h);
        break;
      case "egfr":
        res = calculateEGFR(a, scr, gender);
        break;
      case "corrected_ca":
        res = calculateCorrectedCalcium(parseFloat(serumCa), parseFloat(albumin));
        break;
      case "anion_gap":
        res = calculateAnionGap(parseFloat(na), parseFloat(cl), parseFloat(hco3));
        break;
      case "corrected_na":
        res = calculateCorrectedSodium(parseFloat(na), parseFloat(glucose));
        break;
      case "child_pugh":
        res = calculateChildPugh(encephalopathy, ascites, parseFloat(bilirubin), parseFloat(albumin), parseFloat(inr));
        break;
      case "meld":
        res = calculateMELD(parseFloat(bilirubin), parseFloat(inr), scr, dialysis);
        break;
      case "chads2vasc":
        res = calculateCHADS2VASC({
          chf,
          hypertension,
          age: a || 0,
          diabetes,
          strokeVte,
          vascular,
          female: gender === "female"
        });
        break;
      case "has_bled":
        res = calculateHASBLED({
          hypertension,
          abnormalRenal,
          abnormalLiver,
          strokeHistory: strokeVte,
          bleedingHistory,
          labileINR,
          elderly: (a || 0) >= 65,
          drugs,
          alcohol
        });
        break;
      case "pediatric":
        res = calculatePediatricDose(w, parseFloat(recommendedDose), frequency);
        break;
      case "iv_flow": {
        const timeInMin = timeUnit === "hours" ? parseFloat(time) * 60 : parseFloat(time);
        res = calculateIVFlowRate(parseFloat(volume), timeInMin, parseFloat(dropFactor));
        break;
      }
      case "infusion_rate":
        res = calculateInfusionRate(parseFloat(volume), parseFloat(time));
        break;
      case "unit_converter":
        res = convertUnits(parseFloat(convVal), convType);
        break;
    }

    setResult(res);
  };

  const menuItems: { id: ToolType; name: string; category: string; icon: React.ReactNode }[] = [
    { id: "bmi", name: "BMI Calculator", category: "Body Indexes", icon: <Scale className="w-4 h-4" /> },
    { id: "bsa", name: "BSA Calculator", category: "Body Indexes", icon: <Activity className="w-4 h-4" /> },
    { id: "ibw", name: "Ideal Body Weight", category: "Body Indexes", icon: <Flame className="w-4 h-4" /> },
    { id: "crcl", name: "Creatinine Clearance", category: "Renal Function", icon: <Layers className="w-4 h-4" /> },
    { id: "egfr", name: "eGFR (CKD-EPI 2021)", category: "Renal Function", icon: <Zap className="w-4 h-4" /> },
    { id: "corrected_ca", name: "Corrected Calcium", category: "Lab Corrections", icon: <Sparkles className="w-4 h-4" /> },
    { id: "anion_gap", name: "Anion Gap", category: "Lab Corrections", icon: <Thermometer className="w-4 h-4" /> },
    { id: "corrected_na", name: "Corrected Sodium", category: "Lab Corrections", icon: <Droplet className="w-4 h-4" /> },
    { id: "child_pugh", name: "Child-Pugh Score", category: "Clinical Scoring", icon: <Activity className="w-4 h-4" /> },
    { id: "meld", name: "MELD Score", category: "Clinical Scoring", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "chads2vasc", name: "CHA2DS2-VASc Score", category: "Clinical Scoring", icon: <Heart className="w-4 h-4" /> },
    { id: "has_bled", name: "HAS-BLED Score", category: "Clinical Scoring", icon: <AlertCircle className="w-4 h-4" /> },
    { id: "pediatric", name: "Pediatric Dosing", category: "Dosing & Infusions", icon: <Sparkles className="w-4 h-4" /> },
    { id: "iv_flow", name: "IV Flow Rate", category: "Dosing & Infusions", icon: <Droplet className="w-4 h-4" /> },
    { id: "infusion_rate", name: "Infusion Rate", category: "Dosing & Infusions", icon: <Clock className="w-4 h-4" /> },
    { id: "unit_converter", name: "Unit Converter", category: "Utilities", icon: <Calculator className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between select-none">
      
      <main className="flex-grow pt-24 pb-16 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <header className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
              <Calculator className="w-3.5 h-3.5" />
              <span>Medical &amp; Clinical Pharmacy Suite</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Clinical Calculators &amp; Dosing Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
              Medically verified clinical equations for renal clearance, electrolyte corrections, body indexes, stroke risks, and IV flow rates.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Left Menu */}
            <aside className="md:col-span-1 space-y-1 bg-slate-950/50 p-3 border border-slate-800/60 rounded-3xl max-h-[700px] overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTool(item.id); resetFields(); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    activeTool === item.id
                      ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900/40 border-slate-800/40 hover:bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </aside>

            {/* Right Form Card Panel */}
            <section className="md:col-span-3 space-y-6">
              <div className="bg-slate-950/60 border border-slate-800/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative backdrop-blur-md">
                <h2 className="text-base sm:text-lg font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  <span>{menuItems.find(m => m.id === activeTool)?.name}</span>
                </h2>

                <form onSubmit={handleCalculate} className="space-y-5">
                  
                  {/* Basic Demographics Inputs (Height/Weight/Age/Gender) */}
                  {(activeTool === "bmi" || activeTool === "bsa" || activeTool === "crcl" || activeTool === "egfr" || activeTool === "ibw" || activeTool === "pediatric" || activeTool === "chads2vasc" || activeTool === "has_bled") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Weight */}
                      {(activeTool === "bmi" || activeTool === "bsa" || activeTool === "crcl" || activeTool === "ibw" || activeTool === "pediatric") && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Patient Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 70"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm font-semibold placeholder:text-slate-600"
                          />
                        </div>
                      )}

                      {/* Height */}
                      {(activeTool === "bmi" || activeTool === "bsa" || activeTool === "ibw" || activeTool === "crcl") && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 175"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm font-semibold placeholder:text-slate-600"
                          />
                        </div>
                      )}

                      {/* Age */}
                      {(activeTool === "crcl" || activeTool === "egfr" || activeTool === "chads2vasc" || activeTool === "has_bled") && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Age (Years)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 62"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm font-semibold placeholder:text-slate-600"
                          />
                        </div>
                      )}

                      {/* Serum Creatinine */}
                      {(activeTool === "crcl" || activeTool === "egfr") && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Serum Creatinine (mg/dL)
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 1.1"
                            value={serumCreatinine}
                            onChange={(e) => setSerumCreatinine(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm font-semibold placeholder:text-slate-600"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Biological Gender Selector */}
                  {(activeTool === "crcl" || activeTool === "egfr" || activeTool === "ibw" || activeTool === "chads2vasc") && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Biological Sex
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "male"}
                            onChange={() => setGender("male")}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Male</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "female"}
                            onChange={() => setGender("female")}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Female</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* BSA Method selector */}
                  {activeTool === "bsa" && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Calculation Method
                      </label>
                      <select
                        value={bsaMethod}
                        onChange={(e) => setBsaMethod(e.target.value as "mosteller" | "dubois")}
                        className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold cursor-pointer"
                      >
                        <option value="mosteller">Mosteller Formula (Standard Oncology)</option>
                        <option value="dubois">DuBois &amp; DuBois Formula</option>
                      </select>
                    </div>
                  )}

                  {/* Corrected Ca Inputs */}
                  {activeTool === "corrected_ca" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Calcium (mg/dL)</label>
                        <input type="number" step="any" placeholder="e.g. 7.8" value={serumCa} onChange={(e) => setSerumCa(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Albumin (g/dL)</label>
                        <input type="number" step="any" placeholder="e.g. 2.5" value={albumin} onChange={(e) => setAlbumin(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                    </div>
                  )}

                  {/* Anion Gap Inputs */}
                  {activeTool === "anion_gap" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Na⁺ (mEq/L)</label>
                        <input type="number" placeholder="e.g. 140" value={na} onChange={(e) => setNa(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Cl⁻ (mEq/L)</label>
                        <input type="number" placeholder="e.g. 104" value={cl} onChange={(e) => setCl(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum HCO₃⁻ (mEq/L)</label>
                        <input type="number" placeholder="e.g. 24" value={hco3} onChange={(e) => setHco3(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                    </div>
                  )}

                  {/* Corrected Na Inputs */}
                  {activeTool === "corrected_na" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Measured Na⁺ (mEq/L)</label>
                        <input type="number" placeholder="e.g. 132" value={na} onChange={(e) => setNa(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Glucose (mg/dL)</label>
                        <input type="number" placeholder="e.g. 450" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                    </div>
                  )}

                  {/* Child Pugh & MELD Inputs */}
                  {(activeTool === "child_pugh" || activeTool === "meld") && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total Bilirubin (mg/dL)</label>
                        <input type="number" step="any" placeholder="e.g. 2.1" value={bilirubin} onChange={(e) => setBilirubin(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">INR</label>
                        <input type="number" step="any" placeholder="e.g. 1.8" value={inr} onChange={(e) => setInr(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      {activeTool === "child_pugh" && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serum Albumin (g/dL)</label>
                          <input type="number" step="any" placeholder="e.g. 3.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTool === "child_pugh" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Hepatic Encephalopathy</label>
                        <select value={encephalopathy} onChange={(e) => setEncephalopathy(Number(e.target.value) as 1 | 2 | 3)} className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                          <option value={1}>None (1 pt)</option>
                          <option value={2}>Grade 1-2 / Mild (2 pts)</option>
                          <option value={3}>Grade 3-4 / Severe (3 pts)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ascites</label>
                        <select value={ascites} onChange={(e) => setAscites(Number(e.target.value) as 1 | 2 | 3)} className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                          <option value={1}>None (1 pt)</option>
                          <option value={2}>Slight / Mild (2 pts)</option>
                          <option value={3}>Moderate / Severe (3 pts)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTool === "meld" && (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="dialysis" checked={dialysis} onChange={(e) => setDialysis(e.target.checked)} className="rounded text-cyan-500 focus:ring-cyan-500" />
                      <label htmlFor="dialysis" className="text-xs font-semibold text-slate-300">Dialysis at least twice in past 7 days</label>
                    </div>
                  )}

                  {/* CHA2DS2-VASc checkboxes */}
                  {activeTool === "chads2vasc" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={chf} onChange={(e) => setChf(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Congestive Heart Failure (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={hypertension} onChange={(e) => setHypertension(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Hypertension (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Diabetes Mellitus (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={strokeVte} onChange={(e) => setStrokeVte(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Prior Stroke / TIA / Thromboembolism (+2)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={vascular} onChange={(e) => setVascular(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Vascular Disease (MI, PAD, aortic plaque) (+1)</span>
                      </label>
                    </div>
                  )}

                  {/* HAS-BLED checkboxes */}
                  {activeTool === "has_bled" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={hypertension} onChange={(e) => setHypertension(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Uncontrolled Hypertension (SBP &gt; 160) (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={abnormalRenal} onChange={(e) => setAbnormalRenal(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Abnormal Renal Function (Dialysis/Cr &gt; 2.26) (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={abnormalLiver} onChange={(e) => setAbnormalLiver(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Abnormal Liver Function (Cirrhosis/Bili &gt; 2x) (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={strokeVte} onChange={(e) => setStrokeVte(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Prior Stroke History (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={bleedingHistory} onChange={(e) => setBleedingHistory(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Prior Major Bleeding / Predisposition (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={labileINR} onChange={(e) => setLabileINR(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Labile INR / Unstable therapeutic time (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={drugs} onChange={(e) => setDrugs(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Concomitant Antiplatelets / NSAIDs (+1)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={alcohol} onChange={(e) => setAlcohol(e.target.checked)} className="rounded text-cyan-500" />
                        <span>Alcohol Abuse (≥ 8 drinks/week) (+1)</span>
                      </label>
                    </div>
                  )}

                  {/* Pediatric Dosing Inputs */}
                  {activeTool === "pediatric" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Recommended Dose (mg/kg/day)</label>
                        <input type="number" step="any" placeholder="e.g. 15" value={recommendedDose} onChange={(e) => setRecommendedDose(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Administrations per day</label>
                        <select value={frequency} onChange={(e) => setFrequency(Number(e.target.value) as 1 | 2 | 3 | 4)} className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                          <option value={1}>Once Daily (QD / q24h)</option>
                          <option value={2}>Twice Daily (BID / q12h)</option>
                          <option value={3}>Three Times Daily (TID / q8h)</option>
                          <option value={4}>Four Times Daily (QID / q6h)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* IV Rates Inputs */}
                  {(activeTool === "iv_flow" || activeTool === "infusion_rate") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total Volume (mL)</label>
                          <input type="number" placeholder="e.g. 500" value={volume} onChange={(e) => setVolume(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Infusion Time</label>
                            <input type="number" placeholder="e.g. 8" value={time} onChange={(e) => setTime(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                          </div>
                          {activeTool === "iv_flow" && (
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unit</label>
                              <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value as "hours" | "minutes")} className="block w-full px-2 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                                <option value="hours">Hours</option>
                                <option value="minutes">Minutes</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {activeTool === "iv_flow" && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Drop Factor (gtt/mL)</label>
                          <select value={dropFactor} onChange={(e) => setDropFactor(e.target.value)} className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                            <option value="10">10 drops/mL (Macrodrip - blood, thick solutions)</option>
                            <option value="15">15 drops/mL (Macrodrip - standard solutions)</option>
                            <option value="20">20 drops/mL (Macrodrip - standard solutions)</option>
                            <option value="60">60 drops/mL (Microdrip - pediatric/critical drugs)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unit Converter Inputs */}
                  {activeTool === "unit_converter" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Source Value</label>
                        <input type="number" step="any" placeholder="Enter value..." value={convVal} onChange={(e) => setConvVal(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Conversion Type</label>
                        <select value={convType} onChange={(e) => setConvType(e.target.value as "lb_kg" | "kg_lb" | "mg_mcg" | "mcg_mg" | "ml_l" | "l_ml" | "in_cm" | "cm_in")} className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold">
                          <option value="lb_kg">Pounds (lbs) ➔ Kilograms (kg)</option>
                          <option value="kg_lb">Kilograms (kg) ➔ Pounds (lbs)</option>
                          <option value="mg_mcg">Milligrams (mg) ➔ Micrograms (mcg)</option>
                          <option value="mcg_mg">Micrograms (mcg) ➔ Milligrams (mg)</option>
                          <option value="ml_l">Milliliters (mL) ➔ Liters (L)</option>
                          <option value="l_ml">Liters (L) ➔ Milliliters (mL)</option>
                          <option value="in_cm">Inches (in) ➔ Centimeters (cm)</option>
                          <option value="cm_in">Centimeters (cm) ➔ Inches (in)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submission Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={resetFields}
                      className="px-4 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Calculate</span>
                    </button>
                  </div>

                </form>

                {/* Calculation Outputs */}
                {result && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 animate-fade-in">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calculation Output</p>
                      <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">{result.value}</p>
                    </div>

                    {result.details && (
                      <p className="text-xs text-slate-300 font-semibold">{result.details}</p>
                    )}

                    {result.warning && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/40">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{result.warning}</span>
                      </div>
                    )}

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Formula Applied</p>
                      <p className="text-xs text-slate-300 font-mono font-bold leading-normal">{result.formula}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Clinical Disclaimer */}
              <div className="bg-slate-950/40 border border-slate-800/50 p-5 rounded-3xl text-[10px] text-slate-400 leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-300 uppercase tracking-wider">Clinical Reference Disclaimer</p>
                  <p>
                    These calculators are provided solely as academic verification resources for pharmacy and medical students. All calculations must be independently reviewed and approved by certified medical practitioners before clinical dosing implementations.
                  </p>
                </div>
              </div>

            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
