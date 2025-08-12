import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCategoryStats } from "@/hooks/useCategoryStats";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import TopicView from "@/pages/TopicView";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import SavedTopics from "@/pages/SavedTopics";
import Shop from "@/pages/Shop";
import NotFound from "@/pages/NotFound";

interface NewsletterTopic {
  id: number | string;
  title: string;
  content: string;
  readTime: string;
}

interface WeeklyNewsletter {
  week: number;
  startDate: string;
  endDate: string;
  topics: NewsletterTopic[];
}

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

// Weekly newsletters now loaded from API
let weeklyNewsletters: WeeklyNewsletter[] = [
  {
    week: 3,
    startDate: "15 Jan",
    endDate: "21 Jan 2024",
    topics: [
      {
        id: 1,
        title: "GPT-4 Turbo vs Claude 3: Análise Comparativa de Performance",
        content:
          "Uma análise técnica detalhada dos principais modelos de linguagem que estão redefinindo o panorama da inteligência artificial empresarial.\n\nO OpenAI anunciou significativas otimizações no GPT-4 Turbo, resultando em melhorias de 40% na velocidade de resposta e redução de 50% nos custos operacionais. Simultaneamente, a Anthropic introduziu o Claude 3, estabelecendo novos padrões para compreensão contextual e raciocínio complexo.\n\nPrincipais diferenciadores técnicos:\n\n• Arquitetura de processamento otimizada\n• Redução substancial de latência\n• Expansão do contexto para 200k tokens\n• Integração nativa com APIs empresariais\n• Capacidades multimodais avançadas\n\nEssas inovações representam um marco na evolução da IA conversacional, estabelecendo novos padrões para aplicações empresariais de grande escala.",
        readTime: "8 min",
      },
      {
        id: 2,
        title: "Cursor vs VS Code: Evolução dos Ambientes de Desenvolvimento",
        content:
          "O mercado de editores de código está passando por uma transformação fundamental. Enquanto o VS Code consolida sua posição como padrão da indústria, o Cursor emerge como pioneiro na integração nativa de IA.\n\nAnálise comparativa:\n\nCursor - Inovação Orientada por IA:\n• Integração nativa com modelos de linguagem\n�� Interface otimizada para desenvolvimento assistido\n• Sugestões contextuais inteligentes\n• Workflow de pair programming com IA\n\nVS Code - Estabilidade e Ecossistema:\n• Base instalada de 15+ milhões de desenvolvedores\n• Ecossistema maduro com 40k+ extensões\n• Performance battle-tested em projetos enterprise\n• Suporte oficial da Microsoft\n\nA decisão entre plataformas agora transcende funcionalidades básicas, focando na visão estratégica para o futuro do desenvolvimento de software.",
        readTime: "12 min",
      },
      {
        id: 3,
        title: "Segurança Pós-Quântica: Preparação para a Próxima Era Digital",
        content:
          "2024 marca o início de uma era crítica para a segurança digital. O avanço dos computadores quânticos acelera a obsolescência de protocolos criptográficos tradicionais.\n\nEstratégias de preparação:\n\n• Implementação de criptografia resistente a quantum\n• Migração para autenticação biométrica avançada\n• Adoção de arquiteturas Zero Trust\n• Integração de IA para detecção proativa\n• Sistemas de backup imutáveis\n\nRecomendações imediatas:\n• Autenticação multifator obrigat��ria\n• Gerenciamento centralizado de credenciais\n• Monitoramento contínuo de vulnerabilidades\n• Programas de treinamento especializados\n• Testes regulares de recuperação de desastres\n\nOrganizações que não iniciarem essa transição imediatamente enfrentarão riscos exponencialmente crescentes de comprometimento de dados.",
        readTime: "15 min",
      },
    ],
  },
  {
    week: 2,
    startDate: "08 Jan",
    endDate: "14 Jan 2024",
    topics: [
      {
        id: 4,
        title: "AI Art Revolution: Novas Ferramentas Transformam Criatividade",
        content:
          "A indústria criativa está passando por uma revolução sem precedentes. Novas ferramentas de IA estão democratizando o acesso à criação artística profissional.\n\nPrincipais avanços:\n• DALL-E 3 com precisão fotorrealística\n• Midjourney v6 com controle de composição\n• Stable Diffusion XL para uso comercial\n• RunwayML para criação de vídeos\n\nImpacto no mercado:\n• Redução de 70% no tempo de produção\n• Democratização de ferramentas profissionais\n• Novos modelos de neg��cio emergindo\n• Questões éticas sobre autoria\n\nEstes desenvolvimentos estão redefinindo completamente o que significa ser criativo na era digital.",
        readTime: "10 min",
      },
      {
        id: 5,
        title: "Open Source AI: A Nova Fronteira da Inovação",
        content:
          "O movimento open source em IA está ganhando momentum. Modelos como Llama 2, Mistral e Code Llama estão competindo diretamente com soluções proprietárias.\n\nVantagens do Open Source:\n• Transparência total dos algoritmos\n• Customização para casos específicos\n��� Sem dependência de vendors\n• Comunidade ativa de desenvolvedores\n\nDesafios:\n• Recursos computacionais necessários\n• Complexidade de implementação\n• Suporte limitado\n• Questões de responsabilidade\n\nO futuro da IA pode estar na democratização através do código aberto.",
        readTime: "7 min",
      },
    ],
  },
  {
    week: 1,
    startDate: "01 Jan",
    endDate: "07 Jan 2024",
    topics: [
      {
        id: 6,
        title: "2024: O Ano da IA Multimodal",
        content:
          "2024 promete ser o ano em que a IA multimodal se torna mainstream. Modelos capazes de processar texto, imagem, áudio e vídeo simultaneamente estão revolucionando interações.\n\nTendências principais:\n• GPT-4V com análise de imagens\n• Claude 3 com capacidades visuais\n• Gemini Ultra da Google\n• LLaVA para código aberto\n\nAplicações emergentes:\n• Assistentes visuais inteligentes\n• Análise automática de documentos\n• Criação de conteúdo integrado\n• Acessibilidade aprimorada\n\nEstas tecnologias estão criando experiências mais naturais e intuitivas.",
        readTime: "9 min",
      },
    ],
  },
];

const forumCategories: ForumCategory[] = [
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
    name: "Música/Áudio",
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
];

function App() {
  const [activeSection, setActiveSection] = useState<"newsletter" | "forum">(
    "newsletter",
  );
  const [expandedNewsletter, setExpandedNewsletter] = useState<
    number | string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [newsletters, setNewsletters] = useState<WeeklyNewsletter[]>([]);
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(false);

  // Get dynamic category statistics
  const { categoryStats, refreshStats } = useCategoryStats();

  // Load newsletters from API
  const loadNewsletters = async () => {
    setIsLoadingNewsletters(true);
    try {
      const response = await fetch("/api/newsletter/articles");
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.weeklyNewsletters || []);
      } else {
        console.error("Failed to load newsletters");
      }
    } catch (error) {
      console.error("Error loading newsletters:", error);
    } finally {
      setIsLoadingNewsletters(false);
    }
  };

  useEffect(() => {
    loadNewsletters();
  }, []);

  const toggleNewsletterTopic = (id: number | string) => {
    setExpandedNewsletter(expandedNewsletter === id ? null : id);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Create dynamic categories with real stats
  const getDynamicCategories = (): ForumCategory[] => {
    return forumCategories.map((category) => ({
      ...category,
      totalTopics: categoryStats[category.id]?.totalTopics || 0,
      totalPosts: categoryStats[category.id]?.totalPosts || 0,
      lastPost: categoryStats[category.id]?.lastPost || undefined,
    }));
  };

  const getSelectedCategoryData = () => {
    const dynamicCategories = getDynamicCategories();
    return dynamicCategories.find((cat) => cat.id === selectedCategory);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && currentWeek < newsletters.length - 1) {
      setCurrentWeek(currentWeek + 1);
    } else if (direction === "next" && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
    setExpandedNewsletter(null);
  };

  const currentNewsletter = newsletters[currentWeek] || null;

  return (
    <NotificationProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out">
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
                    forumCategories={getDynamicCategories()}
                    toggleNewsletterTopic={toggleNewsletterTopic}
                    refreshCategoryStats={refreshStats}
                    handleCategoryClick={handleCategoryClick}
                    getSelectedCategoryData={getSelectedCategoryData}
                    navigateWeek={navigateWeek}
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
  );
}

export default App;
