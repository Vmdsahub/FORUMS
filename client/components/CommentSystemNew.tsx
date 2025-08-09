import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import UserPointsBadge from "@/components/UserPointsBadge";
import ReplyModal from "@/components/ReplyModal";

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  topicId: string;
  parentId: string | null;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  repliesCount?: number;
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  topicId: string;
  topicAuthorId: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReloadComments: () => Promise<void>;
}

// COMPONENTE INDIVIDUAL DE COMENTÁRIO
function CommentItem({
  comment,
  depth,
  topicId,
  topicAuthorId,
  onReply,
  onLike,
  onDelete,
  onReloadComments,
}: CommentItemProps) {
  const { user, isAdmin } = useAuth();
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isTopicOwner = user?.id === topicAuthorId;
  const isCommentOwner = user?.id === comment.authorId;
  const canDelete = isAdmin || isTopicOwner || isCommentOwner;
  const canReply = user; // Sem limite de profundidade

  const handleReplyAdded = async () => {
    await onReloadComments();
    setShowReplies(true);
  };

  const handleDelete = async () => {
    if (!confirm("Confirma a exclusão?")) return;
    try {
      await onDelete(comment.id);
      toast.success("Comentário excluído!");
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  // Calcular indentação baseada na profundidade (máximo 8 níveis visuais)
  const indentationClass = depth === 0 ? "" : `ml-${Math.min(depth * 4, 32)}`;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const actualRepliesCount = comment.replies ? comment.replies.length : (comment.repliesCount || 0);

  return (
    <div className={`${indentationClass} ${depth > 0 ? "mt-4" : ""}`}>
      {/* Linha vertical para mostrar hierarquia */}
      {depth > 0 && (
        <div className="border-l-2 border-gray-200 pl-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <CommentContent
              comment={comment}
              topicAuthorId={topicAuthorId}
              canReply={canReply}
              canDelete={canDelete}
              onLike={() => onLike(comment.id)}
              onDelete={handleDelete}
              onShowReply={() => setShowReplyModal(true)}
              hasReplies={hasReplies}
              showReplies={showReplies}
              onToggleReplies={() => setShowReplies(!showReplies)}
              actualRepliesCount={actualRepliesCount}
            />
          </div>
        </div>
      )}

      {/* Comentário raiz (sem indentação) */}
      {depth === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <CommentContent
            comment={comment}
            topicAuthorId={topicAuthorId}
            canReply={canReply}
            canDelete={canDelete}
            onLike={() => onLike(comment.id)}
            onDelete={handleDelete}
            onShowReply={() => setShowReplyModal(true)}
            hasReplies={hasReplies}
            showReplies={showReplies}
            onToggleReplies={() => setShowReplies(!showReplies)}
            actualRepliesCount={actualRepliesCount}
          />
        </div>
      )}

      {/* Modal de resposta */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        comment={comment}
        topicId={topicId}
        onReplyAdded={handleReplyAdded}
      />

      {/* Respostas aninhadas */}
      {showReplies && hasReplies && (
        <div className="mt-3">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              topicId={topicId}
              topicAuthorId={topicAuthorId}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              onReloadComments={onReloadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// COMPONENTE DO CONTEÚDO DO COMENTÁRIO (reutilizável)
function CommentContent({
  comment,
  topicAuthorId,
  canReply,
  canDelete,
  onLike,
  onDelete,
  onShowReply,
  hasReplies,
  showReplies,
  onToggleReplies,
  actualRepliesCount,
}: {
  comment: Comment;
  topicAuthorId: string;
  canReply: boolean;
  canDelete: boolean;
  onLike: () => void;
  onDelete: () => void;
  onShowReply: () => void;
  hasReplies: boolean;
  showReplies: boolean;
  onToggleReplies: () => void;
  actualRepliesCount: number;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("pt-BR") +
      " às " +
      date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {comment.authorAvatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-medium text-black text-sm">
            {comment.author}
          </span>
          <UserPointsBadge userId={comment.authorId} size="sm" />
          {comment.authorId === topicAuthorId && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Autor
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <div className="text-gray-700 mb-3 text-sm leading-relaxed">
          <MarkdownRenderer content={comment.content} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onLike}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
              comment.isLiked
                ? "text-red-600 bg-red-50 hover:bg-red-100"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 14s-5-4-5-8c0-2.5 2-4.5 4.5-4.5C9 1.5 8 3 8 3s-1-1.5 2.5-1.5C13 1.5 15 3.5 15 6c0 4-5 8-5 8z" />
            </svg>
            {comment.likes}
          </button>

          {canReply && (
            <button
              onClick={onShowReply}
              className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
            >
              Responder
            </button>
          )}

          {hasReplies && (
            <button
              onClick={onToggleReplies}
              className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
            >
              {showReplies ? "Ocultar" : "Ver"} {actualRepliesCount} resposta
              {actualRepliesCount !== 1 ? "s" : ""}
            </button>
          )}

          {canDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              title="Excluir comentário"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// COMPONENTE PRINCIPAL DO SISTEMA DE COMENTÁRIOS
interface CommentSystemProps {
  topicId: string;
  topicAuthorId: string;
}

export default function CommentSystemNew({
  topicId,
  topicAuthorId,
}: CommentSystemProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "unknown">(
    "unknown",
  );

  // Carregar comentários com retry e fallback
  const loadComments = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      console.log(
        `[COMMENTS] Tentativa ${retryCount + 1} - Carregando comentários para tópico: ${topicId}`,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`/api/comments/${topicId}`, {
        headers: user
          ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
          : {},
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setApiStatus("online");
        console.log(
          `[COMMENTS] Carregados ${data.comments?.length || 0} comentários`,
        );
      } else {
        console.error(`Erro na requisição: ${response.status}`);
        if (retryCount < 2) {
          console.log(`[COMMENTS] Tentando novamente em 2s...`);
          setTimeout(() => loadComments(retryCount + 1), 2000);
        } else {
          toast.error("Erro ao carregar comentários");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);

      if (retryCount < 2 && error.name !== "AbortError") {
        console.log(`[COMMENTS] Tentando novamente em 2s...`);
        setTimeout(() => loadComments(retryCount + 1), 2000);
      } else {
        // Fallback: mostrar comentários demo quando API falha
        const fallbackComments = [
          {
            id: "fallback1",
            content:
              "Sistema de comentários temporariamente indisponível. Este é um comentário de exemplo.",
            author: "Sistema",
            authorId: "system",
            authorAvatar: "SI",
            topicId: topicId,
            parentId: null,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false,
            replies: [],
            repliesCount: 0,
          },
        ];
        setComments(fallbackComments);
        setApiStatus("offline");
        console.warn("[COMMENTS] Usando fallback - comentários demo");
        toast.info("Comentários carregados em modo offline");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [topicId]);

  // Adicionar comentário principal com retry
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/comments/${topicId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ content: newComment, parentId: null }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setNewComment("");
        await loadComments(); // Recarregar para mostrar novo comentário
        toast.success("Comentário adicionado!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Erro ao adicionar comentário");
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      if (error.name === "AbortError") {
        toast.error("Timeout - tente novamente");
      } else {
        toast.error("Erro de conexão - tente novamente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Responder comentário com timeout
  const handleReply = async (parentId: string, content: string) => {
    if (!user) throw new Error("Login necessário");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`/api/comments/${topicId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ content, parentId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        await loadComments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao responder");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Timeout - tente novamente");
      }
      throw error;
    }
  };

  // Curtir comentário
  const handleLike = async (commentId: string) => {
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
        await loadComments();
      }
    } catch (error) {
      toast.error("Erro ao curtir");
    }
  };

  // Deletar comentário
  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        await loadComments();
      } else {
        const data = await response.json();
        toast.error(data.message || "Erro ao excluir");
      }
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
        <p className="text-gray-600">Carregando comentários...</p>
        <p className="text-xs text-gray-400 mt-2">Tópico: {topicId}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">
          Comentários ({comments.length})
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              apiStatus === "online"
                ? "bg-green-500"
                : apiStatus === "offline"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }`}
          ></div>
          <span className="text-xs text-gray-500">
            {apiStatus === "online"
              ? "Online"
              : apiStatus === "offline"
                ? "Offline"
                : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Formulário para novo comentário */}
      {user && (
        <form
          onSubmit={handleAddComment}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="space-y-3">
            <label className="text-black/80 text-sm font-medium">
              Adicionar comentário
            </label>
            <textarea
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

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Seja o primeiro a comentar neste tópico!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              topicId={topicId}
              topicAuthorId={topicAuthorId}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={handleDelete}
              onReloadComments={loadComments}
            />
          ))
        )}
      </div>
    </div>
  );
}
