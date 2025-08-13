import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Theme {
  id: string;
  name: string;
  description: string;
  price: number;
  preview: string;
  cssClass: string;
  icon: string;
}

interface UserTheme {
  themeId: string;
  purchasedAt: string;
}

interface ThemeContextType {
  availableThemes: Theme[];
  userThemes: UserTheme[];
  currentTheme: string;
  userLikes: number;
  purchaseTheme: (themeId: string) => Promise<boolean>;
  applyTheme: (themeId: string) => void;
  fetchUserThemes: () => void;
  fetchUserLikes: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const AVAILABLE_THEMES: Theme[] = [
  {
    id: "dark",
    name: "Tema Noturno",
    description: "Interface escura elegante para uma experiência suave",
    price: 20,
    preview: "/api/images/theme-dark-preview.jpg",
    cssClass: "theme-dark",
    icon: "🌙"
  },
  // Futuros temas podem ser adicionados aqui
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [availableThemes] = useState<Theme[]>(AVAILABLE_THEMES);
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [userLikes, setUserLikes] = useState<number>(0);

  // Carregar dados do usuário quando logado
  useEffect(() => {
    if (user) {
      fetchUserThemes();
      fetchUserLikes();

      // Carregar tema salvo apenas se existir e for válido
      const savedTheme = localStorage.getItem("selected_theme");
      if (savedTheme && savedTheme !== "default") {
        setCurrentTheme(savedTheme);
        document.body.classList.add("theme-dark");
      }
    } else {
      // Usuário deslogado: limpar tudo
      setCurrentTheme("default");
      document.body.classList.remove("theme-dark");
      localStorage.removeItem("selected_theme");
    }
  }, [user]);

  const fetchUserThemes = async () => {
    if (!user) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/user/themes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUserThemes(data.themes || []);
      } else {
        console.warn("User themes service unavailable");
        setUserThemes([]); // Set empty array as fallback
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("User themes service unavailable");
      }
      setUserThemes([]); // Set empty array as fallback
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/user/likes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUserLikes(data.totalLikes || 0);
      } else {
        console.warn("User likes service unavailable");
        setUserLikes(0); // Set 0 as fallback
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("User likes service unavailable");
      }
      setUserLikes(0); // Set 0 as fallback
    }
  };

  const purchaseTheme = async (themeId: string): Promise<boolean> => {
    if (!user) return false;

    const theme = availableThemes.find(t => t.id === themeId);
    if (!theme) return false;

    if (userLikes < theme.price) {
      return false; // Likes insuficientes
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/user/themes/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ themeId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUserLikes(data.remainingLikes);
        setUserThemes(prev => [...prev, { themeId, purchasedAt: new Date().toISOString() }]);
        return true;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Purchase request timeout");
      } else {
        console.error("Error purchasing theme:", error);
      }
    }

    return false;
  };

  const applyThemeToDom = (themeId: string) => {
    // Remover todas as classes de tema existentes
    document.body.classList.remove("theme-dark");
    
    // Aplicar nova classe de tema se não for o padrão
    if (themeId !== "default") {
      const theme = availableThemes.find(t => t.id === themeId);
      if (theme) {
        document.body.classList.add(theme.cssClass);
      }
    }
  };

  const applyTheme = (themeId: string) => {
    // Só permitir aplicação de temas se o usuário estiver logado
    if (!user) {
      console.warn("Usuário deve estar logado para aplicar temas");
      return;
    }

    setCurrentTheme(themeId);
    localStorage.setItem("selected_theme", themeId);
    applyThemeToDom(themeId);
  };

  return (
    <ThemeContext.Provider
      value={{
        availableThemes,
        userThemes,
        currentTheme,
        userLikes,
        purchaseTheme,
        applyTheme,
        fetchUserThemes,
        fetchUserLikes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
