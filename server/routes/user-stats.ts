import { RequestHandler } from "express";
import { BADGES, calculateUserBadges, getNextBadge, getPointsToNextBadge, Badge } from "@shared/badges";

const SINGLE_BADGE = BADGES[0]; // Único badge disponível

// Storage para dados dos usuários (userId -> { createdAt, totalLikes })
const userData: Map<string, { createdAt: string; totalLikes: number }> = new Map();

// Inicializar usuários demo com dados realistas
userData.set("demo_user_123", { createdAt: "2024-01-15T10:30:00Z", totalLikes: 3 });
userData.set("admin_vitoca_456", { createdAt: "2023-12-01T08:00:00Z", totalLikes: 12 });

// Storage para likes (importado dos outros sistemas)
// Vamos unificar todos os likes de diferentes sistemas aqui
const allLikes: Map<string, Set<string>> = new Map(); // entityId -> userIds que curtiram

// Função para calcular total de likes recebidos por um usuário
function calculateUserLikes(userId: string): number {
  let totalLikes = 0;
  
  // Importar likes do sistema de comentários (simple-comments.ts)
  const { getCommentLikesForUser } = require('./simple-comments');
  totalLikes += getCommentLikesForUser(userId);
  
  // Importar likes do sistema de fórum (forum.ts) 
  const { getTopicLikesForUser, getForumCommentLikesForUser } = require('./forum');
  totalLikes += getTopicLikesForUser(userId);
  totalLikes += getForumCommentLikesForUser(userId);
  
  return totalLikes;
}

// Função para calcular se usuário tem o badge
function hasUserBadge(likes: number): boolean {
  return likes >= SINGLE_BADGE.requiredPoints;
}

// Rota para buscar stats do usuário atual (autenticado)
export const handleGetUserStats: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const userId = req.user.id;
  let user = userData.get(userId);
  
  // Se não existir, criar novo usuário
  if (!user) {
    user = {
      createdAt: new Date().toISOString(),
      totalLikes: 0,
    };
    userData.set(userId, user);
  }

  // Calcular likes reais em tempo real
  const realLikes = calculateUserLikes(userId);
  user.totalLikes = realLikes; // Atualizar cache
  
  const badges = hasUserBadge(realLikes) ? [SINGLE_BADGE] : [];
  const nextBadge = !hasUserBadge(realLikes) ? SINGLE_BADGE : null;
  const pointsToNext = nextBadge ? nextBadge.requiredPoints - realLikes : 0;

  res.json({
    points: realLikes, // Pontos = likes totais recebidos
    badges,
    nextBadge,
    pointsToNext,
    allBadges: [SINGLE_BADGE],
    createdAt: user.createdAt,
  });
};

// Rota para buscar dados de um usuário específico (para hover cards)
export const handleGetUserProfile: RequestHandler = (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório" });
  }

  let user = userData.get(userId);
  
  // Se não existir, criar dados básicos
  if (!user) {
    user = {
      createdAt: new Date().toISOString(),
      totalLikes: 0,
    };
    userData.set(userId, user);
  }

  // Calcular likes reais em tempo real
  const realLikes = calculateUserLikes(userId);
  user.totalLikes = realLikes; // Atualizar cache
  
  const badges = hasUserBadge(realLikes) ? [SINGLE_BADGE] : [];

  res.json({
    points: realLikes, // Pontos = likes totais recebidos
    badges,
    createdAt: user.createdAt,
  });
};

// Rota para buscar todos os badges disponíveis
export const handleGetAllBadges: RequestHandler = (req, res) => {
  res.json({ badges: [SINGLE_BADGE] });
};

// Função chamada quando um like é adicionado/removido (para sincronização)
export function onLikeToggled(entityId: string, authorId: string, isLiked: boolean) {
  // Esta função será chamada pelos outros sistemas quando likes mudarem
  // Força recálculo dos likes do autor na próxima consulta
  const user = userData.get(authorId);
  if (user) {
    // Invalidar cache forçando recálculo
    user.totalLikes = calculateUserLikes(authorId);
  }
}

// Função para sincronizar likes de uma entidade específica
export function syncEntityLikes(entityId: string, userIds: Set<string>) {
  allLikes.set(entityId, new Set(userIds));
}

// Função para obter usuário por ID (para outros módulos)
export function getUserData(userId: string) {
  let user = userData.get(userId);
  if (!user) {
    user = {
      createdAt: new Date().toISOString(),
      totalLikes: 0,
    };
    userData.set(userId, user);
  }
  
  // Sempre recalcular likes em tempo real
  user.totalLikes = calculateUserLikes(userId);
  return user;
}

// Função para inicializar usuário se não existir
export function ensureUserExists(userId: string, createdAt?: string) {
  if (!userData.has(userId)) {
    userData.set(userId, {
      createdAt: createdAt || new Date().toISOString(),
      totalLikes: 0,
    });
  }
}
