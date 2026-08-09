import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0A0D0B] p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-[#8B958D]">{label}</span>
        {icon && (
          <div className="rounded-lg border border-white/[0.07] bg-[#0F1411] p-2 text-[#7CFF9B]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tracking-tight text-[#F2F5F2]">
          {value}
        </span>

        {change && (
          <span
            className={`flex items-center gap-1 text-xs ${
              positive ? "text-[#7CFF9B]" : "text-[#FF8C42]"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
