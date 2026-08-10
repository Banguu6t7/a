import Link from "next/link";
import { Check, Shield, Sparkles } from "lucide-react";

const freeFeatures = [
  "Deep static analysis",
  "Core vulnerability detection",
  "Severity scoring",
  "CWE / OWASP mapping",
  "Basic remediation guidance",
  "Security report export",
];

const proFeatures = [
  "Everything in Free",
  "AI security assistant",
  "AI remediation generation",
  "Secure replacement suggestions",
  "Advanced security reports",
  "Scan history",
  "Priority analysis",
  "Higher scan limits",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <nav className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Shield className="h-5 w-5 text-indigo-400" />
            SAIFRVW
          </Link>

          <Link
            href="/review"
            className="text-sm text-gray-400 hover:text-white"
          >
            Analyzer
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Simple pricing
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            Security analysis for everyone.
          </h1>

          <p className="mt-5 text-gray-500">
            Start free. Upgrade when you need AI-powered remediation and
            advanced security workflows.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <Plan
            name="Free"
            price="$0"
            description="For learning, experimentation, and small projects."
            features={freeFeatures}
            href="/review"
          />

          <Plan
            name="Pro"
            price="$9"
            description="For developers who want deeper security assistance."
            features={proFeatures}
            href="/review"
            featured
          />
        </div>
      </div>
    </main>
  );
}

function Plan({
  name,
  price,
  description,
  features,
  href,
  featured,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-8 ${
        featured
          ? "border-indigo-500/40 bg-indigo-500/[0.06]"
          : "border-white/10 bg-[#101017]"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{name}</h2>

        {featured && (
          <span className="rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-bold">
            RECOMMENDED
          </span>
        )}
      </div>

      <div className="mt-7 flex items-end gap-2">
        <span className="text-5xl font-bold">{price}</span>
        {price !== "$0" && (
          <span className="mb-2 text-sm text-gray-500">/ month</span>
        )}
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-7 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
          featured
            ? "bg-indigo-500 hover:bg-indigo-600"
            : "border border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        {featured ? "Start Pro" : "Start Free"}
      </Link>

      <div className="mt-8 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex gap-3 text-sm text-gray-400"
          >
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}
