import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, tone = "default", delay = 0 }) {
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    warning: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-data text-2xl font-bold tracking-tight">{value}</p>
    </motion.div>
  );
}
