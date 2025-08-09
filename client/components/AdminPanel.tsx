import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Topic } from "@shared/forum";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Edit,
  Settings,
  Users,
  FileText,
  Newspaper,
} from "lucide-react";

interface NewsletterTopic {
  id: number;
  title: string;
  content: string;
  readTime: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"categories" | "topics" | "newsletters">("categories");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories] = useState<ForumCategory[]>([
    { id: "ia-hub", name: "IA HUB", description: "Discussões sobre inteligência artificial" },
    { id: "imagem", name: "IMAGEM", description: "Geração de imagens e ferramentas visuais" },
    { id: "video", name: "VÍDEO", description: "Criação e edição de vídeos" },
    { id: "seguranca", name: "SEGURANÇA", description: "Cybersecurity e privacidade" },
    { id: "musica-audio", name: "MÚSICA/ÁUDIO", description: "Produção musical e áudio" },
    { id: "vibe-coding", name: "VIBE CODING", description: "Ferramentas de desenvolvimento" },
  ]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newNewsletter, setNewNewsletter] = useState({ title: "", content: "", readTime: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAllTopics();
    }
  }, [isAdmin]);

  const fetchAllTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
        toast.success("Tópico excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir tópico");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Erro ao excluir tópico");
    }
  };

  const createCategory = () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    // Em um app real, isso seria uma chamada à API
    toast.success("Categoria criada! (Demo - não persistente)");
    setNewCategory({ name: "", description: "" });
  };

  const deleteCategory = (categoryId: string) => {
    // Em um app real, isso seria uma chamada à API
    toast.success("Categoria excluída! (Demo - não persistente)");
  };

  const createNewsletter = () => {
    if (!newNewsletter.title.trim() || !newNewsletter.content.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    // Em um app real, isso seria uma chamada à API
    toast.success("Newsletter criada! (Demo - não persistente)");
    setNewNewsletter({ title: "", content: "", readTime: "" });
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Painel de Administração</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}! Gerencie o conteúdo da plataforma.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "categories"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Categorias
        </button>
        <button
          onClick={() => setActiveTab("topics")}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "topics"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Tópicos
        </button>
        <button
          onClick={() => setActiveTab("newsletters")}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "newsletters"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Newspaper className="w-4 h-4 inline mr-2" />
          Newsletters
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gerenciar Categorias</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="cat-name">Nome</Label>
                        <Input
                          id="cat-name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          placeholder="Nome da categoria"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-desc">Descrição</Label>
                        <Textarea
                          id="cat-desc"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          placeholder="Descrição da categoria"
                          rows={3}
                        />
                      </div>
                      <Button onClick={createCategory} className="w-full">
                        Criar Categoria
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === "topics" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Tópicos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p>Carregando tópicos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{topic.title}</h3>
                          <Badge variant="secondary">{topic.category}</Badge>
                          {topic.isPinned && <Badge>Fixado</Badge>}
                          {topic.isHot && <Badge variant="destructive">Hot</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                        <div className="text-xs text-gray-500">
                          Por {topic.author} • {topic.replies} respostas • {topic.views} visualizações
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Tópico</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o tópico "{topic.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTopic(topic.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                  {topics.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum tópico encontrado.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Newsletters Tab */}
      {activeTab === "newsletters" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gerenciar Newsletters</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Newsletter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Newsletter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="news-title">Título</Label>
                        <Input
                          id="news-title"
                          value={newNewsletter.title}
                          onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                          placeholder="Título da newsletter"
                        />
                      </div>
                      <div>
                        <Label htmlFor="news-content">Conteúdo</Label>
                        <Textarea
                          id="news-content"
                          value={newNewsletter.content}
                          onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
                          placeholder="Conteúdo da newsletter"
                          rows={8}
                        />
                      </div>
                      <div>
                        <Label htmlFor="news-time">Tempo de Leitura</Label>
                        <Input
                          id="news-time"
                          value={newNewsletter.readTime}
                          onChange={(e) => setNewNewsletter({ ...newNewsletter, readTime: e.target.value })}
                          placeholder="ex: 10 min"
                        />
                      </div>
                      <Button onClick={createNewsletter} className="w-full">
                        Criar Newsletter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Gerenciamento de newsletters em desenvolvimento.</p>
                <p className="text-sm mt-2">Use o botão "Nova Newsletter" para adicionar conteúdo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
