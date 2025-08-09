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
import RichTextEditor from "@/components/RichTextEditor";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

interface CreateTopicModalProps {
  currentCategory: ForumCategory;
  onTopicCreated?: (newTopic: any) => void;
}

export default function CreateTopicModal({ categories, onTopicCreated }: CreateTopicModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para criar tópicos");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim() || !formData.category) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Tópico criado com sucesso!");
        setFormData({ title: "", description: "", content: "", category: "" });
        setIsOpen(false);
        onTopicCreated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao criar tópico");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Erro ao criar tópico");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <DialogContent className="sm:max-w-2xl glass-minimal border border-black/10">
        <DialogHeader>
          <DialogTitle className="text-black">Criar Novo Tópico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-black/80">
              Categoria
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="border-black/20 focus:border-black/40">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-black/80">
              Título
            </Label>
            <Input
              id="title"
              placeholder="Digite o título do tópico"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="border-black/20 focus:border-black/40"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black/80">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Breve descrição do tópico"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="border-black/20 focus:border-black/40"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/200 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-black/80">
              Conteúdo
            </Label>
            <textarea
              id="content"
              placeholder="Descreva seu tópico em detalhes..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className="w-full p-3 border border-black/20 rounded-md focus:ring-2 focus:ring-black/20 focus:border-black/40 resize-none min-h-[120px]"
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500">
              {formData.content.length}/2000 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-black/90 font-medium"
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
