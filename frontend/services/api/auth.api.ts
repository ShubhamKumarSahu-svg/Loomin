import { apiRequest } from "@/services/api/client";

export interface AuthResponse {
  _id: string;
  fullName: string;
  email: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ fullName: name, email, password }),
  });
};

export const logoutUser = async (): Promise<void> => {
  await apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
};

export const checkAuth = async (): Promise<AuthResponse | null> => {
  try {
    const user = await apiRequest<AuthResponse>("/api/auth/check", {
      method: "GET",
    });
    return user;
  } catch {
    return null;
  }
};

export const devLogin = async (
  userId: string
): Promise<{ message: string; userId: string }> => {
  return apiRequest<{ message: string; userId: string }>(
    `/dev-login/${userId}`,
    { method: "GET" }
  );
};
