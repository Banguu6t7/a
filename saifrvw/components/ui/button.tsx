"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}

export function Button({ children, variant = "primary", size = "md", loading = false, className, disabled, asChild, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-[#7CFF9B] text-[#050706] hover:bg-[#35D56F] focus:ring-2 focus:ring-[#7CFF9B]/50",
    secondary: "bg-surface border border-[rgba(255,255,255,0.07)] text-[#F2F5F2] hover:bg-[#0F1411] focus:ring-2 focus:ring-[#7CFF9B]/30",
    ghost: "text-[#8B958D] hover:text-[#F2F5F2] hover:bg-surface/50",
    danger: "bg-[#FF4444]/10 border border-[#FF4444]/20 text-[#FF4444] hover:bg-[#FF4444]/20",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  if (asChild && children) {
    return (
      <span className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]", variants[variant], sizes[size], className)}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
    );
  }

  return (
    <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]", variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
