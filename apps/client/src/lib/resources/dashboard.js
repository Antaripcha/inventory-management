import { api } from "@/lib/api";

export const dashboardApi = {
  summary: () => api.get("/dashboard").then((r) => r.data),
};
