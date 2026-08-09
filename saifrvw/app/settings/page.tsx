"use client";

import { useState } from "react";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-[#8B958D]">
            Configure your SAIFRVW workspace.
          </p>
        </div>

        <Panel className="divide-y divide-white/[0.07]">
          <section className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <UserRound size={18} className="text-[#7CFF9B]" />
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-xs text-[#56615A]">Workspace identity</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#8B958D]">
                Display name
                <input
                  defaultValue="Developer"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#070A08] px-3 py-3 text-sm text-[#F2F5F2] outline-none focus:border-[#7CFF9B]/30"
                />
              </label>

              <label className="text-xs text-[#8B958D]">
                Workspace
                <input
                  defaultValue="saifrvw"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#070A08] px-3 py-3 text-sm text-[#F2F5F2] outline-none focus:border-[#7CFF9B]/30"
                />
              </label>
            </div>
          </section>

          <section className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <KeyRound size={18} className="text-[#7CFF9B]" />
              <div>
                <h2 className="font-semibold">AI provider</h2>
                <p className="text-xs text-[#56615A]">
                  Configure an OpenAI-compatible provider later.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#070A08] p-4 text-xs leading-5 text-[#56615A]">
              API credentials should be configured as server-side environment
              variables. Never expose provider keys in client-side code.
            </div>
          </section>

          <section className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[#56615A]">
              <ShieldCheck size={14} className="text-[#7CFF9B]" />
              Your settings stay server-side.
            </div>

            <button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7CFF9B] px-5 py-3 text-sm font-semibold text-[#061008]"
            >
              <Save size={15} />
              {saved ? "Saved" : "Save settings"}
            </button>
          </section>
        </Panel>
      </div>
    </AppShell>
  );
}
