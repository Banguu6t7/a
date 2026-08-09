"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Code2,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/review", label: "New review", icon: FileSearch },
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050706] text-[#F2F5F2]">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.07] bg-[#070A08] lg:block">
        <Sidebar pathname={pathname} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 border-r border-white/[0.07] bg-[#070A08]">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[#8B958D] hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar pathname={pathname} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#050706]/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-[#8B958D] hover:bg-white/5 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="hidden items-center gap-2 text-xs text-[#56615A] sm:flex">
            <ShieldCheck size={14} className="text-[#7CFF9B]" />
            Static analysis enabled
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium text-[#F2F5F2]">
                Developer
              </div>
              <div className="text-[11px] text-[#56615A]">
                Free workspace
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7CFF9B]/20 bg-[#7CFF9B]/10 text-xs font-semibold text-[#7CFF9B]">
              S
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <Link href="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7CFF9B]/20 bg-[#7CFF9B]/10">
          <Code2 size={18} className="text-[#7CFF9B]" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide">SAIFRVW</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#56615A]">
            Code Intelligence
          </div>
        </div>
      </Link>

      <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#56615A]">
        Workspace
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[#7CFF9B]/10 text-[#7CFF9B]"
                  : "text-[#8B958D] hover:bg-white/[0.04] hover:text-[#F2F5F2]"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#7CFF9B]/10 bg-[#7CFF9B]/[0.03] p-4">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={15} className="text-[#7CFF9B]" />
          <span className="text-xs font-semibold">Review capacity</span>
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-[34%] rounded-full bg-[#7CFF9B]" />
        </div>
        <div className="text-[11px] text-[#56615A]">17 / 50 reviews used</div>
      </div>
    </div>
  );
}
