import { RequestHandler } from "express";
import { z } from "zod";

// Interface simples para comentários
interface SimpleComment {
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
  replies?: SimpleComment[];
  repliesCount?: number;
}

// Storage simples em memória
const comments = new Map<string, SimpleComment>();
const topicComments = new Map<string, string[]>(); // topicId -> commentIds
const commentLikes = new Map<string, Set<string>>(); // commentId -> userIds

// Schema de validação
const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().nullable().optional(),
});

// Helpers
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Função para construir árvore de comentários
function buildCommentTree(topicId: string, userId?: string): SimpleComment[] {
  const commentIds = topicComments.get(topicId) || [];
  
  if (commentIds.length === 0) return [];
  
  // Buscar todos os comentários
  const allComments: SimpleComment[] = [];
  commentIds.forEach(id => {
    const comment = comments.get(id);
    if (comment) {
      const likes = commentLikes.get(id)?.size || 0;
      const isLiked = userId ? (commentLikes.get(id)?.has(userId) || false) : false;
      
      allComments.push({
        ...comment,
        likes,
        isLiked,
      });
    }
  });
  
  // Separar comentários raiz dos replies
  const rootComments = allComments.filter(c => !c.parentId);
  const replyComments = allComments.filter(c => c.parentId);
  
  // Ordenar por data
  const sortByDate = (a: SimpleComment, b: SimpleComment) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  };
  
  rootComments.sort(sortByDate);
  
  // Construir estrutura hierárquica
  const result: SimpleComment[] = [];
  
  rootComments.forEach(comment => {
    const commentWithReplies: SimpleComment = {
      ...comment,
      replies: [],
      repliesCount: 0
    };
    
    // Encontrar replies diretos
    const directReplies = replyComments.filter(r => r.parentId === comment.id);
    directReplies.sort(sortByDate);
    
    directReplies.forEach(reply => {
      const replyWithSubReplies: SimpleComment = {
        ...reply,
        replies: [],
        repliesCount: 0
      };
      
      // Encontrar sub-replies
      const subReplies = replyComments.filter(sr => sr.parentId === reply.id);
      subReplies.sort(sortByDate);
      
      replyWithSubReplies.replies = subReplies.map(sr => ({
        ...sr,
        replies: [],
        repliesCount: 0
      }));
      replyWithSubReplies.repliesCount = subReplies.length;
      
      commentWithReplies.replies!.push(replyWithSubReplies);
    });
    
    commentWithReplies.repliesCount = directReplies.length;
    result.push(commentWithReplies);
  });
  
  return result;
}

// Handlers da API
export const getComments: RequestHandler = (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user?.id;
    
    console.log(`[COMMENTS] Buscando comentários para tópico: ${topicId}`);
    
    const commentTree = buildCommentTree(topicId, userId);
    
    console.log(`[COMMENTS] Encontrados ${commentTree.length} comentários`);
    
    res.json({ comments: commentTree });
  } catch (error) {
    console.error('[COMMENTS] Erro ao buscar comentários:', error);
    res.status(500).json({ comments: [], error: 'Erro interno' });
  }
};

export const createComment: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login necessário" });
  }
  
  try {
    const { topicId } = req.params;
    const data = createCommentSchema.parse(req.body);
    
    // Verificar se parent existe
    if (data.parentId && !comments.has(data.parentId)) {
      return res.status(400).json({ message: "Comentário pai não encontrado" });
    }
    
    const commentId = generateId();
    const newComment: SimpleComment = {
      id: commentId,
      content: data.content,
      author: req.user.name,
      authorId: req.user.id,
      authorAvatar: getUserInitials(req.user.name),
      topicId,
      parentId: data.parentId || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };
    
    // Salvar comentário
    comments.set(commentId, newComment);
    
    // Adicionar à lista do tópico
    if (!topicComments.has(topicId)) {
      topicComments.set(topicId, []);
    }
    topicComments.get(topicId)!.push(commentId);
    
    console.log(`[COMMENTS] Comentário criado: ${commentId} por ${req.user.name}`);
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('[COMMENTS] Erro ao criar comentário:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Dados inválidos" });
    } else {
      res.status(500).json({ message: "Erro interno" });
    }
  }
};

export const likeComment: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login necessário" });
  }
  
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    if (!comments.has(commentId)) {
      return res.status(404).json({ message: "Comentário não encontrado" });
    }
    
    if (!commentLikes.has(commentId)) {
      commentLikes.set(commentId, new Set());
    }
    
    const likes = commentLikes.get(commentId)!;
    const wasLiked = likes.has(userId);
    
    if (wasLiked) {
      likes.delete(userId);
    } else {
      likes.add(userId);
    }
    
    res.json({
      likes: likes.size,
      isLiked: !wasLiked,
    });
  } catch (error) {
    console.error('[COMMENTS] Erro ao curtir comentário:', error);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const deleteComment: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login necessário" });
  }
  
  try {
    const { commentId } = req.params;
    const comment = comments.get(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado" });
    }
    
    // Verificar permissões
    const isOwner = comment.authorId === req.user.id;
    const isAdmin = req.user.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Sem permissão" });
    }
    
    // Deletar comentário e suas respostas
    function deleteRecursive(id: string) {
      const allComments = Array.from(comments.values());
      const replies = allComments.filter(c => c.parentId === id);
      
      replies.forEach(reply => deleteRecursive(reply.id));
      
      comments.delete(id);
      commentLikes.delete(id);
      
      // Remover da lista do tópico
      const topicId = comment.topicId;
      const commentIds = topicComments.get(topicId) || [];
      const updatedIds = commentIds.filter(cId => cId !== id);
      topicComments.set(topicId, updatedIds);
    }
    
    deleteRecursive(commentId);
    
    res.json({ message: "Comentário deletado" });
  } catch (error) {
    console.error('[COMMENTS] Erro ao deletar comentário:', error);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Inicializar dados demo
export function initializeDemo() {
  // Limpar dados
  comments.clear();
  topicComments.clear();
  commentLikes.clear();
  
  // Dados demo para tópico "1"
  const demoData = [
    {
      id: "demo1",
      content: "Ótimo comparativo! Muito útil para escolher.",
      author: "Ana",
      authorId: "user_ana",
      authorAvatar: "AN",
      topicId: "1",
      parentId: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h atrás
    },
    {
      id: "demo2",
      content: "Concordo! O Midjourney realmente se destaca em arte.",
      author: "Carlos",
      authorId: "user_carlos",
      authorAvatar: "CA",
      topicId: "1", 
      parentId: "demo1",
      createdAt: new Date(Date.now() - 6600000).toISOString(), // 1h50min atrás
    },
    {
      id: "demo3",
      content: "Obrigado pelos comentários! Ajuda muito o feedback.",
      author: "Bruno",
      authorId: "user_bruno",
      authorAvatar: "BR",
      topicId: "1",
      parentId: "demo2", 
      createdAt: new Date(Date.now() - 6000000).toISOString(), // 1h40min atrás
    }
  ];
  
  // Salvar dados demo
  demoData.forEach(item => {
    const comment: SimpleComment = {
      ...item,
      likes: 0,
      isLiked: false,
    };
    
    comments.set(item.id, comment);
    
    if (!topicComments.has(item.topicId)) {
      topicComments.set(item.topicId, []);
    }
    topicComments.get(item.topicId)!.push(item.id);
  });
  
  console.log('[COMMENTS] Sistema inicializado com dados demo');
}
