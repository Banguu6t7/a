import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For experimenting with SAIFRVW.",
    features: ["50 reviews / month", "Static analysis", "Basic scoring", "Public docs"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious individual developers.",
    features: [
      "Unlimited local reviews",
      "AI-assisted analysis",
      "Repository reviews",
      "Advanced security rules",
      "Review history",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    description: "For teams shipping production software.",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Shared review history",
      "Custom rules",
      "Priority processing",
    ],
  },
];

export default function PricingPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl py-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#7CFF9B]">
            <Sparkles size={14} />
            Simple pricing
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Ship better code without the noise.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#8B958D]">
            Start free. Upgrade when your codebase needs deeper intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <Panel
              key={plan.name}
              className={`relative p-6 ${
                plan.featured
                  ? "border-[#7CFF9B]/30 shadow-[0_0_50px_rgba(124,255,155,0.05)]"
                  : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute right-5 top-5 rounded-full bg-[#7CFF9B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#7CFF9B]">
                  Popular
                </div>
              )}

              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-xs leading-5 text-[#56615A]">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-semibold">{plan.price}</span>
                {plan.price !== "$0" && (
                  <span className="text-xs text-[#56615A]"> / month</span>
                )}
              </div>

              <Link
                href="/review"
                className={`mt-6 flex items-center justify-center rounded-xl py-3 text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#7CFF9B] text-[#061008]"
                    : "border border-white/[0.08] text-[#F2F5F2]"
                }`}
              >
                Start reviewing
              </Link>

              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs text-[#8B958D]"
                  >
                    <Check size={14} className="text-[#7CFF9B]" />
                    {feature}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
