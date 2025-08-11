import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User, AuthResponse, ErrorResponse } from "@shared/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, captcha: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    birthDate: string,
    acceptTerms: boolean,
    acceptNewsletter: boolean,
    captcha: string,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Validate token and get user info
      fetchUserInfo(token);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    captcha: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, captcha }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: AuthResponse = await response.json();
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        toast.success("Login realizado com sucesso!");
        return true;
      } else {
        let errorMessage = "Erro ao fazer login";
        try {
          const error: ErrorResponse = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError);
        }
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "AbortError") {
        toast.error("Requisição expirou. Tente novamente.");
      } else {
        toast.error("Erro de conexão. Tente novamente.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    birthDate: string,
    acceptTerms: boolean,
    acceptNewsletter: boolean,
    captcha: string,
  ): Promise<boolean> => {
    console.log("[REGISTER] Starting registration...", { name, email });
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          birthDate,
          acceptTerms,
          acceptNewsletter,
          captcha,
        }),
      });

      console.log("[REGISTER] Response received, status:", response.status);

      if (response.ok) {
        console.log("[REGISTER] Success response");
        const data = await response.json();
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        toast.success("Conta criada com sucesso!");
        return true;
      } else {
        console.log("[REGISTER] Error response");
        let errorMessage = "Erro ao criar conta";

        try {
          const errorData = await response.json();
          console.log("[REGISTER] Error data:", errorData);
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.log("[REGISTER] Could not parse error response:", parseError);
          console.log("[REGISTER] Response status:", response.status);
          console.log("[REGISTER] Response headers:", response.headers.get('content-type'));

          // Tentar obter o texto bruto da resposta para debug
          try {
            const text = await response.text();
            console.log("[REGISTER] Response text:", text);
          } catch (textError) {
            console.log("[REGISTER] Could not get response text:", textError);
          }

          errorMessage = `Erro HTTP ${response.status}`;
        }

        console.log("[REGISTER] Showing error message:", errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (networkError) {
      console.error("[REGISTER] Network or other error:", networkError);
      toast.error("Erro de conexão. Tente novamente.");
      return false;
    } finally {
      console.log("[REGISTER] Setting loading to false");
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
