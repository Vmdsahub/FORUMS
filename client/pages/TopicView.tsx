import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  author: string;
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

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

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
        const newCommentData = await response.json();
        setTopic((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newCommentData],
                replies: prev.replies + 1,
              }
            : null,
        );
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

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        setTopic((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: prev.comments.filter((comment) => comment.id !== commentId),
            replies: prev.replies - 1,
          };
        });
        toast.success("Comentário excluído!");
      } else {
        toast.error("Erro ao excluir comentário");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário");
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
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                    {topic.authorAvatar}
                  </div>
                  <span>
                    por{" "}
                    <span className="font-medium text-black">
                      {topic.author}
                    </span>
                  </span>
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

          {/* Like Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
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
              {topic.likes} {topic.likes === 1 ? "curtida" : "curtidas"}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Comentários ({topic.comments.length})
          </h3>

          {/* Add Comment Form - Only for logged users */}
          {user && (
            <form
              onSubmit={handleSubmitComment}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="space-y-3">
                <Label htmlFor="comment" className="text-black/80">
                  Adicionar comentário
                </Label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva seu comentário..."
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-black/20 focus:border-black/40 resize-none"
                  rows={3}
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isSubmitting ? "Enviando..." : "Comentar"}
                </Button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {topic.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Seja o primeiro a comentar neste tópico!
              </p>
            ) : (
              topic.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {comment.authorAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-black">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.date} às {comment.time}
                        </span>
                      </div>
                      <div className="text-gray-700 mb-3 leading-relaxed">
                        <MarkdownRenderer content={comment.content} />
                      </div>
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                          comment.isLiked
                            ? "text-red-600 bg-red-50 hover:bg-red-100"
                            : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 14s-5-4-5-8c0-2.5 2-4.5 4.5-4.5C9 1.5 8 3 8 3s-1-1.5 2.5-1.5C13 1.5 15 3.5 15 6c0 4-5 8-5 8z" />
                        </svg>
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
