import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/resources/audit";

export function useAuditLogs(params) {
  return useQuery({ queryKey: ["audit-logs", params], queryFn: () => auditApi.list(params), keepPreviousData: true });
}
