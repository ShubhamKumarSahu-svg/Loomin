import { create } from "zustand";

type SystemStatus = "idle" | "generating" | "monitoring";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

interface GlobalState {
  theme: "light" | "dark";
  systemStatus: SystemStatus;
  notifications: Notification[];

  setTheme: (theme: "light" | "dark") => void;
  setSystemStatus: (status: SystemStatus) => void;

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  resetAppState: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  theme: "light",
  systemStatus: "idle",
  notifications: [],

  setTheme: (theme) => set({ theme }),

  setSystemStatus: (status) => set({ systemStatus: status }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.id !== id
      ),
    })),

  resetAppState: () =>
    set({
      systemStatus: "idle",
      notifications: [],
    }),
}));