"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_CODE } from "@/lib/analysis/demo";
import { ShieldAlert, Bug, Zap, Wrench, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const demoFindings = [
  { id: "1", severity: "critical", category: "security", title: "SQL Injection", line: 10, description: "User input directly concatenated into SQL query without parameterization.", fix: "Use parameterized queries: db.query(query, [username, password, email, role])" },
  { id: "2", severity: "high", category: "security", title: "Missing Authorization", line: 4, description: "No role verification before creating users with arbitrary roles.", fix: "Add RBAC check: if (!isAdmin(req)) return 403" },
  { id: "3", severity: "high", category: "bug", title: "Missing Input Validation", line: 4, description: "No validation on user inputs before database operations.", fix: "Use Zod schema: const body = schema.parse(await req.json())" },
  { id: "4", severity: "medium", category: "performance", title: "console.log in Production", line: 14, description: "Debug logging should not be present in production code.", fix: "Remove console.log or use a structured logger" },
  { id: "5", severity: "low", category: "maintainability", title: "Use of var keyword", line: 9, description: "var has function scope issues. Use const or let instead.", fix: "Replace var with const" },
];

const severityConfig = {
  critical: { color: "text-[#FF4444]", bg: "bg-[#FF4444]/10", border: "border-[#FF4444]/20", icon: XCircle },
  high: { color: "text-[#FF8C42]", bg: "bg-[#FF8C42]/10", border: "border-[#FF8C42]/20", icon: AlertTriangle },
  medium: { color: "text-[#FFD93D]", bg: "bg-[#FFD93D]/10", border: "border-[#FFD93D]/20", icon: AlertTriangle },
  low: { color: "text-[#6BCBFF]", bg: "bg-[#6BCBFF]/10", border: "border-[#6BCBFF]/20", icon: Info },
  info: { color: "text-[#8B958D]", bg: "bg-[#8B958D]/10", border: "border-[#8B958D]/20", icon: Info },
};

const categoryIcons = { security: ShieldAlert, bug: Bug, performance: Zap, maintainability: Wrench };

export function CodeDemo() {
  const [selectedFinding, setSelectedFinding] = useState(demoFindings[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const lines = DEMO_CODE.split("\n");

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => { setIsAnalyzing(false); setShowResults(true); }, 2500);
  };

  const getLineSeverity = (lineNum: number) => demoFindings.find((f) => f.line === lineNum)?.severity;

  return (
    <section id="product" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-3">See it in action</h2>
          <p className="text-[#8B958D] max-w-xl mx-auto">Watch SAIFRVW analyze code and surface issues in real-time.</p>
        </div>
        <div className="max-w-5xl mx-auto">
          {!showResults && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <button onClick={handleAnalyze} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl hover:border-[#7CFF9B]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#7CFF9B]/10 flex items-center justify-center group-hover:bg-[#7CFF9B]/20 transition-colors">
                  <Sparkles className="w-5 h-5 text-[#7CFF9B]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[#F2F5F2]">Run demo analysis</div>
                  <div className="text-xs text-[#56615A]">Analyze auth.ts for issues</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#56615A] group-hover:text-[#7CFF9B] transition-colors" />
              </button>
            </motion.div>
          )}
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#7CFF9B]/20 border-t-[#7CFF9B] animate-spin" />
              <div className="text-[#F2F5F2] font-medium mb-2">Analyzing code...</div>
              <div className="flex items-center justify-center gap-4 text-xs text-[#56615A] flex-wrap">
                {["Scanning", "Parsing", "Security analysis", "Performance check", "AI reasoning"].map((step, i) => (
                  <motion.span key={step} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4, duration: 0.3 }} className="flex items-center gap-1">
                    {i < 4 ? <CheckCircle2 className="w-3 h-3 text-[#7CFF9B]" /> : <span className="w-3 h-3 rounded-full border border-[#7CFF9B]/30 border-t-[#7CFF9B] animate-spin" />}
                    {step}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {showResults && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[1fr,320px] gap-4">
                <div className="bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] bg-[#0F1411]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF4444]/60" />
                      <div className="w-3 h-3 rounded-full bg-[#FFD93D]/60" />
                      <div className="w-3 h-3 rounded-full bg-[#7CFF9B]/60" />
                    </div>
                    <span className="text-xs font-mono text-[#56615A]">auth.ts</span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="p-4 font-mono text-sm leading-relaxed">
                      {lines.map((line, i) => {
                        const lineNum = i + 1;
                        const severity = getLineSeverity(lineNum);
                        const isSelected = selectedFinding?.line === lineNum;
                        const config = severity ? severityConfig[severity as keyof typeof severityConfig] : null;
                        return (
                          <div key={i} className={cn("flex group", isSelected && config && `${config.bg} ${config.border} border-l-2`, !isSelected && "hover:bg-[#0F1411]/30")}>
                            <span className="w-10 text-right pr-3 text-[#56615A] text-xs select-none shrink-0 pt-0.5">{lineNum}</span>
                            <span className="flex-1 text-[#8B958D] whitespace-pre">{line || " "}</span>
                            {severity && config && <span className="w-6 flex items-center justify-center"><config.icon className={cn("w-3.5 h-3.5", config.color)} /></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[#56615A] uppercase tracking-wider mb-3">{demoFindings.length} issues found</div>
                  {demoFindings.map((finding) => {
                    const config = severityConfig[finding.severity as keyof typeof severityConfig];
                    const CatIcon = categoryIcons[finding.category as keyof typeof categoryIcons];
                    const isSelected = selectedFinding?.id === finding.id;
                    return (
                      <button key={finding.id} onClick={() => setSelectedFinding(finding)} className={cn("w-full text-left p-3 rounded-lg border transition-all duration-200", isSelected ? `${config.bg} ${config.border} border` : "bg-surface border-[rgba(255,255,255,0.07)] hover:border-[#8B958D]/20")}>
                        <div className="flex items-start gap-2">
                          <config.icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#F2F5F2] truncate">{finding.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded", config.bg, config.color)}>{finding.severity}</span>
                              <span className="text-[10px] text-[#56615A] flex items-center gap-1"><CatIcon className="w-3 h-3" />{finding.category}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {selectedFinding && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-[#0F1411] border border-[rgba(255,255,255,0.07)] rounded-lg">
                      <div className="text-sm font-medium text-[#F2F5F2] mb-2">{selectedFinding.title}</div>
                      <p className="text-xs text-[#8B958D] mb-3 leading-relaxed">{selectedFinding.description}</p>
                      <div className="bg-[#050706] rounded-md p-2.5 border border-[rgba(255,255,255,0.07)]">
                        <div className="text-[10px] text-[#56615A] uppercase tracking-wider mb-1">Suggested fix</div>
                        <code className="text-xs font-mono text-[#7CFF9B] block whitespace-pre-wrap">{selectedFinding.fix}</code>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
