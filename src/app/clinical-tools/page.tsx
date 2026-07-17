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
  AlertCircle
} from "lucide-react";

type ToolType = 
  | "bmi" 
  | "bsa" 
  | "crcl" 
  | "ibw" 
  | "pediatric" 
  | "iv_flow" 
  | "infusion_rate" 
  | "dose_weight" 
  | "unit_converter";

export default function ClinicalToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("bmi");

  // State values for tools
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [serumCreatinine, setSerumCreatinine] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [recommendedDose, setRecommendedDose] = useState("");
  const [frequency, setFrequency] = useState("3"); // QD(1), BID(2), TID(3), QID(4)
  const [volume, setVolume] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"hours" | "minutes">("hours");
  const [dropFactor, setDropFactor] = useState("20"); // 10, 15, 20, 60
  
  // Unit converter states
  const [convVal, setConvVal] = useState("");
  const [convType, setConvType] = useState<"lb_kg" | "kg_lb" | "mg_mcg" | "mcg_mg" | "ml_l" | "l_ml" | "in_cm" | "cm_in">("lb_kg");

  interface CalculationResult {
    value: string;
    formula: string;
    details?: string;
    color?: string;
  }

  // Output Results State
  const [result, setResult] = useState<CalculationResult | null>(null);

  const resetFields = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setSerumCreatinine("");
    setRecommendedDose("");
    setVolume("");
    setTime("");
    setConvVal("");
    setResult(null);
  };

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // to meters
    if (!w || !h) return;
    const bmi = w / (h * h);
    let category = "";
    let color = "";
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-amber-500";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal Weight";
      color = "text-emerald-500 font-bold";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "text-amber-500";
    } else {
      category = "Obese";
      color = "text-red-500 font-bold";
    }
    setResult({
      value: bmi.toFixed(2),
      details: `Category: ${category}`,
      color,
      formula: "BMI = Weight (kg) / Height (m)²"
    });
  };

  const calculateBSA = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return;
    // Mosteller formula: BSA = sqrt( (h * w) / 3600 )
    const bsa = Math.sqrt((h * w) / 3600);
    setResult({
      value: `${bsa.toFixed(2)} m²`,
      formula: "BSA (Mosteller) = √[ (Height (cm) * Weight (kg)) / 3600 ]",
      details: "Commonly used for dosing chemotherapeutic and other toxic drugs."
    });
  };

  const calculateCrCl = () => {
    const w = parseFloat(weight);
    const a = parseInt(age);
    const scr = parseFloat(serumCreatinine);
    if (!w || !a || !scr) return;

    // Cockcroft-Gault formula
    // Male: CrCl = ((140 - Age) * Weight) / (72 * Serum Creatinine)
    // Female: CrCl = Male * 0.85
    let crcl = ((140 - a) * w) / (72 * scr);
    if (gender === "female") {
      crcl *= 0.85;
    }

    setResult({
      value: `${crcl.toFixed(2)} mL/min`,
      formula: `Cockcroft-Gault: [ (140 - Age) * Weight (kg) ] / [ 72 * Serum Creatinine (mg/dL) ]${gender === "female" ? " * 0.85 for Females" : ""}`,
      details: "Used to determine drug dosing adjustments in patients with renal impairment."
    });
  };

  const calculateIBW = () => {
    const h = parseFloat(height);
    if (!h) return;
    // Devine formula (1974)
    // Male: 50.0 kg + 2.3 kg per inch over 5 feet (60 inches)
    // Female: 45.5 kg + 2.3 kg per inch over 5 feet
    const heightInches = h / 2.54;
    const inchesOver5Feet = Math.max(0, heightInches - 60);
    
    let ibw = 0;
    if (gender === "male") {
      ibw = 50.0 + 2.3 * inchesOver5Feet;
    } else {
      ibw = 45.5 + 2.3 * inchesOver5Feet;
    }

    setResult({
      value: `${ibw.toFixed(2)} kg`,
      formula: `Devine Formula: ${gender === "male" ? "50.0" : "45.5"} kg + 2.3 kg per inch over 5 feet (152.4 cm)`,
      details: "Used for determining doses of drugs that do not distribute into body fat (e.g. Aminoglycosides)."
    });
  };

  const calculatePediatric = () => {
    const w = parseFloat(weight);
    const d = parseFloat(recommendedDose);
    const freq = parseInt(frequency);
    if (!w || !d) return;

    const totalDaily = w * d;
    const perDose = totalDaily / freq;

    setResult({
      value: `${perDose.toFixed(2)} mg per dose`,
      formula: "Total Daily Dose = Weight (kg) * Recommended Dose (mg/kg/day); Per Dose = Total Daily / Frequency",
      details: `Total Daily Dose: ${totalDaily.toFixed(2)} mg/day (split into ${freq} administrations)`
    });
  };

  const calculateIVFlow = () => {
    const vol = parseFloat(volume);
    const t = parseFloat(time);
    const df = parseFloat(dropFactor);
    if (!vol || !t || !df) return;

    // Convert time to minutes if hours
    const timeMinutes = timeUnit === "hours" ? t * 60 : t;
    
    // Flow Rate (drops/min) = (Volume in mL * Drop Factor) / Time in minutes
    const flowRate = (vol * df) / timeMinutes;

    setResult({
      value: `${Math.round(flowRate)} drops/min (gtts/min)`,
      formula: "Flow Rate (drops/min) = [ Volume (mL) * Drop Factor (gtts/mL) ] / Time (minutes)",
      details: `Total Duration: ${timeMinutes} minutes`
    });
  };

  const calculateInfusionRate = () => {
    const vol = parseFloat(volume);
    const t = parseFloat(time);
    if (!vol || !t) return;

    const rate = vol / t;

    setResult({
      value: `${rate.toFixed(2)} mL/hour`,
      formula: "Infusion Rate (mL/hr) = Volume (mL) / Time (hours)",
      details: "Ideal for programming clinical IV infusion pumps."
    });
  };

  const calculateDoseWeight = () => {
    const w = parseFloat(weight);
    const d = parseFloat(recommendedDose);
    if (!w || !d) return;

    const totalDose = w * d;

    setResult({
      value: `${totalDose.toFixed(2)} mg`,
      formula: "Dose (mg) = Patient Weight (kg) * Concentration (mg/kg)",
      details: "Standard calculation for weight-based medication loading doses."
    });
  };

  const calculateUnitConverter = () => {
    const val = parseFloat(convVal);
    if (isNaN(val)) return;

    let resVal = 0;
    let label = "";
    switch (convType) {
      case "lb_kg":
        resVal = val * 0.453592;
        label = "kg";
        break;
      case "kg_lb":
        resVal = val / 0.453592;
        label = "lbs";
        break;
      case "mg_mcg":
        resVal = val * 1000;
        label = "mcg";
        break;
      case "mcg_mg":
        resVal = val / 1000;
        label = "mg";
        break;
      case "ml_l":
        resVal = val / 1000;
        label = "L";
        break;
      case "l_ml":
        resVal = val * 1000;
        label = "mL";
        break;
      case "in_cm":
        resVal = val * 2.54;
        label = "cm";
        break;
      case "cm_in":
        resVal = val / 2.54;
        label = "inches";
        break;
    }

    setResult({
      value: `${resVal.toFixed(4)} ${label}`,
      formula: `Unit conversion factors: 1 kg = 2.2046 lbs, 1 mg = 1000 mcg, 1 L = 1000 mL, 1 in = 2.54 cm`,
      details: `Converted from ${val} source unit.`
    });
  };

  // Main selector mapping
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (activeTool) {
      case "bmi":
        calculateBMI();
        break;
      case "bsa":
        calculateBSA();
        break;
      case "crcl":
        calculateCrCl();
        break;
      case "ibw":
        calculateIBW();
        break;
      case "pediatric":
        calculatePediatric();
        break;
      case "iv_flow":
        calculateIVFlow();
        break;
      case "infusion_rate":
        calculateInfusionRate();
        break;
      case "dose_weight":
        calculateDoseWeight();
        break;
      case "unit_converter":
        calculateUnitConverter();
        break;
    }
  };

  const menuItems: { id: ToolType; name: string; icon: React.ReactNode }[] = [
    { id: "bmi", name: "BMI Calculator", icon: <Scale className="w-4 h-4" /> },
    { id: "bsa", name: "BSA Calculator", icon: <Activity className="w-4 h-4" /> },
    { id: "crcl", name: "Creatinine Clearance", icon: <Layers className="w-4 h-4" /> },
    { id: "ibw", name: "Ideal Body Weight", icon: <Flame className="w-4 h-4" /> },
    { id: "pediatric", name: "Pediatric Dosing", icon: <Sparkles className="w-4 h-4" /> },
    { id: "iv_flow", name: "IV Flow Rate", icon: <Droplet className="w-4 h-4" /> },
    { id: "infusion_rate", name: "Infusion Rate", icon: <Clock className="w-4 h-4" /> },
    { id: "dose_weight", name: "Dose by Weight", icon: <Scale className="w-4 h-4" /> },
    { id: "unit_converter", name: "Unit Converter", icon: <Calculator className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <main className="flex-grow pt-20 sm:pt-28 pb-16 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
              <Calculator className="w-3.5 h-3.5" />
              <span>Diagnostic Pharmacy Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Calculators &amp; Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Verify dosage volumes, body indexes, and chemical parameters instantly using medical math formulas.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Left Sidebar Menu */}
            <aside className="md:col-span-1 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTool(item.id); resetFields(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all border ${
                    activeTool === item.id
                      ? "bg-cyan-500 border-cyan-500 text-white shadow-xs"
                      : "bg-white border-slate-200/50 hover:bg-slate-50 text-slate-650"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </aside>

            {/* Right Form Card Panel */}
            <section className="md:col-span-3 space-y-6">
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-550" />
                  <span>{menuItems.find(m => m.id === activeTool)?.name}</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* BMI & BSA inputs */}
                  {(activeTool === "bmi" || activeTool === "bsa" || activeTool === "crcl" || activeTool === "ibw" || activeTool === "pediatric" || activeTool === "dose_weight") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Weight (excluding IBW) */}
                      {activeTool !== "ibw" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Patient Weight (kg)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 70"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                          />
                        </div>
                      )}

                      {/* Height (excluding Pediatric / Dose by weight) */}
                      {activeTool !== "pediatric" && activeTool !== "dose_weight" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Height (cm)</label>
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 175"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cockcroft Gault unique inputs */}
                  {activeTool === "crcl" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Age (Years)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 45"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Serum Creatinine (mg/dL)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="e.g. 0.9"
                          value={serumCreatinine}
                          onChange={(e) => setSerumCreatinine(e.target.value)}
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gender Selector for CrCl & IBW */}
                  {(activeTool === "crcl" || activeTool === "ibw") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Biological Gender</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "male"}
                            onChange={() => setGender("male")}
                            className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Male</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "female"}
                            onChange={() => setGender("female")}
                            className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Female</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Pediatric / weight dosing unique inputs */}
                  {(activeTool === "pediatric" || activeTool === "dose_weight") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Recommended Dose (mg/kg)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="e.g. 15"
                          value={recommendedDose}
                          onChange={(e) => setRecommendedDose(e.target.value)}
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                        />
                      </div>

                      {activeTool === "pediatric" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Frequency (Daily Administrations)</label>
                          <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                          >
                            <option value="1">Once Daily (QD / q24h)</option>
                            <option value="2">Twice Daily (BID / q12h)</option>
                            <option value="3">Thrice Daily (TID / q8h)</option>
                            <option value="4">Four Times Daily (QID / q6h)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* IV rates unique inputs */}
                  {(activeTool === "iv_flow" || activeTool === "infusion_rate") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Total Volume (mL)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 500"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Infusion Time</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 8"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                            />
                          </div>
                          {activeTool === "iv_flow" && (
                            <div>
                              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Unit</label>
                              <select
                                value={timeUnit}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeUnit(e.target.value as "hours" | "minutes")}
                                className="block w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold cursor-pointer"
                              >
                                <option value="hours">Hours</option>
                                <option value="minutes">Minutes</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {activeTool === "iv_flow" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Drop Factor (drops/mL)</label>
                          <select
                            value={dropFactor}
                            onChange={(e) => setDropFactor(e.target.value)}
                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                          >
                            <option value="10">10 drops/mL (Macrodrip - blood, thick solutions)</option>
                            <option value="15">15 drops/mL (Macrodrip - standard solutions)</option>
                            <option value="20">20 drops/mL (Macrodrip - standard solutions)</option>
                            <option value="60">60 drops/mL (Microdrip - pediatric/critical drugs)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unit converter unique inputs */}
                  {activeTool === "unit_converter" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Source Value</label>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="Enter number..."
                          value={convVal}
                          onChange={(e) => setConvVal(e.target.value)}
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Conversion Type</label>
                        <select
                          value={convType}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConvType(e.target.value as "lb_kg" | "kg_lb" | "mg_mcg" | "mcg_mg" | "ml_l" | "l_ml" | "in_cm" | "cm_in")}
                          className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                        >
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

                  {/* Submission Row */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetFields}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Fields</span>
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-650 text-white font-bold rounded-xl text-xs transition-all hover:-translate-y-0.5 shadow-sm active:translate-y-0 flex items-center gap-1.5"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Calculate</span>
                    </button>
                  </div>

                </form>

                {/* Calculation Outputs */}
                {result && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calculation Result</p>
                      <p className="text-xl sm:text-2xl font-black text-cyan-600 mt-1">{result.value}</p>
                    </div>

                    {result.details && (
                      <p className="text-xs text-slate-650 font-semibold">{result.details}</p>
                    )}

                    <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-1.5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Formula Applied</p>
                      <p className="text-xs text-slate-700 font-mono font-bold leading-normal">{result.formula}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Disclaimer */}
              <div className="bg-slate-150/40 border border-slate-200/50 p-5 rounded-3xl text-[10px] text-slate-450 leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-650 uppercase tracking-wider">Clinical Calculator Disclaimer</p>
                  <p>
                    These calculators are provided solely as academic verification resources for pharmacy students. All calculations must be independently reviewed and approved by certified medical practitioners before clinical dosing implementations. Do not use these results as direct treatment mandates.
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
