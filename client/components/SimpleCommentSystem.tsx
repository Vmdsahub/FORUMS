import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import UserHoverCard from "@/components/UserHoverCard";
import RichTextEditor from "@/components/RichTextEditor";

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  topicId: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  quotedComment?: {
    id: string;
    content: string;
    author: string;
    authorId: string;
  };
}

interface SimpleCommentSystemProps {
  topicId: string;
  topicAuthorId: string;
}

// Componente individual do comentário
function CommentItem({
  comment,
  topicAuthorId,
  onLike,
  onDelete,
  onQuote,
}: {
  comment: Comment;
  topicAuthorId: string;
  onLike: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onQuote: (comment: Comment) => void;
}) {
  const { user, isAdmin } = useAuth();

  const isTopicOwner = user?.id === topicAuthorId;
  const isCommentOwner = user?.id === comment.authorId;
  const canDelete = isAdmin || isTopicOwner || isCommentOwner;

  const handleDelete = async () => {
    if (!confirm("Confirma a exclusão?")) return;
    try {
      await onDelete(comment.id);
      toast.success("Comentário excluído!");
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
      {/* Quote exibido se existir */}
      {comment.quotedComment && (
        <div className="mb-3 p-3 bg-gray-50 border-l-4 border-gray-300 rounded">
          <div className="text-xs text-gray-500 mb-1">
            Citando @{comment.quotedComment.author}:
          </div>
          <div className="text-sm text-gray-700 italic line-clamp-3">
            <MarkdownRenderer content={comment.quotedComment.content} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <UserHoverCard
          userId={comment.authorId}
          userName={comment.author}
          userAvatar={comment.authorAvatar}
          isTopicAuthor={comment.authorId === topicAuthorId}
          size="sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
              {comment.authorAvatar}
            </div>
            <span className="text-sm font-medium text-gray-900 hover:text-black cursor-pointer transition-colors text-center">
              {comment.author}
            </span>
          </div>
        </UserHoverCard>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <div className="text-gray-700 mb-3 text-sm leading-relaxed">
            <MarkdownRenderer content={comment.content} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onLike(comment.id)}
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

            {user && (
              <button
                onClick={() => onQuote(comment)}
                className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
              >
                Citar
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                title={`Excluir comentário ${isAdmin ? "(Admin)" : isTopicOwner ? "(Dono do post)" : "(Seu comentário)"}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimpleCommentSystem({ topicId, topicAuthorId }: SimpleCommentSystemProps) {
  const { user } = useAuth();
  const { showBadgeNotification } = useBadgeNotification();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotedComment, setQuotedComment] = useState<Comment | null>(null);

  // Carregar comentários
  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments/${topicId}`);
      if (response.ok) {
        const data = await response.json();
        // Filtra apenas comentários raiz (sem parentId) e ordena por data
        const rootComments = data.comments
          .filter((comment: any) => !comment.parentId)
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(rootComments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [topicId]);

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
        const data = await response.json();
        console.log("[DEBUG] Like response:", data);
        console.log("[DEBUG] newBadge field:", data.newBadge);
        console.log("[DEBUG] typeof newBadge:", typeof data.newBadge);

        // Verificar se o usuário ganhou um novo emblema
        if (data.newBadge) {
          console.log("[DEBUG] New badge earned:", data.newBadge);
          showBadgeNotification(data.newBadge);
        } else {
          console.log("[DEBUG] No new badge in response");
        }

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

  // Criar comentário
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para comentar");
      return;
    }

    // Verificar se há conteúdo real (remover HTML vazio)
    const textContent = newComment.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      toast.error("Digite um comentário");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${topicId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          content: newComment,
          quotedCommentId: quotedComment?.id || null,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setQuotedComment(null);
        await loadComments();
        toast.success("Comentário adicionado!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Erro ao adicionar comentário");
      }
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Citar comentário
  const handleQuote = (comment: Comment) => {
    setQuotedComment(comment);
    // Adicionar foco no campo de comentário
    const textarea = document.querySelector('textarea[placeholder*="comentário"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Carregando comentários...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        Comentários ({comments.length})
      </h3>

      {/* Formulário de novo comentário */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          {/* Quote preview */}
          {quotedComment && (
            <div className="mb-3 p-3 bg-white border border-gray-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Citando @{quotedComment.author}:</span>
                <button
                  type="button"
                  onClick={() => setQuotedComment(null)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remover citação
                </button>
              </div>
              <div className="text-sm text-gray-700 italic line-clamp-2">
                <MarkdownRenderer content={quotedComment.content} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <RichTextEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Escreva seu comentário... Você pode inserir imagens, vídeos e usar formatação rica!"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                Editor rico - suporte a imagens, vídeos, formatação e Markdown
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || !newComment.replace(/<[^>]*>/g, '').trim()}
                className="bg-black text-white hover:bg-black/90"
              >
                {isSubmitting ? "Enviando..." : "Comentar"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de comentários */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum comentário ainda.</p>
          {!user && (
            <p className="text-sm text-gray-400 mt-2">
              Faça login para ser o primeiro a comentar!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              topicAuthorId={topicAuthorId}
              onLike={handleLike}
              onDelete={handleDelete}
              onQuote={handleQuote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
