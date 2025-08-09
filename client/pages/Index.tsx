import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CreateTopicModal from "@/components/CreateTopicModal";

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

interface IndexProps {
  activeSection: "newsletter" | "forum";
  setActiveSection: (section: "newsletter" | "forum") => void;
  expandedNewsletter: number | null;
  setExpandedNewsletter: (id: number | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  weeklyNewsletters: WeeklyNewsletter[];
  forumCategories: ForumCategory[];
  toggleNewsletterTopic: (id: number) => void;
  handleCategoryClick: (categoryId: string) => void;
  getSelectedCategoryData: () => ForumCategory | undefined;
  navigateWeek: (direction: "prev" | "next") => void;
  currentNewsletter: WeeklyNewsletter;
}

export default function Index(props: IndexProps) {
  const {
    activeSection,
    setActiveSection,
    expandedNewsletter,
    selectedCategory,
    currentWeek,
    weeklyNewsletters,
    forumCategories,
    toggleNewsletterTopic,
    handleCategoryClick,
    getSelectedCategoryData,
    navigateWeek,
    currentNewsletter,
  } = props;

  return (
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
              onClick={() => props.setSelectedCategory(null)}
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
                  <Link
                    key={post.id}
                    to={`/topic/${post.id}`}
                    className="block p-6 hover:bg-gray-50 transition-all duration-300 ease-in-out hover:-translate-y-0.5"
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
                  </Link>
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
  );
}
