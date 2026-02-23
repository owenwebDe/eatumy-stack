"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

type User = {
  id: string;
  name: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { },
  logout: () => { },
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setIsLoading(false);
        if (pathname !== "/login") router.push("/login");
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("admin_token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (email: string, otp: string) => {
    // Determine user role (Super Admin vs Admin) during login
    // For now, assume OTP verification via specialized endpoint or generic login
    const { data } = await api.post("/auth/verify-otp", {
      email,
      otp
    });

    // Check if user is authorized (ADMIN/SUPERADMIN/BRANCH_MANAGER)
    if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPERADMIN' && data.user.role !== 'BRANCH_MANAGER') {
      throw new Error("Unauthorized access");
    }

    localStorage.setItem("admin_token", data.token);
    setUser(data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
