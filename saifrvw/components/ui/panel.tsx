import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-[#0A0D0B] shadow-[0_20px_80px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}
