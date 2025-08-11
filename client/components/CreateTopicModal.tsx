import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Topic } from "@shared/forum";
import RichTextEditor from "@/components/RichTextEditor";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

interface CreateTopicModalProps {
  currentCategory: ForumCategory;
  onTopicCreated?: (newTopic: Topic) => void;
  onStatsRefresh?: () => void;
}

export default function CreateTopicModal({
  currentCategory,
  onTopicCreated,
  onStatsRefresh,
}: CreateTopicModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.url;
      }
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para criar tópicos");
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = null;

      // Upload do avatar se foi selecionado
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const topicData = {
        ...formData,
        category: currentCategory.id,
        avatarUrl,
      };

      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(topicData),
      });

      if (response.ok) {
        const newTopic = await response.json();
        console.log("Tópico criado:", newTopic);
        toast.success("Tópico criado com sucesso!");
        setFormData({ title: "", description: "", content: "" });
        setIsOpen(false);
        onTopicCreated?.(newTopic);
        onStatsRefresh?.(); // Refresh category statistics
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido" }));
        console.error("Erro ao criar tópico:", errorData);
        toast.error(errorData.message || "Erro ao criar tópico");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Erro ao criar tópico");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-black/90 font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="mr-2"
          >
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM8 3a1 1 0 0 0-1 1v3H4a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0V9h3a1 1 0 1 0 0-2H9V4a1 1 0 0 0-1-1z" />
          </svg>
          Criar Tópico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-white border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold">
            Criar Novo Tópico em {currentCategory.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <strong className="text-gray-900">Categoria:</strong>{" "}
              {currentCategory.name} - {currentCategory.description}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900 font-medium">
              Título
            </Label>
            <Input
              id="title"
              placeholder="Digite o título do tópico"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Breve descrição do tópico"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/200 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 font-medium">Conteúdo</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleInputChange("content", value)}
              placeholder="Descreva seu tópico em detalhes... Use as ferramentas acima para formatar o texto, adicionar imagens e vídeos."
            />
            <p className="text-xs text-gray-500">
              {formData.content.length} caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 text-white hover:bg-gray-800 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Tópico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
