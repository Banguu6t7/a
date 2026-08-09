"use client";
import { motion } from "framer-motion";
import { Upload, Brain, FileSearch, Rocket } from "lucide-react";

const steps = [
  { num: "01", icon: Upload, title: "Submit code", description: "Paste code, upload a project, or connect a GitHub repository." },
  { num: "02", icon: Brain, title: "SAIFRVW analyzes it", description: "Static analysis + AI reasoning scans every line for issues." },
  { num: "03", icon: FileSearch, title: "Review findings", description: "Browse issues by severity, category, and file with inline code viewer." },
  { num: "04", icon: Rocket, title: "Fix and ship", description: "Apply suggested fixes and deploy with confidence." },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-3">How it works</h2>
          <p className="text-[#8B958D] max-w-xl mx-auto">From code to clean in four simple steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="relative">
              <div className="text-5xl font-bold text-[#7CFF9B]/10 mb-4">{step.num}</div>
              <div className="w-10 h-10 rounded-lg bg-surface border border-[rgba(255,255,255,0.07)] flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-[#7CFF9B]" />
              </div>
              <h3 className="text-base font-semibold text-[#F2F5F2] mb-2">{step.title}</h3>
              <p className="text-sm text-[#8B958D] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
