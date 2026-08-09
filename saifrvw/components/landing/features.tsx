"use client";
import { motion } from "framer-motion";
import { Shield, Bug, Zap, BarChart3, Wrench, GitBranch } from "lucide-react";

const features = [
  { icon: Shield, title: "AI Code Review", description: "Intelligent analysis that identifies bugs, security risks, and code smells across your entire codebase." },
  { icon: Bug, title: "Security Analysis", description: "Detect SQL injection, XSS, hardcoded secrets, and other critical security vulnerabilities." },
  { icon: Zap, title: "Performance Insights", description: "Spot inefficient patterns, unnecessary queries, and bottlenecks before they impact users." },
  { icon: BarChart3, title: "Quality Scoring", description: "Get an explainable overall score plus breakdowns for security, reliability, and maintainability." },
  { icon: Wrench, title: "Actionable Fixes", description: "Every finding includes a clear explanation and a suggested code fix you can apply immediately." },
  { icon: GitBranch, title: "Repository Analysis", description: "Connect GitHub repos or paste code directly. Support for JavaScript, TypeScript, Python, and more." },
];

export function Features() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-3">Built for developers</h2>
          <p className="text-[#8B958D] max-w-xl mx-auto">Everything you need to ship cleaner, more secure code.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="group p-6 bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl hover:border-[#7CFF9B]/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#7CFF9B]/10 border border-[#7CFF9B]/20 flex items-center justify-center mb-4 group-hover:bg-[#7CFF9B]/20 transition-colors">
                <feature.icon className="w-5 h-5 text-[#7CFF9B]" />
              </div>
              <h3 className="text-base font-semibold text-[#F2F5F2] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#8B958D] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
