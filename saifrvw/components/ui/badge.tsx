"use client";
import { cn } from "@/lib/utils";

interface BadgeProps { children: React.ReactNode; variant?: "default" | "green" | "outline" | "subtle"; className?: string; }
export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-surface border border-[rgba(255,255,255,0.07)] text-secondary-text",
    green: "bg-[#7CFF9B]/10 border border-[#7CFF9B]/20 text-[#7CFF9B]",
    outline: "border border-[rgba(255,255,255,0.07)] text-secondary-text",
    subtle: "bg-surface/50 text-muted text-xs",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {variant === "green" && <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF9B] animate-pulse" />}
      {children}
    </span>
  );
}
