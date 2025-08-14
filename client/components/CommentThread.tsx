import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
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

interface CommentThreadProps {
  comment: Comment;
  topicId: string;
  topicAuthorId: string;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  depth?: number;
  maxDepth?: number;
}

export default function CommentThread({
  comment,
  topicId,
  topicAuthorId,
  onLike,
  onDelete,
  onReply,
  depth = 0,
  maxDepth = 5,
}: CommentThreadProps) {
  const { user, isAdmin } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isTopicOwner = user?.id === topicAuthorId;
  const isCommentOwner = user?.id === comment.authorId;
  const canDelete = isAdmin || isTopicOwner || isCommentOwner;
  const canReply = user && depth < maxDepth;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Digite uma resposta");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      setShowReplies(true); // Mostrar respostas após adicionar uma nova
      toast.success("Resposta adicionada!");
    } catch (error) {
      toast.error("Erro ao adicionar resposta");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = () => {
    const confirmMessage =
      comment.replies && comment.replies.length > 0
        ? "Este comentário tem respostas. Tem certeza que deseja excluir tudo?"
        : "Tem certeza que deseja excluir este comentário?";

    if (confirm(confirmMessage)) {
      onDelete(comment.id);
    }
  };

  // Calcular margem baseada na profundidade com indicadores visuais
  const marginLeft = depth > 0 ? `${Math.min(depth * 1.5, 6)}rem` : "0";
  const showBorder = depth > 0;
  const showArrow = depth > 0;

  return (
    <div
      style={{ marginLeft }}
      className={`${depth > 0 ? "mt-4" : ""} relative`}
    >
      {/* Seta indicadora para respostas */}
      {showArrow && (
        <div className="absolute -left-4 top-6 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </div>
      )}
      <div className={`${showBorder ? "border-l-2 border-gray-200 pl-4" : ""}`}>
        {/* Comment Content */}
        <div
          className={`bg-white rounded-lg border border-gray-100 p-4 shadow-sm ${depth > 0 ? "bg-gray-50/50" : ""}`}
        >
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
                  {comment.date} às {comment.time}
                </span>
              </div>

              <div className="text-gray-700 mb-3 text-sm leading-relaxed">
                <MarkdownRenderer content={comment.content} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    onLike(comment.id);
                    // Add like animation
                    if (!comment.isLiked) {
                      const button = document.getElementById(`heart-thread-${comment.id}`);
                      if (button) {
                        button.classList.add('liked');
                        setTimeout(() => button.classList.remove('liked'), 600);
                      }
                    }
                  }}
                  id={`heart-thread-${comment.id}`}
                  className="heart-button flex items-center gap-1 text-xs transition-all text-gray-600 hover:text-gray-800"
                >
                  <span className={`text-sm transition-all ${
                    comment.isLiked
                      ? ""
                      : "filter grayscale"
                  }`}>❤️</span>
                  {comment.likes}
                </button>

                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
                  >
                    Responder
                  </button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
                  >
                    {showReplies ? "Ocultar" : "Ver"} {comment.replies.length}{" "}
                    resposta{comment.replies.length !== 1 ? "s" : ""}
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                    title={`Excluir comentário ${isAdmin ? "(Admin)" : isTopicOwner ? "(Dono do post)" : "(Seu comentário)"}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && user && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Responder para ${comment.author}...`}
                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-black/20 focus:border-black/40 resize-none text-sm"
                rows={2}
                required
              />
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingReply || !replyContent.trim()}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isSubmittingReply ? "Enviando..." : "Responder"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                topicId={topicId}
                topicAuthorId={topicAuthorId}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
