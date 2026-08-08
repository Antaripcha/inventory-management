import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/resources/dashboard";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.summary, refetchInterval: 60_000 });
}
