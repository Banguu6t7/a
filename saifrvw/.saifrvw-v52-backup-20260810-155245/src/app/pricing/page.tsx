import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For learning, personal projects, and quick reviews.",
    features: [
      "Rule-based security analysis",
      "CWE + OWASP mappings",
      "Risk score and security grade",
      "Basic remediation guidance",
      "Limited AI assistant usage"
    ]
  },
  {
    name: "Pro",
    price: "$12",
    description: "For serious developers and security-focused teams.",
    features: [
      "Deeper security analysis",
      "Full security reports",
      "Advanced remediation workflows",
      "AI security assistant",
      "Priority analysis",
      "Export-ready reports"
    ]
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            SAIFRVW
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">
            Simple security pricing.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Start free. Upgrade when your security workflow needs deeper
            analysis, reports, and AI-assisted remediation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <section
              key={plan.name}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <h2 className="text-2xl font-bold">{plan.name}</h2>

              <div className="mt-5 text-5xl font-black">
                {plan.price}
                <span className="text-base font-normal text-gray-500">
                  {plan.name === "Pro" ? " / month" : ""}
                </span>
              </div>

              <p className="mt-4 text-gray-400">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm text-gray-300"
                  >
                    <span className="text-indigo-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/review"
                className="mt-8 block rounded-xl bg-indigo-500 px-5 py-3 text-center font-semibold transition hover:bg-indigo-400"
              >
                {plan.name === "Pro" ? "Start Pro workflow" : "Start free"}
              </Link>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
