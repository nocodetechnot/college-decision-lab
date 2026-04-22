'use client';
import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, Trash2, Calculator } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ResponsiveContainerAny = ResponsiveContainer as any;
const BarChartAny = BarChart as any;
const BarAny = Bar as any;
const XAxisAny = XAxis as any;
const YAxisAny = YAxis as any;
const TooltipAny = Tooltip as any;
const RadarChartAny = RadarChart as any;
const PolarGridAny = PolarGrid as any;
const PolarAngleAxisAny = PolarAngleAxis as any;
const PolarRadiusAxisAny = PolarRadiusAxis as any;
const RadarAny = Radar as any;
const LegendAny = Legend as any;

type Criterion = {
  id: string;
  name: string;
  description: string;
  weight: number;
};

type College = {
  id: string;
  name: string;
  notes: string;
};

type Scores = Record<string, Record<string, number | "">>;

type ScenarioKey = "policy" | "econ" | "mba" | "custom";

const uid = () => Math.random().toString(36).slice(2, 10);

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1.2,
  textAlign: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#0f172a",
  color: "#ffffff",
  border: "1px solid #0f172a",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  caretColor: "#0f172a",
  fontSize: 14,
  boxSizing: "border-box",
  WebkitTextFillColor: "#0f172a",
  appearance: "none",
  colorScheme: "light",
  opacity: 1,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
  fontFamily: "inherit",
  lineHeight: 1.4,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: 36,
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #475569 50%), linear-gradient(135deg, #475569 50%, transparent 50%)",
  backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)",
  backgroundSize: "6px 6px, 6px 6px",
  backgroundRepeat: "no-repeat",
};

const smallLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  color: "#0f172a",
};

const teachingTips = [
  {
    title: "How weights work",
    body: "Weights express importance. If one criterion matters twice as much as another, give it about twice the raw weight. The app normalizes the weights for you.",
  },
  {
    title: "How scoring works",
    body: "Each school gets a score on each criterion, usually from 1 to 10. Higher means better on that specific criterion.",
  },
  {
    title: "What the total means",
    body: "The final score is a weighted average. It reflects your priorities, not a universal truth. Change the weights and the ranking may change.",
  },
  {
    title: "Why scenario testing matters",
    body: "Run the tool under more than one scenario. A school that wins only under one narrow set of assumptions may be less robust than one that stays near the top across scenarios.",
  },
];

const initialColleges: College[] = [
  { id: uid(), name: "George Washington University", notes: "Strong DC policy ecosystem" },
  { id: uid(), name: "Boston University", notes: "Balanced academics and city access" },
  { id: uid(), name: "Northeastern University", notes: "Structured co-op path" },
  { id: uid(), name: "Tulane University", notes: "Strong overall experience" },
  { id: uid(), name: "Georgia Tech", notes: "Quantitative strength" },
  { id: uid(), name: "UC Davis", notes: "Strong research university" },
  { id: uid(), name: "University of Georgia", notes: "Solid traditional option" },
  { id: uid(), name: "University of San Francisco", notes: "Urban environment" },
];

const initialCriteria: Criterion[] = [
  { id: uid(), name: "Academic Fit", description: "How well the school matches your academic interests and learning style.", weight: 10 },
  { id: uid(), name: "Economics Strength", description: "Depth, rigor, and quality of economics training.", weight: 9 },
  { id: uid(), name: "International Policy Strength", description: "Access to policy, global affairs, and international systems coursework.", weight: 10 },
  { id: uid(), name: "Internship Access", description: "Ease of getting meaningful internships during school.", weight: 9 },
  { id: uid(), name: "Career Outcomes", description: "Placement strength for jobs, grad school, and long-term trajectory.", weight: 8 },
  { id: uid(), name: "Cost and Aid", description: "Overall affordability after aid and scholarships.", weight: 8 },
  { id: uid(), name: "Campus and City Fit", description: "How well the campus and surrounding city fit your preferences.", weight: 7 },
  { id: uid(), name: "Flexibility", description: "Room to change direction if your interests evolve.", weight: 7 },
];

const scenarioTemplates: Record<Exclude<ScenarioKey, "custom">, Record<string, number>> = {
  policy: {
    "Academic Fit": 9,
    "Economics Strength": 8,
    "International Policy Strength": 10,
    "Internship Access": 10,
    "Career Outcomes": 8,
    "Cost and Aid": 7,
    "Campus and City Fit": 7,
    Flexibility: 6,
  },
  econ: {
    "Academic Fit": 9,
    "Economics Strength": 10,
    "International Policy Strength": 4,
    "Internship Access": 5,
    "Career Outcomes": 8,
    "Cost and Aid": 7,
    "Campus and City Fit": 5,
    Flexibility: 6,
  },
  mba: {
    "Academic Fit": 8,
    "Economics Strength": 9,
    "International Policy Strength": 5,
    "Internship Access": 8,
    "Career Outcomes": 10,
    "Cost and Aid": 8,
    "Campus and City Fit": 6,
    Flexibility: 9,
  },
};

function buildInitialScores(colleges: College[], criteria: Criterion[]): Scores {
  const out: Scores = {};
  colleges.forEach((college) => {
    out[college.id] = {};
    criteria.forEach((criterion) => {
      out[college.id][criterion.id] = "";
    });
  });
  return out;
}

function SectionCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          padding: 20,
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{title}</div>
          {subtitle ? <div style={{ marginTop: 6, fontSize: 14, color: "#475569" }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: "100%", height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          background: "#0f172a",
        }}
      />
    </div>
  );
}

function ScenarioSelect({ value, onChange }: { value: ScenarioKey; onChange: (v: ScenarioKey) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as ScenarioKey)} style={selectStyle}>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="policy">Policy Focus</option>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="econ">Wonky Economics</option>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="mba">Economics then MBA</option>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="custom">Custom</option>
    </select>
  );
}



function ScaleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="5">5</option>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="10">10</option>
      <option style={{ color: "#0f172a", background: "#ffffff" }} value="100">100</option>
    </select>
  );
}

export default function CollegeDecisionWebApp() {
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [activeTab, setActiveTab] = useState<"weights" | "scores" | "results" | "notes">("weights");
  const [scenario, setScenario] = useState<ScenarioKey>("policy");
  const [studentName, setStudentName] = useState("Anjola");
  const [decisionGoal, setDecisionGoal] = useState(
    "Choose the best undergraduate environment for economics, international policy, or a flexible path into future graduate study."
  );
  const [scoreScale, setScoreScale] = useState("10");
  const [colleges, setColleges] = useState<College[]>(initialColleges);
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [scores, setScores] = useState<Scores>(() => buildInitialScores(initialColleges, initialCriteria));
  const [notes, setNotes] = useState(
    "Use this tool to compare colleges deliberately. Numbers help structure the choice. They do not replace judgment."
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);

    const saved = window.localStorage.getItem("college-decision-app-state-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScenario(parsed.scenario ?? "policy");
        setStudentName(parsed.studentName ?? "Anjola");
        setDecisionGoal(
          parsed.decisionGoal ??
            "Choose the best undergraduate environment for economics, international policy, or a flexible path into future graduate study."
        );
        setScoreScale(parsed.scoreScale ?? "10");
        setColleges(parsed.colleges ?? initialColleges);
        setCriteria(parsed.criteria ?? initialCriteria);
        setScores(parsed.scores ?? buildInitialScores(initialColleges, initialCriteria));
        setNotes(parsed.notes ?? "Use this tool to compare colleges deliberately. Numbers help structure the choice. They do not replace judgment.");
      } catch {
        // Ignore malformed local storage.
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "college-decision-app-state-v1",
      JSON.stringify({ scenario, studentName, decisionGoal, scoreScale, colleges, criteria, scores, notes })
    );
  }, [scenario, studentName, decisionGoal, scoreScale, colleges, criteria, scores, notes]);

  const scaleMax = Number(scoreScale) || 10;
  const isNarrow = viewportWidth < 768;
  const isMedium = viewportWidth >= 768 && viewportWidth < 1080;

  const normalizedWeights = useMemo(() => {
    const total = criteria.reduce((sum, c) => sum + Math.max(0, Number(c.weight) || 0), 0);
    return criteria.map((c) => ({
      ...c,
      normalizedWeight: total > 0 ? (Math.max(0, Number(c.weight) || 0) / total) : 0,
    }));
  }, [criteria]);

  const results = useMemo(() => {
    const rows = colleges.map((college) => {
      let total = 0;
      let completed = 0;

      normalizedWeights.forEach((criterion) => {
        const raw = scores[college.id]?.[criterion.id];
        const numeric = raw === "" ? null : Number(raw);
        if (numeric !== null && !Number.isNaN(numeric)) {
          total += numeric * criterion.normalizedWeight;
          completed += 1;
        }
      });

      const completeness = criteria.length ? Math.round((completed / criteria.length) * 100) : 0;
      return {
        college,
        total: Number(total.toFixed(3)),
        completed,
        completeness,
      };
    });

    return rows.sort((a, b) => b.total - a.total).map((row, index) => ({ ...row, rank: index + 1 }));
  }, [colleges, criteria.length, normalizedWeights, scores]);

  const topChoice = results[0];

  const formulaText =
    "Final Score = Σ (Normalized Weight × Criterion Score), where Normalized Weight = Raw Weight ÷ Sum of All Raw Weights.";

  const barData = results.map((r) => ({
    name: r.college.name.length > 18 ? `${r.college.name.slice(0, 18)}…` : r.college.name,
    score: r.total,
  }));

  const radarData = normalizedWeights.map((criterion) => {
    const obj: Record<string, string | number> = { criterion: criterion.name };
    results.slice(0, 3).forEach((result) => {
      const value = scores[result.college.id]?.[criterion.id];
      obj[result.college.name] = value === "" ? 0 : Number(value);
    });
    return obj;
  });

  function setScenarioWeights(nextScenario: ScenarioKey) {
    setScenario(nextScenario);
    if (nextScenario === "custom") return;

    const template = scenarioTemplates[nextScenario];
    setCriteria((prev) => prev.map((criterion) => ({ ...criterion, weight: template[criterion.name] ?? criterion.weight })));
  }

  function updateCriterion(id: string, patch: Partial<Criterion>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updateCollege(id: string, patch: Partial<College>) {
    setColleges((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updateScore(collegeId: string, criterionId: string, value: string) {
    const cleaned = value === "" ? "" : Math.max(0, Math.min(scaleMax, Number.isNaN(Number(value)) ? 0 : Number(value)));

    setScores((prev) => ({
      ...prev,
      [collegeId]: {
        ...(prev[collegeId] ?? {}),
        [criterionId]: cleaned === "" ? "" : cleaned,
      },
    }));
  }

  function addCriterion() {
    const newCriterion: Criterion = {
      id: uid(),
      name: `New Criterion ${criteria.length + 1}`,
      description: "Describe why this criterion matters.",
      weight: 5,
    };

    setCriteria((prev) => [...prev, newCriterion]);
    setScores((prev) => {
      const next = { ...prev };
      colleges.forEach((college) => {
        next[college.id] = { ...(next[college.id] ?? {}), [newCriterion.id]: "" };
      });
      return next;
    });
    setScenario("custom");
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setScores((prev) => {
      const next: Scores = {};
      Object.entries(prev).forEach(([collegeId, row]) => {
        const { [id]: _removed, ...rest } = row;
        next[collegeId] = rest;
      });
      return next;
    });
    setScenario("custom");
  }

  function addCollege() {
    const newCollege: College = {
      id: uid(),
      name: `New College ${colleges.length + 1}`,
      notes: "",
    };

    setColleges((prev) => [...prev, newCollege]);
    setScores((prev) => ({
      ...prev,
      [newCollege.id]: Object.fromEntries(criteria.map((criterion) => [criterion.id, ""])),
    }));
  }

  function removeCollege(id: string) {
    setColleges((prev) => prev.filter((c) => c.id !== id));
    setScores((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function resetAll() {
    setScenario("policy");
    setStudentName("Anjola");
    setDecisionGoal("Choose the best undergraduate environment for economics, international policy, or a flexible path into future graduate study.");
    setScoreScale("10");
    setColleges(initialColleges);
    setCriteria(initialCriteria);
    setScores(buildInitialScores(initialColleges, initialCriteria));
    setNotes("Use this tool to compare colleges deliberately. Numbers help structure the choice. They do not replace judgment.");
  }

  function exportPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(18);
    doc.text(`${studentName} College Decision Report`, 40, 40);
    doc.setFontSize(11);
    doc.text(`Decision Goal: ${decisionGoal}`, 40, 62, { maxWidth: 500 });
    doc.text(`Formula: ${formulaText}`, 40, 88, { maxWidth: 500 });
    doc.text(`Scenario: ${scenario.toUpperCase()}`, 40, 114);

    autoTable(doc, {
      startY: 138,
      head: [["Rank", "College", "Final Score", "Completion", "Notes"]],
      body: results.map((r) => [String(r.rank), r.college.name, r.total.toFixed(3), `${r.completeness}%`, r.college.notes || ""]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Criterion", "Raw Weight", "Normalized Weight", "Description"]],
      body: normalizedWeights.map((c) => [c.name, String(c.weight), c.normalizedWeight.toFixed(3), c.description]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["School", ...criteria.map((c) => c.name)]],
      body: colleges.map((college) => [
        college.name,
        ...criteria.map((criterion) => {
          const value = scores[college.id]?.[criterion.id];
          return value === "" ? "" : String(value);
        }),
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59] },
      horizontalPageBreak: true,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(11);
    doc.text("Notes", 40, finalY);
    doc.text(notes, 40, finalY + 18, { maxWidth: 500 });
    doc.save(`${studentName.toLowerCase().replace(/\s+/g, "-")}-college-decision-report.pdf`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: isNarrow ? 14 : 24, fontFamily: "Arial, Helvetica, sans-serif", colorScheme: "light" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 24, width: "100%" }}>
        <SectionCard
          title="College Decision Lab"
          subtitle="A weighted decision tool with transparent math, teaching prompts, and PDF export."
          right={
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: isNarrow ? "100%" : undefined }}>
              <button onClick={exportPdf} style={{ ...primaryButtonStyle, flex: isNarrow ? "1 1 100%" : "0 0 auto", justifyContent: "center" }}>
                <Download size={16} />
                Export PDF
              </button>
              <button onClick={resetAll} style={{ ...buttonStyle, flex: isNarrow ? "1 1 100%" : "0 0 auto", justifyContent: "center" }}>
                Reset
              </button>
            </div>
          }
        >
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isNarrow ? "1fr" : isMedium ? "1fr 1fr" : "1fr 1fr 1fr",
            }}
          >
            <div>
              <label style={smallLabelStyle}>Student Name</label>
              <input value={studentName} onChange={(e) => setStudentName(e.target.value)} style={inputStyle} autoComplete="off" spellCheck={false} />
            </div>
            <div>
              <label style={smallLabelStyle}>Decision Scenario</label>
              <ScenarioSelect value={scenario} onChange={setScenarioWeights} />
            </div>
            <div>
              <label style={smallLabelStyle}>Score Scale Max</label>
              <ScaleSelect value={scoreScale} onChange={setScoreScale} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={smallLabelStyle}>Decision Goal</label>
            <textarea value={decisionGoal} onChange={(e) => setDecisionGoal(e.target.value)} style={textareaStyle} rows={3} spellCheck={false} />
          </div>

          <div
            style={{
              marginTop: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              background: "#f1f5f9",
              padding: 16,
              fontSize: 14,
              color: "#334155",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <Calculator size={16} />
              Formula shown on the UI
            </div>
            <div>{formulaText}</div>
          </div>
        </SectionCard>

        <div style={{ ...cardStyle, padding: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          {[
            ["weights", "Criteria and Weights"],
            ["scores", "Score Matrix"],
            ["results", "Results"],
            ["notes", "Notes and Report"],
          ].map(([key, label]) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                style={{
                  ...buttonStyle,
                  background: isActive ? "#0f172a" : "#ffffff",
                  color: isActive ? "#ffffff" : "#0f172a",
                  border: isActive ? "1px solid #0f172a" : "1px solid #cbd5e1",
                  flex: isNarrow ? "1 1 100%" : "1 1 220px",
                  justifyContent: "center",
                  whiteSpace: "normal",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "weights" && (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
            <SectionCard title="Teaching Panel" subtitle="This section explains the model so the user learns while deciding.">
              <div style={{ display: "grid", gap: 12 }}>
                {teachingTips.map((tip, idx) => (
                  <details key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#fff" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: "#0f172a" }}>{tip.title}</summary>
                    <div style={{ marginTop: 10, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{tip.body}</div>
                  </details>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Criteria and Weights"
              subtitle="Use any positive numbers. The app normalizes them automatically."
              right={
                <button onClick={addCriterion} style={{ ...buttonStyle, width: isNarrow ? "100%" : undefined, justifyContent: "center" }}>
                  <Plus size={16} />
                  Add Criterion
                </button>
              }
            >
              <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
                <div style={{ display: "grid", gap: 16 }}>
                  {normalizedWeights.map((criterion) => (
                    <div key={criterion.id} style={{ border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div
                        style={{
                          display: "grid",
                          gap: 16,
                          gridTemplateColumns: isNarrow ? "1fr" : isMedium ? "minmax(0, 1fr) 120px 120px" : "minmax(0, 1fr) 120px 120px auto",
                        }}
                      >
                        <div>
                          <label style={smallLabelStyle}>Criterion Name</label>
                          <input
                            value={criterion.name}
                            onChange={(e) => {
                              updateCriterion(criterion.id, { name: e.target.value });
                              setScenario("custom");
                            }}
                            style={inputStyle}
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <div style={{ marginTop: 10 }}>
                            <label style={smallLabelStyle}>Description</label>
                            <textarea
                              value={criterion.description}
                              onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                              style={textareaStyle}
                              rows={2}
                              spellCheck={false}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={smallLabelStyle}>Raw Weight</label>
                          <input
                            type="number"
                            min={0}
                            value={criterion.weight}
                            onChange={(e) => {
                              updateCriterion(criterion.id, { weight: Number(e.target.value) });
                              setScenario("custom");
                            }}
                            style={inputStyle}
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label style={smallLabelStyle}>Normalized</label>
                          <div style={{ ...inputStyle, background: "#f8fafc", fontWeight: 600 }}>{criterion.normalizedWeight.toFixed(3)}</div>
                          <div style={{ marginTop: 10 }}>
                            <ProgressBar value={criterion.normalizedWeight * 100} />
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: isNarrow ? "flex-start" : "flex-end", alignItems: "flex-start", paddingTop: isNarrow ? 0 : 28 }}>
                          <button onClick={() => removeCriterion(criterion.id)} style={{ ...buttonStyle, color: "#dc2626" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ ...cardStyle, padding: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Why normalized weights matter</div>
                  <div style={{ marginTop: 8, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
                    The raw values express preference. Normalization turns them into proportions that sum to 1.000.
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      background: "#f8fafc",
                      padding: 14,
                      fontSize: 14,
                      color: "#475569",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>Example</div>
                    <div style={{ marginTop: 8 }}>If Academic Fit = 8, Cost = 4, and Internship Access = 8, the total raw weight is 20.</div>
                    <div style={{ marginTop: 8 }}>Normalized weights become 0.400, 0.200, and 0.400.</div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 14, color: "#475569" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>Current total raw weight</div>
                    <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
                      {criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "scores" && (
          <SectionCard
            title="School Score Matrix"
            subtitle="Enter a score for each school on each criterion. Blank cells reduce completeness."
            right={
              <button onClick={addCollege} style={{ ...buttonStyle, width: isNarrow ? "100%" : undefined, justifyContent: "center" }}>
                <Plus size={16} />
                Add College
              </button>
            }
          >
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" }}>
              <table style={{ width: "100%", minWidth: 960, borderCollapse: "collapse", fontSize: 14, color: "#0f172a" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0", minWidth: 220, color: "#0f172a", background: "#ffffff" }}>School</th>
                    {criteria.map((criterion) => (
                      <th key={criterion.id} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0", minWidth: 150, color: "#0f172a", background: "#ffffff" }}>
                        {criterion.name}
                      </th>
                    ))}
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0", minWidth: 220, color: "#0f172a", background: "#ffffff" }}>School Notes</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0", color: "#0f172a", background: "#ffffff" }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr key={college.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", verticalAlign: "top", color: "#0f172a", background: "#ffffff" }}>
                        <input value={college.name} onChange={(e) => updateCollege(college.id, { name: e.target.value })} style={inputStyle} autoComplete="off" spellCheck={false} />
                      </td>
                      {criteria.map((criterion) => (
                        <td key={`${college.id}-${criterion.id}`} style={{ padding: 10, borderBottom: "1px solid #f1f5f9", verticalAlign: "top", color: "#0f172a", background: "#ffffff" }}>
                          <input
                            type="number"
                            min={0}
                            max={scaleMax}
                            value={scores[college.id]?.[criterion.id] ?? ""}
                            onChange={(e) => updateScore(college.id, criterion.id, e.target.value)}
                            style={inputStyle}
                            inputMode="numeric"
                          />
                        </td>
                      ))}
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", verticalAlign: "top", color: "#0f172a", background: "#ffffff" }}>
                        <input value={college.notes} onChange={(e) => updateCollege(college.id, { notes: e.target.value })} style={inputStyle} autoComplete="off" spellCheck={false} />
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", verticalAlign: "top", color: "#0f172a", background: "#ffffff" }}>
                        <button onClick={() => removeCollege(college.id)} style={{ ...buttonStyle, color: "#dc2626" }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === "results" && (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
            <SectionCard title="Ranked Results" subtitle="The numbers below reflect the current weights and current scores.">
              <div style={{ display: "grid", gap: 12 }}>
                {results.map((result) => (
                  <div
                    key={result.college.id}
                    style={{
                      display: "flex",
                      alignItems: isNarrow ? "flex-start" : "center",
                      flexDirection: isNarrow ? "column" : "row",
                      justifyContent: "space-between",
                      gap: 12,
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: result.rank === 1 ? "#0f172a" : "#e2e8f0",
                            color: result.rank === 1 ? "#fff" : "#0f172a",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          #{result.rank}
                        </span>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{result.college.name}</div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>Completeness: {result.completeness}%</div>
                    </div>
                    <div style={{ textAlign: isNarrow ? "left" : "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{result.total.toFixed(3)}</div>
                      {result.rank === 1 ? <div style={{ fontSize: 13, color: "#059669" }}>Current leader</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Interpretation" subtitle="A score is useful when you understand what created it.">
              <div style={{ display: "grid", gap: 10, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Top choice:</span> {topChoice?.college.name || "N/A"}
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Why:</span> This school currently aligns best with the weighted criteria and scores you entered.
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Pedagogical prompt:</span> Change one major weight by 30 to 50 percent and see whether the winner changes. If the winner stays the same, the decision is more robust.
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Overall Score Chart">
              <div style={{ width: "100%", height: isNarrow ? 280 : 360, minHeight: 240 }}>
                <ResponsiveContainerAny width="100%" height="100%">
                  <BarChartAny data={barData}>
                    <XAxisAny dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={isNarrow ? -12 : -20} textAnchor="end" height={isNarrow ? 60 : 70} />
                    <YAxisAny />
                    <TooltipAny />
                    <BarAny dataKey="score" radius={[8, 8, 0, 0]} />
                  </BarChartAny>
                </ResponsiveContainerAny>
              </div>
            </SectionCard>

            <SectionCard title="Top 3 Criteria Profile" subtitle="Use this to see whether the leader wins broadly or only under a narrow profile.">
              <div style={{ width: "100%", height: isNarrow ? 320 : 400, minHeight: 260 }}>
                <ResponsiveContainerAny width="100%" height="100%">
                  <RadarChartAny outerRadius={isNarrow ? "62%" : "72%"} data={radarData}>
                    <PolarGridAny />
                    <PolarAngleAxisAny dataKey="criterion" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxisAny domain={[0, scaleMax]} />
                    {results.slice(0, 3).map((result, idx) => (
                      <RadarAny key={result.college.id} name={result.college.name} dataKey={result.college.name} fillOpacity={0.18 + idx * 0.06} />
                    ))}
                    <LegendAny />
                  </RadarChartAny>
                </ResponsiveContainerAny>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "notes" && (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
            <SectionCard title="Report Notes" subtitle="These notes will appear in the exported PDF.">
              <textarea rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...textareaStyle, minHeight: 220 }} spellCheck={false} />
            </SectionCard>

            <SectionCard title="Suggested workflow" subtitle="Use the app in a disciplined order.">
              <div style={{ display: "grid", gap: 12, fontSize: 14, color: "#475569" }}>
                {[
                  ["Step 1", "Choose a scenario or build a custom one."],
                  ["Step 2", "Agree on raw weights before entering school scores."],
                  ["Step 3", "Score each school honestly. Avoid giving every top school a 9 or 10 on every criterion."],
                  ["Step 4", "Review the ranking, then stress test it by changing one major weight at a time."],
                  ["Step 5", "Export the PDF and discuss the result with both numbers and judgment in view."],
                ].map(([step, body]) => (
                  <div key={step} style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", padding: 14 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{step}</div>
                    <div style={{ marginTop: 6 }}>{body}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
