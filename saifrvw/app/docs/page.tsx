import { BookOpen, Code2, ShieldCheck, Terminal } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

export default function DocsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#7CFF9B]">
            <BookOpen size={14} />
            Documentation
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Build with SAIFRVW.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8B958D]">
            Everything you need to understand the review pipeline and integrate
            code analysis into your workflow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Code2, "Code review", "Submit source and inspect findings."],
            [ShieldCheck, "Security", "Static security checks by default."],
            [Terminal, "API", "Automate analysis from your CI pipeline."],
          ].map(([Icon, title, description]) => (
            <Panel key={title as string} className="p-5">
              <Icon size={19} className="text-[#7CFF9B]" />
              <h2 className="mt-4 text-sm font-semibold">{title as string}</h2>
              <p className="mt-2 text-xs leading-5 text-[#56615A]">
                {description as string}
              </p>
            </Panel>
          ))}
        </div>

        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-white/[0.07] px-6 py-5">
            <h2 className="font-semibold">Analyze code with the API</h2>
            <p className="mt-1 text-xs text-[#56615A]">
              Send source code to the analysis endpoint.
            </p>
          </div>

          <pre className="overflow-x-auto bg-[#070A08] p-6 font-mono text-xs leading-6 text-[#8B958D]">
{`curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "filename": "example.ts",
    "code": "const query = userInput;"
  }'`}
          </pre>
        </Panel>
      </div>
    </AppShell>
  );
}
