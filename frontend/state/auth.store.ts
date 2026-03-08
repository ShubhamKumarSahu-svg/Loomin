import axiosInstance from "@/services/axios";
import { create } from "zustand";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;

  signup: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;

  login: (data: {
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;

  checkAuth: () => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  signup: async (data) => {
    try {
      set({ isSigningUp: true });

      const res = await axiosInstance.post("/auth/signup", data);

      set({
        user: res.data,
        isSigningUp: false,
      });
    } catch (error: unknown) {
      set({ isSigningUp: false });

      const message = getErrorMessage(error, "Signup failed");
      throw new Error(message);
    }
  },

  login: async (data) => {
    try {
      set({ isLoggingIn: true });

      const res = await axiosInstance.post("/auth/login", data);

      set({
        user: res.data,
        isLoggingIn: false,
      });
    } catch (error: unknown) {
      set({ isLoggingIn: false });

      const message = getErrorMessage(error, "Login failed");
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ user: null });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Logout failed");
      throw new Error(message);
    }
  },

  
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({
        user: res.data,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isCheckingAuth: false,
      });
    }
  },
}));

