"use client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  { name: "Free", price: "$0", period: "forever", description: "Perfect for trying out SAIFRVW.", features: ["5 reviews per month", "Files up to 100KB", "Basic findings", "JavaScript & TypeScript", "Community support"], cta: "Get started", href: "/review/new", highlighted: false },
  { name: "Pro", price: "$19", period: "/month", description: "For individual developers who ship daily.", features: ["Unlimited reviews", "Files up to 1MB", "Advanced AI insights", "All languages", "Priority processing", "Export reports"], cta: "Start Pro trial", href: "/review/new", highlighted: true },
  { name: "Team", price: "$49", period: "/month", description: "For small engineering teams.", features: ["Everything in Pro", "Up to 10 team members", "Shared projects", "Team usage dashboard", "SSO ready", "Priority support"], cta: "Contact sales", href: "#", highlighted: false },
];

export function PricingSection() {
  return (
    <section className="py-20 lg:py-32 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F5F2] mb-3">Simple pricing</h2>
          <p className="text-[#8B958D] max-w-xl mx-auto">Start free. Upgrade when you need more power.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className={`relative p-6 rounded-xl border ${plan.highlighted ? "bg-[#0F1411] border-[#7CFF9B]/30" : "bg-surface border-[rgba(255,255,255,0.07)]"}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7CFF9B] text-[#050706] text-xs font-semibold rounded-full"><Zap className="w-3 h-3" /> Most popular</span>
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm font-medium text-[#8B958D]">{plan.name}</div>
                <div className="flex items-baseline gap-1 mt-1"><span className="text-3xl font-bold text-[#F2F5F2]">{plan.price}</span><span className="text-sm text-[#56615A]">{plan.period}</span></div>
                <p className="text-xs text-[#8B958D] mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-[#8B958D]"><Check className="w-4 h-4 text-[#7CFF9B] shrink-0" />{feat}</li>
                ))}
              </ul>
              <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full" asChild><Link href={plan.href}>{plan.cta}</Link></Button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-[#56615A] mt-8">Billing integration coming soon. All plans currently run in demo mode.</p>
      </div>
    </section>
  );
}
