"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  mobile: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendOTP: (email: string) => Promise<void>;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  sendOTP: async () => { },
  login: async () => { },
  logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem("shareholder_token");
    console.log("AuthProvider: checkAuth run. Token exists:", !!token);
    if (!token) {
      setIsLoading(false);
      // If we are on a protected route, redirect to login
      if (!pathname.startsWith("/login") && pathname !== "/") {
        console.log("AuthProvider: No token, redirecting to login from", pathname);
        router.push("/login");
      }
      return;
    }

    try {
      // Use the actual endpoint to get user details
      const { data } = await api.get("/auth/me");
      // Ensure data.user or data (depending on response structure) is set
      console.log("AuthProvider: checkAuth success, user:", data.user?.mobile);
      setUser(data.user || data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("shareholder_token");
      if (!pathname.startsWith("/login") && pathname !== "/") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string) => {
    try {
      await api.post("/auth/request-otp", { email });
      localStorage.setItem('login_email', email);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw error;
    }
  };

  const login = async (email: string, otp: string) => {
    console.log("AuthProvider: Attempting login for", email, "with OTP", otp);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      console.log("AuthProvider: API Response", data);

      localStorage.setItem("shareholder_token", data.token);
      setUser(data.user);
      console.log("AuthProvider: Token set, forcing navigation to dashboard");

      // Force navigation using window.location to bypass router issues
      window.location.href = "/PortShare/dashboard";
    } catch (error) {
      console.error("AuthProvider: Login failed", error);
      throw error; // Propagate to caller
    }
  };

  const logout = () => {
    localStorage.removeItem("shareholder_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sendOTP, login, logout }}>
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
