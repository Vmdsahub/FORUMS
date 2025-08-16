import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCategoryStats } from "@/hooks/useCategoryStats";
import { useSimpleWeekNavigation } from "@/hooks/useSimpleWeekNavigation";
import { NewsletterTopic, WeeklyNewsletter } from "@/utils/weekSystem";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlassmorphismBackground from "@/components/GlassmorphismBackground";
import TopicView from "@/pages/TopicView";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import SavedTopics from "@/pages/SavedTopics";
import Shop from "@/pages/Shop";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces movidas para @/utils/weekSystem

interface ForumPost {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  replies: number;
  views: number;
  lastPost: {
    author: string;
    date: string;
    time: string;
  };
  isPinned?: boolean;
  isHot?: boolean;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  posts: ForumPost[];
  totalTopics: number;
  totalPosts: number;
  lastPost?: {
    title: string;
    author: string;
    date: string;
    time: string;
  };
}

// Os dados de fallback não são mais necessários - o sistema gera automaticamente todas as semanas

// Categorias da seção Ferramentas
const toolsCategories: ForumCategory[] = [
  {
    id: "imagem",
    name: "Imagem",
    description: "Geração de imagens, edição e ferramentas visuais com IA",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "video",
    name: "Vídeo",
    description: "Criação e edição de vídeos com inteligência artificial",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "musica-audio",
    name: "Música/��udio",
    description: "Produção musical e processamento de áudio com IA",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "vibe-coding",
    name: "Vibe Coding",
    description: "Ferramentas de desenvolvimento, IDEs e produtividade",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "duvidas-erros",
    name: "Dúvidas/Erros",
    description: "Tire suas dúvidas e relate problemas com ferramentas de IA",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "outros",
    name: "Outros",
    description: "Discussões gerais sobre ferramentas de IA não categorizadas",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
];

// Categorias da seção Open-Source
const openSourceCategories: ForumCategory[] = [
  {
    id: "opensource-imagem",
    name: "Imagem",
    description:
      "Stable Diffusion, DALL-E open-source e modelos de imagem gratuitos",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "opensource-video",
    name: "Vídeo",
    description:
      "Runway open-source, Zeroscope e ferramentas de vídeo gratuitas",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "opensource-musica-audio",
    name: "Música/Áudio",
    description: "MusicGen, AudioCraft e ferramentas de áudio open-source",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "opensource-vibe-coding",
    name: "Vibe Coding",
    description: "Code Llama, StarCoder e IDEs com IA gratuitas",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "opensource-duvidas-erros",
    name: "Dúvidas/Erros",
    description:
      "Tire suas dúvidas e relate problemas com ferramentas open-source",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
  {
    id: "opensource-outros",
    name: "Outros",
    description:
      "Discussões gerais sobre projetos open-source de IA não categorizados",
    totalTopics: 0,
    totalPosts: 0,
    lastPost: undefined,
    posts: [],
  },
];

function App() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<"newsletter" | "forum">(
    "newsletter",
  );
  const [expandedNewsletter, setExpandedNewsletter] = useState<
    number | string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newsletterData, setNewsletterData] = useState<any>(null);
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(false);

  // Get dynamic category statistics
  const { categoryStats, refreshStats } = useCategoryStats();

  // Use the new simplified week navigation system
  const {
    currentNewsletter,
    navigateWeek,
    canNavigatePrev,
    canNavigateNext,
    goToCurrentWeek,
    isCurrentWeek,
    debugInfo,
  } = useSimpleWeekNavigation({
    isAdmin,
    articlesData: newsletterData
  });

  // Debug log para o novo sistema
  console.log("App debug (novo sistema):", {
    isAdmin,
    debugInfo,
    currentNewsletter: currentNewsletter ? {
      week: currentNewsletter.week,
      year: currentNewsletter.year,
      topicsCount: currentNewsletter.topics?.length || 0
    } : null,
  });

  // Listen for global category stats refresh events
  useEffect(() => {
    const handleRefreshStats = () => {
      refreshStats();
    };

    window.addEventListener("refreshCategoryStats", handleRefreshStats);
    return () => {
      window.removeEventListener("refreshCategoryStats", handleRefreshStats);
    };
  }, [refreshStats]);

  // Load newsletters from API
  const loadNewsletters = async () => {
    setIsLoadingNewsletters(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(
          new DOMException("Newsletter request timeout", "TimeoutError"),
        );
      }, 5000); // 5s timeout

      const response = await fetch("/api/newsletter/articles", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setNewsletterData(data);
        console.log("Newsletter data loaded:", data);
      } else {
        console.warn("Newsletter service unavailable, using empty data");
        setNewsletterData({ weeklyNewsletters: [] });
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        console.warn("Newsletter request timed out");
      } else {
        console.warn(
          "Newsletter service unavailable, using empty data:",
          error.message,
        );
      }
      setNewsletterData({ weeklyNewsletters: [] });
    } finally {
      setIsLoadingNewsletters(false);
    }
  };

  useEffect(() => {
    // Add small delay to prevent simultaneous requests on initial load
    const timer = setTimeout(() => {
      loadNewsletters();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const toggleNewsletterTopic = (id: number | string) => {
    setExpandedNewsletter(expandedNewsletter === id ? null : id);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Create dynamic categories with real stats for tools
  const getDynamicToolsCategories = (): ForumCategory[] => {
    return toolsCategories.map((category) => ({
      ...category,
      totalTopics: categoryStats[category.id]?.totalTopics || 0,
      totalPosts: categoryStats[category.id]?.totalPosts || 0,
      lastPost: categoryStats[category.id]?.lastPost || undefined,
    }));
  };

  // Create dynamic categories with real stats for open-source
  const getDynamicOpenSourceCategories = (): ForumCategory[] => {
    return openSourceCategories.map((category) => ({
      ...category,
      totalTopics: categoryStats[category.id]?.totalTopics || 0,
      totalPosts: categoryStats[category.id]?.totalPosts || 0,
      lastPost: categoryStats[category.id]?.lastPost || undefined,
    }));
  };

  const getSelectedCategoryData = () => {
    const allCategories = [
      ...getDynamicToolsCategories(),
      ...getDynamicOpenSourceCategories(),
    ];
    return allCategories.find((cat) => cat.id === selectedCategory);
  };

  // Navigation handled by useWeekNavigation hook

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out hide-scrollbar app-container">
              <GlassmorphismBackground />
              <Header activeSection={activeSection} />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Index
                      activeSection={activeSection}
                      setActiveSection={setActiveSection}
                      expandedNewsletter={expandedNewsletter}
                      setExpandedNewsletter={setExpandedNewsletter}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      currentWeek={currentWeek}
                      setCurrentWeek={setCurrentWeek}
                      weeklyNewsletters={newsletters}
                      onNewsletterRefresh={loadNewsletters}
                      toolsCategories={getDynamicToolsCategories()}
                      openSourceCategories={getDynamicOpenSourceCategories()}
                      toggleNewsletterTopic={toggleNewsletterTopic}
                      refreshCategoryStats={refreshStats}
                      handleCategoryClick={handleCategoryClick}
                      getSelectedCategoryData={getSelectedCategoryData}
                      navigateWeek={navigateWeek}
                      canNavigatePrev={canNavigatePrev}
                      canNavigateNext={canNavigateNext}
                      currentNewsletter={currentNewsletter}
                    />
                  }
                />
                <Route path="/topic/:topicId" element={<TopicView />} />
                <Route path="/account" element={<Account />} />
                <Route path="/saved-topics" element={<SavedTopics />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
