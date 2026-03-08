import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error?.config?.url?.includes("/auth/check");
    const isPublicRoute = ["/", "/login", "/signup"].includes(window.location.pathname);

    if (
      error?.response?.status === 401 &&
      !isAuthCheck &&           // ← don't redirect when just probing auth
      !isPublicRoute &&         // ← don't redirect when already on public page
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;