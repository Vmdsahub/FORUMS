import { RequestHandler } from "express";
import { z } from "zod";
import { Topic, Comment, CreateTopicRequest, CreateCommentRequest, LikeResponse } from "@shared/forum";

// Simple in-memory storage for demo purposes
const topics: Map<string, Topic> = new Map();
const comments: Map<string, Comment> = new Map();
const likes: Map<string, Set<string>> = new Map(); // entityId -> Set of userIds

// Validation schemas
const createTopicSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  category: z.string().min(1),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function formatDate(): { date: string; time: string } {
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function getUserInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function isLikedBy(entityId: string, userId: string): boolean {
  return likes.get(entityId)?.has(userId) || false;
}

function getLikeCount(entityId: string): number {
  return likes.get(entityId)?.size || 0;
}

function toggleLike(entityId: string, userId: string): LikeResponse {
  if (!likes.has(entityId)) {
    likes.set(entityId, new Set());
  }
  
  const entityLikes = likes.get(entityId)!;
  const wasLiked = entityLikes.has(userId);
  
  if (wasLiked) {
    entityLikes.delete(userId);
  } else {
    entityLikes.add(userId);
  }
  
  return {
    likes: entityLikes.size,
    isLiked: !wasLiked
  };
}

// Create some demo topics
function initializeDemoData() {
  const demoTopics = [
    {
      id: "1",
      title: "Midjourney vs DALL-E 3: Comparativo de qualidade",
      description: "Teste side-by-side das principais ferramentas de geração de imagem",
      content: "Pessoal, fiz alguns testes comparativos entre o Midjourney v6 e o DALL-E 3 para entender qual produz melhores resultados.\n\nPrincipais diferenças que notei:\n\n**Midjourney v6:**\n- Melhor para arte conceitual e estilos artísticos\n- Interface no Discord pode ser confusa\n- Resultados mais consistentes em prompts complexos\n\n**DALL-E 3:**\n- Melhor integração com ChatGPT\n- Mais preciso para descrições textuais\n- Interface web mais intuitiva\n\nO que vocês acham? Qual preferem usar?",
      author: "VisualAI",
      authorId: "user_visual_ai",
      authorAvatar: "VA",
      category: "imagem",
      replies: 56,
      views: 1823,
      likes: 42,
      isLiked: false,
      lastPost: { author: "CreativeAI", date: "Hoje", time: "11:45" },
      isHot: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "2",
      title: "Stable Diffusion XL: Novidades e melhorias",
      description: "Análise das novas funcionalidades do SDXL",
      content: "O Stable Diffusion XL trouxe várias melhorias significativas:\n\n1. **Resolução nativa 1024x1024**: Muito melhor que os 512x512 do modelo original\n2. **Modelo de refino**: Permite melhorar os detalhes das imagens geradas\n3. **Melhor compreensão de texto**: Prompts mais complexos funcionam melhor\n4. **Controle de aspectos**: Diferentes proporções funcionam melhor\n\nTestei bastante e os resultados são impressionantes. Alguém mais teve experiências similares?",
      author: "ImageGen",
      authorId: "user_image_gen",
      authorAvatar: "IG",
      category: "imagem",
      replies: 28,
      views: 945,
      likes: 23,
      isLiked: false,
      lastPost: { author: "AIArtist", date: "Hoje", time: "10:30" },
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    }
  ];

  demoTopics.forEach(topic => {
    topics.set(topic.id, topic as Topic);
  });

  // Add some demo comments
  const demoComments = [
    {
      id: "c1",
      content: "Excelente comparativo! Eu uso mais o Midjourney para conceitos artísticos, mas o DALL-E 3 é realmente superior para prompts descritivos.",
      author: "CreativeAI",
      authorId: "user_creative_ai", 
      authorAvatar: "CA",
      date: "Hoje",
      time: "11:45",
      likes: 8,
      isLiked: false,
      topicId: "1"
    },
    {
      id: "c2",
      content: "Concordo! O SDXL é um salto gigante. A qualidade das imagens é impressionante, especialmente com o modelo de refino.",
      author: "AIArtist",
      authorId: "user_ai_artist",
      authorAvatar: "AA", 
      date: "Hoje",
      time: "10:30",
      likes: 5,
      isLiked: false,
      topicId: "2"
    }
  ];

  demoComments.forEach(comment => {
    comments.set(comment.id, comment as Comment);
    const topic = topics.get(comment.topicId);
    if (topic) {
      topic.comments.push(comment as Comment);
    }
  });
}

// Initialize demo data
initializeDemoData();

// Route handlers
export const handleGetTopics: RequestHandler = (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;

  let filteredTopics = Array.from(topics.values());
  
  if (category) {
    filteredTopics = filteredTopics.filter(topic => topic.category === category);
  }

  // Sort by pinned first, then by creation date (newest first)
  filteredTopics.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTopics = filteredTopics.slice(startIndex, endIndex);

  // Remove content and comments for list view
  const topicsForList = paginatedTopics.map(({ content, comments, ...topic }) => topic);

  res.json({
    topics: topicsForList,
    total: filteredTopics.length,
    page,
    limit
  });
};

export const handleGetTopic: RequestHandler = (req, res) => {
  const { topicId } = req.params;
  const topic = topics.get(topicId);

  if (!topic) {
    return res.status(404).json({ message: "Tópico não encontrado" });
  }

  // Increment views
  topic.views += 1;

  // Check if user liked this topic
  const userId = req.user?.id;
  if (userId) {
    topic.isLiked = isLikedBy(topicId, userId);
    topic.likes = getLikeCount(topicId);
    
    // Update comments with like status
    topic.comments = topic.comments.map(comment => ({
      ...comment,
      isLiked: isLikedBy(comment.id, userId),
      likes: getLikeCount(comment.id)
    }));
  }

  res.json(topic);
};

export const handleCreateTopic: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  try {
    const data = createTopicSchema.parse(req.body);
    const { date, time } = formatDate();
    
    const newTopic: Topic = {
      id: generateId(),
      title: data.title,
      description: data.description,
      content: data.content,
      author: req.user.name,
      authorId: req.user.id,
      authorAvatar: getUserInitials(req.user.name),
      category: data.category,
      replies: 0,
      views: 0,
      likes: 0,
      isLiked: false,
      lastPost: {
        author: req.user.name,
        date,
        time
      },
      isPinned: false,
      isHot: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    topics.set(newTopic.id, newTopic);
    res.status(201).json(newTopic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: error.errors.map(e => e.message)
      });
    }
    
    console.error('Create topic error:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const handleCreateComment: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const { topicId } = req.params;
  const topic = topics.get(topicId);

  if (!topic) {
    return res.status(404).json({ message: "Tópico não encontrado" });
  }

  try {
    const data = createCommentSchema.parse(req.body);
    const { date, time } = formatDate();
    
    const newComment: Comment = {
      id: generateId(),
      content: data.content,
      author: req.user.name,
      authorId: req.user.id,
      authorAvatar: getUserInitials(req.user.name),
      date,
      time,
      likes: 0,
      isLiked: false,
      topicId
    };

    comments.set(newComment.id, newComment);
    topic.comments.push(newComment);
    topic.replies += 1;
    topic.lastPost = {
      author: req.user.name,
      date,
      time
    };
    topic.updatedAt = new Date().toISOString();

    res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: error.errors.map(e => e.message)
      });
    }
    
    console.error('Create comment error:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const handleLikeTopic: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const { topicId } = req.params;
  const topic = topics.get(topicId);

  if (!topic) {
    return res.status(404).json({ message: "Tópico não encontrado" });
  }

  const likeResult = toggleLike(topicId, req.user.id);
  topic.likes = likeResult.likes;
  topic.isLiked = likeResult.isLiked;

  res.json(likeResult);
};

export const handleLikeComment: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const { commentId } = req.params;
  const comment = comments.get(commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comentário não encontrado" });
  }

  const likeResult = toggleLike(commentId, req.user.id);
  comment.likes = likeResult.likes;
  comment.isLiked = likeResult.isLiked;

  res.json(likeResult);
};
