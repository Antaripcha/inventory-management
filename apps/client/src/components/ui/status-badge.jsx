import { Badge } from "@/components/ui/badge";
import { statusColorMap } from "@/lib/utils";

export function StatusBadge({ status }) {
  return <Badge variant={statusColorMap[status] || "secondary"}>{status}</Badge>;
}
