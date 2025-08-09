import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Image,
  Video,
  Shield,
  Music,
  Code,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
} from "lucide-react";
import { Topic } from "@shared/forum";
import CreateTopicModal from "@/components/CreateTopicModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const forumCategories: ForumCategory[] = [
  {
    id: "ia-hub",
    name: "IA HUB",
    description:
      "Discussões sobre inteligência artificial, machine learning e automação",
    icon: <Brain className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    id: "imagem",
    name: "IMAGEM",
    description: "Geração de imagens, edição e ferramentas visuais com IA",
    icon: <Image className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    id: "video",
    name: "VÍDEO",
    description: "Criação e edição de vídeos com inteligência artificial",
    icon: <Video className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    id: "seguranca",
    name: "SEGURANÇA",
    description: "Cybersecurity, privacidade e proteção de dados",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-red-500",
  },
  {
    id: "musica-audio",
    name: "MÚSICA/ÁUDIO",
    description: "Produção musical e processamento de áudio com IA",
    icon: <Music className="w-6 h-6" />,
    color: "bg-pink-500",
  },
  {
    id: "vibe-coding",
    name: "VIBE CODING",
    description: "Ferramentas de desenvolvimento, IDEs e produtividade",
    icon: <Code className="w-6 h-6" />,
    color: "bg-indigo-500",
  },
];

export default function Forum() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTopics = async (category?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      
      const response = await fetch(`/api/topics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics);
      } else {
        toast.error("Erro ao carregar tópicos");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Erro ao carregar tópicos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicCreated = (newTopic: Topic) => {
    setTopics((prev) => [newTopic, ...prev]);
  };

  const toggleLike = async (topicId: string) => {
    if (!user) {
      toast.error("Faça login para curtir tópicos");
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
        setTopics((prev) =>
          prev.map((topic) =>
            topic.id === topicId
              ? { ...topic, likes: data.likes, isLiked: data.isLiked }
              : topic
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Erro ao curtir tópico");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchTopics(selectedCategory);
    }
  }, [selectedCategory]);

  if (selectedCategory) {
    const category = forumCategories.find((c) => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </Button>
            <div className={`p-2 rounded-lg text-white ${category.color}`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{category.name}</h3>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>

          <CreateTopicModal
            currentCategory={category}
            onTopicCreated={handleTopicCreated}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum tópico encontrado nesta categoria.</p>
                <p className="text-sm mt-2">Seja o primeiro a criar um tópico!</p>
              </div>
            ) : (
              topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{topic.title}</CardTitle>
                          {topic.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Fixado
                            </Badge>
                          )}
                          {topic.isHot && (
                            <Badge
                              variant="destructive"
                              className="text-xs flex items-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" />
                              Hot
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-3">
                          {topic.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Por {topic.author}</span>
                          <span>{formatDate(topic.createdAt)}</span>
                          <span>• {topic.views} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(topic.id)}
                          className={`flex items-center gap-2 ${
                            topic.isLiked
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${topic.isLiked ? "fill-current" : ""}`}
                          />
                          {topic.likes}
                        </Button>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          {topic.replies}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Último post: {topic.lastPost.author} em {topic.lastPost.date} às {topic.lastPost.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">Fórum da Comunidade</h3>
        <p className="text-muted-foreground">
          Participe das discussões mais relevantes da comunidade tech
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forumCategories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg text-white ${category.color}`}>
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tópicos disponíveis
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Discussões ativas
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
