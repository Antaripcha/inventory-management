import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Lightweight form field wrapper: label + control + error message. */
export function FormField({ label, htmlFor, error, className, children, required }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
