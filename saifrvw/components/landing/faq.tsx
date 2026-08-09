"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What languages does SAIFRVW support?", a: "Currently, SAIFRVW has enhanced static analysis for JavaScript, TypeScript, and Python. All other languages receive AI-based review when an AI provider is configured." },
  { q: "Is my code stored or shared?", a: "No. In demo mode, code is processed in-memory and never persisted. In production mode with a database, code is stored only if you explicitly save a review." },
  { q: "Can I use my own AI provider?", a: "Yes. SAIFRVW uses an abstraction layer. Set AI_API_KEY, AI_BASE_URL, and AI_MODEL environment variables to use any OpenAI-compatible API." },
  { q: "Is SAIFRVW a replacement for a security audit?", a: "No. SAIFRVW provides automated code analysis and should not be treated as a complete security audit. It is an assistant, not a guarantee." },
  { q: "Does it work without an AI API key?", a: "Yes. Demo mode provides deterministic sample analysis using built-in static analysis heuristics. It works immediately after npm install." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="py-20 lg:py-32 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-3">FAQ</h2>
          <p className="text-[#8B958D]">Common questions about SAIFRVW.</p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surface border border-[rgba(255,255,255,0.07)] rounded-lg overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-[#0F1411]/50 transition-colors">
                <span className="text-sm font-medium text-[#F2F5F2]">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#56615A] transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-4 pb-4 text-sm text-[#8B958D] leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
