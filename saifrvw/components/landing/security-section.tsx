"use client";
import { motion } from "framer-motion";
import { Lock, EyeOff, Server, FileCheck } from "lucide-react";

const securityFeatures = [
  { icon: Lock, title: "No code execution", description: "We never run your code. All analysis is static and safe." },
  { icon: EyeOff, title: "No API keys in client", description: "AI requests happen server-side. Your credentials never reach the browser." },
  { icon: Server, title: "Input validation", description: "Strict validation, size limits, and SSRF protection on all inputs." },
  { icon: FileCheck, title: "Sanitized output", description: "All responses are sanitized before display to prevent injection." },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-32 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-4">Security-first by design</h2>
            <p className="text-[#8B958D] mb-8 leading-relaxed">Your code is valuable. We treat it with the care it deserves. SAIFRVW is built with security as a first-class feature, not an afterthought.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {securityFeatures.map((feat, i) => (
                <motion.div key={feat.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#7CFF9B]/10 border border-[#7CFF9B]/20 flex items-center justify-center shrink-0">
                    <feat.icon className="w-4 h-4 text-[#7CFF9B]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#F2F5F2]">{feat.title}</div>
                    <div className="text-xs text-[#8B958D] mt-0.5">{feat.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#7CFF9B] animate-pulse" />
              <span className="text-xs font-mono text-[#7CFF9B]">SECURITY SCAN ACTIVE</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#8B958D]"><span className="text-[#7CFF9B]">✓</span> Input validation passed</div>
              <div className="flex items-center gap-2 text-[#8B958D]"><span className="text-[#7CFF9B]">✓</span> No path traversal detected</div>
              <div className="flex items-center gap-2 text-[#8B958D]"><span className="text-[#7CFF9B]">✓</span> SSRF protection enabled</div>
              <div className="flex items-center gap-2 text-[#8B958D]"><span className="text-[#7CFF9B]">✓</span> Secrets not exposed in client</div>
              <div className="flex items-center gap-2 text-[#8B958D]"><span className="text-[#7CFF9B]">✓</span> Output sanitization active</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
