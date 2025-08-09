import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

interface NewsletterTopic {
  id: number;
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

const weeklyNewsletters: WeeklyNewsletter[] = [
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
          "O mercado de editores de código está passando por uma transformação fundamental. Enquanto o VS Code consolida sua posição como padrão da indústria, o Cursor emerge como pioneiro na integração nativa de IA.\n\nAnálise comparativa:\n\nCursor - Inovação Orientada por IA:\n• Integração nativa com modelos de linguagem\n• Interface otimizada para desenvolvimento assistido\n• Sugestões contextuais inteligentes\n• Workflow de pair programming com IA\n\nVS Code - Estabilidade e Ecossistema:\n• Base instalada de 15+ milhões de desenvolvedores\n• Ecossistema maduro com 40k+ extensões\n• Performance battle-tested em projetos enterprise\n• Suporte oficial da Microsoft\n\nA decisão entre plataformas agora transcende funcionalidades básicas, focando na visão estratégica para o futuro do desenvolvimento de software.",
        readTime: "12 min",
      },
      {
        id: 3,
        title: "Segurança Pós-Quântica: Preparação para a Próxima Era Digital",
        content:
          "2024 marca o início de uma era crítica para a segurança digital. O avanço dos computadores quânticos acelera a obsolescência de protocolos criptográficos tradicionais.\n\nEstratégias de preparação:\n\n• Implementação de criptografia resistente a quantum\n• Migração para autenticação biométrica avançada\n• Adoção de arquiteturas Zero Trust\n• Integração de IA para detecção proativa\n• Sistemas de backup imutáveis\n\nRecomendações imediatas:\n• Autenticação multifator obrigatória\n• Gerenciamento centralizado de credenciais\n• Monitoramento contínuo de vulnerabilidades\n• Programas de treinamento especializados\n• Testes regulares de recuperação de desastres\n\nOrganizações que não iniciarem essa transição imediatamente enfrentarão riscos exponencialmente crescentes de comprometimento de dados.",
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
          "A indústria criativa está passando por uma revolução sem precedentes. Novas ferramentas de IA estão democratizando o acesso à criação artística profissional.\n\nPrincipais avanços:\n• DALL-E 3 com precisão fotorrealística\n• Midjourney v6 com controle de composição\n• Stable Diffusion XL para uso comercial\n• RunwayML para criação de vídeos\n\nImpacto no mercado:\n• Redução de 70% no tempo de produção\n• Democratização de ferramentas profissionais\n• Novos modelos de negócio emergindo\n• Questões éticas sobre autoria\n\nEstes desenvolvimentos estão redefinindo completamente o que significa ser criativo na era digital.",
        readTime: "10 min",
      },
      {
        id: 5,
        title: "Open Source AI: A Nova Fronteira da Inovação",
        content:
          "O movimento open source em IA está ganhando momentum. Modelos como Llama 2, Mistral e Code Llama estão competindo diretamente com soluções proprietárias.\n\nVantagens do Open Source:\n• Transparência total dos algoritmos\n• Customização para casos específicos\n• Sem dependência de vendors\n• Comunidade ativa de desenvolvedores\n\nDesafios:\n• Recursos computacionais necessários\n• Complexidade de implementação\n• Suporte limitado\n• Questões de responsabilidade\n\nO futuro da IA pode estar na democratização através do código aberto.",
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
    totalTopics: 834,
    totalPosts: 4521,
    lastPost: {
      title: "Midjourney vs DALL-E 3: Comparativo",
      author: "VisualAI",
      date: "Hoje",
      time: "12:20",
    },
    posts: [
      {
        id: "1",
        title: "Midjourney vs DALL-E 3: Comparativo de qualidade",
        description:
          "Teste side-by-side das principais ferramentas de geração de imagem",
        author: "VisualAI",
        authorAvatar: "VA",
        replies: 56,
        views: 1823,
        lastPost: { author: "CreativeAI", date: "Hoje", time: "11:45" },
        isHot: true,
      },
      {
        id: "2",
        title: "Stable Diffusion XL: Novidades e melhorias",
        description: "Análise das novas funcionalidades do SDXL",
        author: "ImageGen",
        authorAvatar: "IG",
        replies: 28,
        views: 945,
        lastPost: { author: "AIArtist", date: "Hoje", time: "10:30" },
        isPinned: true,
      },
    ],
  },
  {
    id: "video",
    name: "Vídeo",
    description: "Criação e edição de vídeos com inteligência artificial",
    totalTopics: 456,
    totalPosts: 2341,
    lastPost: {
      title: "Runway ML: Dicas de Produção",
      author: "VideoMaker",
      date: "Hoje",
      time: "15:10",
    },
    posts: [
      {
        id: "3",
        title: "Runway ML: Dicas de Produção",
        description: "Como criar vídeos profissionais usando Runway ML",
        author: "VideoMaker",
        authorAvatar: "VM",
        replies: 38,
        views: 1247,
        lastPost: { author: "FilmPro", date: "Hoje", time: "15:10" },
        isHot: true,
      },
      {
        id: "4",
        title: "Pika Labs: Review da Nova Ferramenta",
        description: "Análise completa da plataforma de geração de vídeos",
        author: "ContentCreator",
        authorAvatar: "CC",
        replies: 29,
        views: 892,
        lastPost: { author: "VideoTech", date: "Ontem", time: "18:45" },
      },
    ],
  },
  {
    id: "musica-audio",
    name: "Música/Áudio",
    description: "Produção musical e processamento de áudio com IA",
    totalTopics: 312,
    totalPosts: 1567,
    lastPost: {
      title: "Suno AI: Criando Músicas Incríveis",
      author: "MusicProducer",
      date: "Hoje",
      time: "11:25",
    },
    posts: [
      {
        id: "5",
        title: "Suno AI: Criando Músicas Incríveis",
        description: "Tutorial completo para gerar músicas profissionais",
        author: "MusicProducer",
        authorAvatar: "MP",
        replies: 36,
        views: 1156,
        lastPost: { author: "AudioEngineer", date: "Hoje", time: "11:25" },
        isPinned: true,
      },
      {
        id: "6",
        title: "Voice Synthesis: Aplicações Empresariais",
        description: "Como usar síntese vocal para atendimento automatizado",
        author: "AudioTech",
        authorAvatar: "AT",
        replies: 24,
        views: 678,
        lastPost: { author: "VoicePro", date: "Ontem", time: "20:10" },
      },
    ],
  },
  {
    id: "vibe-coding",
    name: "Vibe Coding",
    description: "Ferramentas de desenvolvimento, IDEs e produtividade",
    totalTopics: 892,
    totalPosts: 5234,
    lastPost: {
      title: "Cursor: O Futuro do Desenvolvimento",
      author: "DevMaster",
      date: "Hoje",
      time: "16:45",
    },
    posts: [
      {
        id: "7",
        title: "Cursor: O Futuro do Desenvolvimento",
        description:
          "Review completo do editor que está revolucionando o coding",
        author: "DevMaster",
        authorAvatar: "DM",
        replies: 78,
        views: 3241,
        lastPost: { author: "CodeNinja", date: "Hoje", time: "16:45" },
        isHot: true,
        isPinned: true,
      },
      {
        id: "8",
        title: "GitHub Copilot vs Cursor: Comparativo",
        description: "Análise das principais ferramentas de AI coding",
        author: "CodeReviewer",
        authorAvatar: "CR",
        replies: 49,
        views: 1876,
        lastPost: { author: "AIHelper", date: "Hoje", time: "14:20" },
      },
    ],
  },
];

function App() {
  const [activeSection, setActiveSection] = useState<"newsletter" | "forum">(
    "newsletter",
  );
  const [expandedNewsletter, setExpandedNewsletter] = useState<number | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0); // Index para a semana atual

  const toggleNewsletterTopic = (id: number) => {
    setExpandedNewsletter(expandedNewsletter === id ? null : id);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const getSelectedCategoryData = () => {
    return forumCategories.find((cat) => cat.id === selectedCategory);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && currentWeek < weeklyNewsletters.length - 1) {
      setCurrentWeek(currentWeek + 1);
    } else if (direction === "next" && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
    setExpandedNewsletter(null); // Reset expanded state when changing weeks
  };

  const currentNewsletter = weeklyNewsletters[currentWeek];

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out">
        <Header />

        <main className="container max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
              IA HUB
            </h1>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveSection("newsletter")}
                  className={`px-6 py-2 rounded-md transition-all duration-300 ease-in-out font-medium ${
                    activeSection === "newsletter"
                      ? "bg-black text-white transform scale-105"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  Newsletter
                </button>
                <button
                  onClick={() => setActiveSection("forum")}
                  className={`px-6 py-2 rounded-md transition-all duration-300 ease-in-out font-medium ${
                    activeSection === "forum"
                      ? "bg-black text-white transform scale-105"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  Fórum
                </button>
              </div>
            </div>
          </div>

          {/* Content with smooth transitions */}
          <div className="transition-all duration-500 ease-in-out">
            {activeSection === "newsletter" && (
              <div
                className="space-y-6 max-w-4xl mx-auto opacity-0 animate-fade-in"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                {/* Newsletter Header with Navigation */}
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => navigateWeek("prev")}
                      disabled={currentWeek >= weeklyNewsletters.length - 1}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        currentWeek >= weeklyNewsletters.length - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:text-black hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M12.7 5.3a1 1 0 0 0-1.4-1.4l-5 5a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L8.4 10l4.3-4.7z" />
                      </svg>
                    </button>

                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-black">
                        Newsletter Semanal
                      </h2>
                      <p className="text-lg text-gray-600 mt-2">
                        Semana {currentNewsletter.week} •{" "}
                        {currentNewsletter.startDate} -{" "}
                        {currentNewsletter.endDate}
                      </p>
                    </div>

                    <button
                      onClick={() => navigateWeek("next")}
                      disabled={currentWeek <= 0}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        currentWeek <= 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:text-black hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7.3 14.7a1 1 0 0 0 1.4 1.4l5-5a1 1 0 0 0 0-1.4l-5-5a1 1 0 0 0-1.4 1.4L11.6 10l-4.3 4.7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-md text-gray-500">
                    Insights técnicos e análises do mercado de IA
                  </p>
                </div>

                {currentNewsletter.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleNewsletterTopic(topic.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-2">
                            #{topic.id.toString().padStart(2, "0")}
                          </div>
                          <h3 className="text-xl font-semibold text-black mb-3">
                            {topic.title}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {topic.readTime} de leitura
                          </div>
                        </div>
                        <div
                          className={`transform transition-transform duration-300 ease-in-out ${expandedNewsletter === topic.id ? "rotate-180" : ""}`}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="text-gray-400"
                          >
                            <path d="M5 7l5 5 5-5H5z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {expandedNewsletter === topic.id && (
                      <div className="border-t border-gray-100 bg-gray-50 animate-slide-up">
                        <div className="p-6">
                          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {topic.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === "forum" && !selectedCategory && (
              <div
                className="space-y-6 opacity-0 animate-fade-in"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                {/* Forum Categories */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                      Categorias do Fórum
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {forumCategories.map((category) => (
                      <div
                        key={category.id}
                        className="hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-0.5"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                                  {category.name.split(" ")[0][0]}
                                  {category.name.split(" ")[1]?.[0] || ""}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-black mb-1">
                                    {category.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right text-sm text-gray-500 min-w-[200px]">
                              <div className="mb-1">
                                <span className="font-medium text-black">
                                  {category.totalTopics}
                                </span>{" "}
                                tópicos
                                <span className="mx-2">•</span>
                                <span className="font-medium text-black">
                                  {category.totalPosts}
                                </span>{" "}
                                posts
                              </div>
                              {category.lastPost && (
                                <div className="text-xs">
                                  Último:{" "}
                                  <span className="font-medium">
                                    {category.lastPost.title}
                                  </span>
                                  <br />
                                  por{" "}
                                  <span className="font-medium">
                                    {category.lastPost.author}
                                  </span>{" "}
                                  • {category.lastPost.date} às{" "}
                                  {category.lastPost.time}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "forum" && selectedCategory && (
              <div
                className="space-y-6 opacity-0 animate-fade-in"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                {/* Back Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 ease-in-out hover:translate-x-1"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      d="M8 0L6.6 1.4 12.2 7H0v2h12.2L6.6 14.6 8 16l8-8-8-8z"
                      transform="rotate(180 8 8)"
                    />
                  </svg>
                  Voltar às categorias
                </button>

                {/* Category Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {getSelectedCategoryData()?.name}
                  </h2>
                  <p className="text-gray-600">
                    {getSelectedCategoryData()?.description}
                  </p>
                </div>

                {/* Topics List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                      <div className="col-span-6">Tópico</div>
                      <div className="col-span-2 text-center">Respostas</div>
                      <div className="col-span-2 text-center">
                        Visualizações
                      </div>
                      <div className="col-span-2 text-center">
                        Última mensagem
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {getSelectedCategoryData()?.posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-6 hover:bg-gray-50 transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {post.authorAvatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {post.isPinned && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Fixado
                                    </span>
                                  )}
                                  {post.isHot && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      🔥 Quente
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold text-black hover:text-blue-600 cursor-pointer truncate transition-colors duration-200">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {post.description}
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                  por{" "}
                                  <span className="font-medium">
                                    {post.author}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 text-center">
                            <div className="font-semibold text-black">
                              {post.replies}
                            </div>
                          </div>

                          <div className="col-span-2 text-center">
                            <div className="font-semibold text-black">
                              {post.views.toLocaleString()}
                            </div>
                          </div>

                          <div className="col-span-2 text-center text-sm">
                            <div className="text-gray-600">
                              por{" "}
                              <span className="font-medium text-black">
                                {post.lastPost.author}
                              </span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              {post.lastPost.date} às {post.lastPost.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200">
                      Anterior
                    </button>
                    <button className="px-3 py-2 rounded-md bg-black text-white">
                      1
                    </button>
                    <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200">
                      2
                    </button>
                    <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200">
                      3
                    </button>
                    <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200">
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
