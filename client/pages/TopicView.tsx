import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSystemNew from "@/components/CommentSystemNew";
import UserPointsBadge from "@/components/UserPointsBadge";
import UserHoverCard from "@/components/UserHoverCard";

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  date: string;
  time: string;
  likes: number;
  isLiked: boolean;
  parentId?: string;
  replies?: Comment[];
  repliesCount?: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  replies: number;
  views: number;
  likes: number;
  isLiked: boolean;
  lastPost: {
    author: string;
    date: string;
    time: string;
  };
  isPinned?: boolean;
  isHot?: boolean;
  category: string;
  content: string;
  comments: Comment[];
}

export default function TopicView() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  // Load saved topics
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`savedTopics_${user.email}`);
      if (saved) {
        try {
          setSavedTopicIds(JSON.parse(saved));
        } catch (error) {
          console.error("Error loading saved topics:", error);
        }
      }
    }
  }, [user]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${topicId}`);
      if (response.ok) {
        const data = await response.json();
        setTopic(data);
      } else {
        toast.error("Tópico não encontrado");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching topic:", error);
      toast.error("Erro ao carregar tópico");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }

    try {
      const response = await fetch(`/api/topics/${topicId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopic((prev) =>
          prev ? { ...prev, likes: data.likes, isLiked: data.isLiked } : null,
        );
      }
    } catch (error) {
      console.error("Error liking topic:", error);
      toast.error("Erro ao curtir tópico");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopic((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: prev.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, likes: data.likes, isLiked: data.isLiked }
                : comment,
            ),
          };
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Erro ao curtir comentário");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para comentar");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Digite um comentário");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/topics/${topicId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        // Recarregar o tópico para obter a estrutura organizada
        await fetchTopic();
        setNewComment("");
        toast.success("Comentário adicionado!");
      } else {
        toast.error("Erro ao adicionar comentário");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToComment = async (parentId: string, content: string) => {
    if (!user) {
      toast.error("Faça login para responder");
      return;
    }

    const response = await fetch(`/api/topics/${topicId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({ content, parentId }),
    });

    if (response.ok) {
      // Recarregar o tópico para obter a estrutura organizada
      await fetchTopic();
    } else {
      throw new Error("Erro ao adicionar resposta");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        // Recarregar o tópico para obter a estrutura atualizada
        await fetchTopic();
        toast.success("Comentário excluído!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao excluir comentário");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário");
    }
  };

  const handleDeleteTopic = async () => {
    if (!isAdmin || !topic) return;

    if (!confirm(`Tem certeza que deseja excluir o tópico "${topic.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        toast.success("Tópico excluído com sucesso!");
        navigate("/"); // Volta para a página principal
      } else {
        toast.error("Erro ao excluir tópico");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Erro ao excluir tópico");
    }
  };

  const handleSaveTopic = () => {
    if (!user || !topic) {
      toast.error("Faça login para salvar tópicos");
      return;
    }

    const storageKey = `savedTopics_${user.email}`;
    const saved = localStorage.getItem(storageKey);
    let savedIds: string[] = [];

    if (saved) {
      try {
        savedIds = JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing saved topics:", error);
      }
    }

    if (savedIds.includes(topic.id)) {
      // Remove from saved
      const updatedIds = savedIds.filter((id) => id !== topic.id);
      localStorage.setItem(storageKey, JSON.stringify(updatedIds));
      setSavedTopicIds(updatedIds);
      toast.success("Tópico removido dos salvos");
    } else {
      // Add to saved
      const updatedIds = [...savedIds, topic.id];
      localStorage.setItem(storageKey, JSON.stringify(updatedIds));
      setSavedTopicIds(updatedIds);
      toast.success(`"${topic.title}" salvo com sucesso!`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tópico...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            Tópico não encontrado
          </h2>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 0L6.6 1.4 12.2 7H0v2h12.2L6.6 14.6 8 16l8-8-8-8z"
                transform="rotate(180 8 8)"
              />
            </svg>
            Voltar ao fórum
          </button>
        </div>

        {/* Topic Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {topic.isPinned && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Fixado
                  </span>
                )}
                {topic.isHot && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🔥 Quente
                  </span>
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {topic.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-black mb-2">
                {topic.title}
              </h1>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <UserHoverCard
                    userId={topic.authorId}
                    userName={topic.author}
                    userAvatar={topic.authorAvatar}
                    isTopicAuthor={true}
                    size="sm"
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold hover:bg-gray-800 transition-colors">
                        {topic.authorAvatar}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>
                          por{" "}
                          <span className="font-medium text-black hover:text-gray-700 transition-colors">
                            {topic.author}
                          </span>
                        </span>
                        <UserPointsBadge
                          userId={topic.authorId}
                          size="sm"
                          showBadges={true}
                        />
                      </div>
                    </div>
                  </UserHoverCard>
                </div>
                <span>•</span>
                <span>{topic.views.toLocaleString()} visualizações</span>
                <span>•</span>
                <span>{topic.replies} respostas</span>
              </div>
            </div>
          </div>

          {/* Topic Content */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <MarkdownRenderer content={topic.content} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLikeTopic}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  topic.isLiked
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 14s-5-4-5-8c0-2.5 2-4.5 4.5-4.5C9 1.5 8 3 8 3s-1-1.5 2.5-1.5C13 1.5 15 3.5 15 6c0 4-5 8-5 8z" />
                </svg>
                {topic.likes}
              </button>
              {user && (
                <button
                  onClick={handleSaveTopic}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    savedTopicIds.includes(topic.id)
                      ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  title={
                    savedTopicIds.includes(topic.id)
                      ? "Remover dos salvos"
                      : "Salvar tópico"
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={
                      savedTopicIds.includes(topic.id) ? "currentColor" : "none"
                    }
                    stroke="currentColor"
                  >
                    <path
                      d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
                      strokeWidth="2"
                    />
                  </svg>
                  {savedTopicIds.includes(topic.id) ? "Salvo" : "Salvar"}
                </button>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={handleDeleteTopic}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                title="Excluir tópico (Admin)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Excluir Tópico
              </button>
            )}
          </div>
        </div>

        {/* Novo Sistema de Comentários */}
        <CommentSystemNew topicId={topic.id} topicAuthorId={topic.authorId} />
      </div>
    </div>
  );
}
