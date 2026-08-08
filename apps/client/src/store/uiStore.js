import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "inventory-ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
