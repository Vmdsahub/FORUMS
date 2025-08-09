import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Image,
  Video,
  Shield,
  Music,
  Code,
  Plus,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
} from "lucide-react";

interface Subtopic {
  id: string;
  title: string;
  description: string;
  author: string;
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
}

interface ForumTopic {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  subtopics: Subtopic[];
}

const mockForumData: ForumTopic[] = [
  {
    id: "ia-hub",
    name: "IA HUB",
    description:
      "Discussões sobre inteligência artificial, machine learning e automação",
    icon: <Brain className="w-6 h-6" />,
    color: "bg-blue-500",
    subtopics: [
      {
        id: "chatgpt-tips",
        title: "ChatGPT: Dicas e Prompts Avançados",
        description:
          "Compartilhe suas melhores práticas e prompts para obter resultados incríveis",
        author: "TechGuru",
        likes: 45,
        comments: 23,
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "claude-vs-gpt",
        title: "Claude vs GPT-4: Qual é melhor?",
        description:
          "Comparativo detalhado entre os principais modelos de IA do mercado",
        author: "AIExpert",
        likes: 32,
        comments: 18,
        createdAt: "2024-01-14T15:45:00Z",
      },
      {
        id: "ml-beginners",
        title: "Machine Learning para Iniciantes",
        description: "Guia completo para quem está começando na área de ML",
        author: "DataScientist",
        likes: 28,
        comments: 12,
        createdAt: "2024-01-13T09:20:00Z",
      },
    ],
  },
  {
    id: "imagem",
    name: "IMAGEM",
    description: "Geração de imagens, edição e ferramentas visuais com IA",
    icon: <Image className="w-6 h-6" />,
    color: "bg-green-500",
    subtopics: [
      {
        id: "midjourney-guide",
        title: "Midjourney: Guia Completo 2024",
        description:
          "Tudo que você precisa saber sobre a ferramenta de geração de imagens",
        author: "VisualArt",
        likes: 67,
        comments: 34,
        createdAt: "2024-01-15T14:20:00Z",
      },
      {
        id: "dall-e-vs-midjourney",
        title: "DALL-E vs Midjourney: Comparativo",
        description:
          "Análise detalhada das principais ferramentas de geração de imagem",
        author: "CreativeAI",
        likes: 41,
        comments: 19,
        createdAt: "2024-01-14T11:30:00Z",
      },
      {
        id: "stable-diffusion",
        title: "Stable Diffusion Local Setup",
        description: "Como configurar o Stable Diffusion na sua máquina",
        author: "TechSetup",
        likes: 35,
        comments: 15,
        createdAt: "2024-01-13T16:45:00Z",
      },
    ],
  },
  {
    id: "video",
    name: "VÍDEO",
    description: "Criação e ediç��o de vídeos com inteligência artificial",
    icon: <Video className="w-6 h-6" />,
    color: "bg-purple-500",
    subtopics: [
      {
        id: "runway-tips",
        title: "Runway ML: Dicas de Produção",
        description: "Como criar vídeos profissionais usando Runway ML",
        author: "VideoMaker",
        likes: 38,
        comments: 21,
        createdAt: "2024-01-15T12:10:00Z",
      },
      {
        id: "pika-labs",
        title: "Pika Labs: Primeiras Impressões",
        description: "Review completo da nova ferramenta de geração de vídeos",
        author: "ContentCreator",
        likes: 29,
        comments: 14,
        createdAt: "2024-01-14T08:30:00Z",
      },
    ],
  },
  {
    id: "seguranca",
    name: "SEGURANÇA",
    description: "Cybersecurity, privacidade e proteção de dados",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-red-500",
    subtopics: [
      {
        id: "password-managers",
        title: "Melhores Gerenciadores de Senha 2024",
        description:
          "Análise dos principais gerenciadores de senha disponíveis",
        author: "SecurityPro",
        likes: 52,
        comments: 27,
        createdAt: "2024-01-15T09:45:00Z",
      },
      {
        id: "vpn-guide",
        title: "VPN: Guia Completo de Escolha",
        description: "Como escolher a VPN ideal para suas necessidades",
        author: "PrivacyAdvocate",
        likes: 44,
        comments: 22,
        createdAt: "2024-01-14T13:20:00Z",
      },
    ],
  },
  {
    id: "musica-audio",
    name: "MÚSICA/ÁUDIO",
    description: "Produção musical e processamento de áudio com IA",
    icon: <Music className="w-6 h-6" />,
    color: "bg-pink-500",
    subtopics: [
      {
        id: "suno-ai",
        title: "Suno AI: Criando Músicas Incríveis",
        description: "Tutorial completo para gerar músicas profissionais",
        author: "MusicProducer",
        likes: 36,
        comments: 18,
        createdAt: "2024-01-15T11:15:00Z",
      },
      {
        id: "udio-review",
        title: "Udio: Review da Nova Ferramenta",
        description: "Análise completa da plataforma de geração musical",
        author: "AudioEngineer",
        likes: 24,
        comments: 11,
        createdAt: "2024-01-13T14:30:00Z",
      },
    ],
  },
  {
    id: "vibe-coding",
    name: "VIBE CODING",
    description: "Ferramentas de desenvolvimento, IDEs e produtividade",
    icon: <Code className="w-6 h-6" />,
    color: "bg-indigo-500",
    subtopics: [
      {
        id: "cursor-review",
        title: "Cursor: O Futuro do Desenvolvimento",
        description:
          "Review completo do editor que está revolucionando o coding",
        author: "DevMaster",
        likes: 78,
        comments: 42,
        createdAt: "2024-01-15T16:20:00Z",
      },
      {
        id: "claude-code",
        title: "Claude Code: Minha Experiência",
        description: "Como o Claude está mudando minha forma de programar",
        author: "FullStackDev",
        likes: 56,
        comments: 31,
        createdAt: "2024-01-14T10:45:00Z",
      },
      {
        id: "github-copilot",
        title: "GitHub Copilot vs Cursor",
        description: "Comparativo entre as principais ferramentas de AI coding",
        author: "CodeReviewer",
        likes: 49,
        comments: 25,
        createdAt: "2024-01-13T12:15:00Z",
      },
    ],
  },
];

export default function Forum() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [subtopics, setSubtopics] = useState<{ [topicId: string]: Subtopic[] }>(
    () => {
      const initial: { [topicId: string]: Subtopic[] } = {};
      mockForumData.forEach((topic) => {
        initial[topic.id] = [...topic.subtopics].sort(
          (a, b) => b.likes - a.likes,
        );
      });
      return initial;
    },
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSubtopic, setNewSubtopic] = useState({
    title: "",
    description: "",
  });

  const toggleLike = (topicId: string, subtopicId: string) => {
    setSubtopics((prev) => ({
      ...prev,
      [topicId]: prev[topicId]
        .map((subtopic) => {
          if (subtopic.id === subtopicId) {
            const newLikes = subtopic.liked
              ? subtopic.likes - 1
              : subtopic.likes + 1;
            return { ...subtopic, likes: newLikes, liked: !subtopic.liked };
          }
          return subtopic;
        })
        .sort((a, b) => b.likes - a.likes),
    }));
  };

  const createSubtopic = () => {
    if (!selectedTopic || !newSubtopic.title.trim()) return;

    const topic = mockForumData.find((t) => t.id === selectedTopic);
    if (!topic) return;

    const newSub: Subtopic = {
      id: `new-${Date.now()}`,
      title: newSubtopic.title,
      description: newSubtopic.description,
      author: "Você",
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    setSubtopics((prev) => ({
      ...prev,
      [selectedTopic]: [newSub, ...prev[selectedTopic]].sort(
        (a, b) => b.likes - a.likes,
      ),
    }));

    setNewSubtopic({ title: "", description: "" });
    setIsCreateOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (selectedTopic) {
    const topic = mockForumData.find((t) => t.id === selectedTopic);
    if (!topic) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedTopic(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </Button>
            <div className={`p-2 rounded-lg text-white ${topic.color}`}>
              {topic.icon}
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{topic.name}</h3>
              <p className="text-muted-foreground">{topic.description}</p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Criar Subtópico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Subtópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newSubtopic.title}
                    onChange={(e) =>
                      setNewSubtopic((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Digite o título do subtópico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newSubtopic.description}
                    onChange={(e) =>
                      setNewSubtopic((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descreva o subtópico"
                    rows={3}
                  />
                </div>
                <Button onClick={createSubtopic} className="w-full">
                  Criar Subtópico
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {subtopics[selectedTopic]?.map((subtopic) => (
            <Card
              key={subtopic.id}
              className="hover:shadow-md transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {subtopic.title}
                    </CardTitle>
                    <CardDescription className="mb-3">
                      {subtopic.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Por {subtopic.author}</span>
                      <span>{formatDate(subtopic.createdAt)}</span>
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
                      onClick={() => toggleLike(selectedTopic, subtopic.id)}
                      className={`flex items-center gap-2 ${
                        subtopic.liked
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${subtopic.liked ? "fill-current" : ""}`}
                      />
                      {subtopic.likes}
                    </Button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {subtopic.comments}
                    </div>
                  </div>
                  {subtopic.likes > 30 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Popular
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
        {mockForumData.map((topic) => (
          <Card
            key={topic.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedTopic(topic.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg text-white ${topic.color}`}>
                  {topic.icon}
                </div>
                <CardTitle className="text-xl">{topic.name}</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {topic.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {topic.subtopics.length} subtópicos
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {topic.subtopics.reduce((acc, sub) => acc + sub.likes, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
