import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  repliesCount?: number;
}

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
  topicId: string;
  onReplyAdded: () => void;
}

export default function ReplyModal({
  isOpen,
  onClose,
  comment,
  topicId,
  onReplyAdded,
}: ReplyModalProps) {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${topicId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          content: replyContent,
          parentId: comment.id,
        }),
      });

      if (response.ok) {
        setReplyContent("");
        onClose();
        onReplyAdded();
        toast.success("Resposta adicionada!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Erro ao responder");
      }
    } catch (error) {
      console.error("Erro ao responder:", error);
      toast.error("Erro de conexão - tente novamente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReplyContent("");
      onClose();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl bg-white border border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-gray-900 text-xl font-semibold">
            Respondendo a {comment.author}
          </DialogTitle>
        </DialogHeader>

        {/* Comentário original */}
        <div className="py-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {comment.authorAvatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-black text-sm">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed ml-11">
              <MarkdownRenderer content={comment.content} />
            </div>
          </div>
        </div>

        {/* Formulário de resposta */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-900 font-medium">Sua Resposta</Label>
            <RichTextEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder={`Responder para ${comment.author}... Use as ferramentas acima para formatar o texto, adicionar imagens e vídeos.`}
            />
            <p className="text-xs text-gray-500">
              {replyContent.length} caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 text-white hover:bg-gray-800 font-medium"
              disabled={isSubmitting || !replyContent.trim()}
            >
              {isSubmitting ? "Enviando..." : "Responder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
