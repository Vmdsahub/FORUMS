import { RequestHandler } from "express";

// Badge único disponível
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

const BADGE: Badge = {
  id: "iniciante",
  name: "Iniciante",
  description: "Primeiros passos no fórum",
  icon: "https://cdn.builder.io/api/v1/image/assets%2Feb4ab92cf61440af8e31a540e9165539%2F94f143c3d8d0424f901c1f5e6f7c61e5?format=webp&width=100",
  requiredPoints: 5,
  color: "purple",
};

// Funções para cálculo de badges
function calculateUserBadges(likesReceived: number): Badge[] {
  return likesReceived >= BADGE.requiredPoints ? [BADGE] : [];
}

function getNextBadge(likesReceived: number): Badge | null {
  return likesReceived < BADGE.requiredPoints ? BADGE : null;
}

function getPointsToNextBadge(likesReceived: number): number {
  return likesReceived < BADGE.requiredPoints
    ? BADGE.requiredPoints - likesReceived
    : 0;
}

// Storage para dados dos usuários
const userData: Map<string, { createdAt: string; totalLikes: number }> =
  new Map();

// Inicializar usuários demo
userData.set("demo_user_123", {
  createdAt: "2024-01-15T10:30:00Z",
  totalLikes: 0,
});
userData.set("admin_vitoca_456", {
  createdAt: "2023-12-01T08:00:00Z",
  totalLikes: 0,
});

// Função para calcular total de likes recebidos por um usuário
function calculateUserLikes(userId: string): number {
  let totalLikes = 0;

  try {
    // Importar likes do sistema de comentários (simple-comments.ts)
    const simpleCommentsModule = require("./simple-comments");
    if (simpleCommentsModule.getCommentLikesForUser) {
      totalLikes += simpleCommentsModule.getCommentLikesForUser(userId);
    }

    // Importar likes do sistema de fórum (forum.ts)
    const forumModule = require("./forum");
    if (forumModule.getTopicLikesForUser) {
      totalLikes += forumModule.getTopicLikesForUser(userId);
    }
    if (forumModule.getForumCommentLikesForUser) {
      totalLikes += forumModule.getForumCommentLikesForUser(userId);
    }
  } catch (error) {
    console.error("[USER-STATS] Erro ao calcular likes:", error);
    // Fallback para dados do cache
    const user = userData.get(userId);
    return user?.totalLikes || 0;
  }

  return totalLikes;
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

  console.log(`[USER-STATS] Usuário ${userId} tem ${realLikes} likes totais`);

  const badges = calculateUserBadges(realLikes);
  const nextBadge = getNextBadge(realLikes);
  const pointsToNext = getPointsToNextBadge(realLikes);

  res.json({
    points: realLikes, // Pontos = likes totais recebidos
    badges,
    nextBadge,
    pointsToNext,
    allBadges: [BADGE],
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

  console.log(
    `[USER-STATS] Perfil usuário ${userId} tem ${realLikes} likes totais`,
  );

  const badges = calculateUserBadges(realLikes);

  res.json({
    points: realLikes, // Pontos = likes totais recebidos
    badges,
    createdAt: user.createdAt,
  });
};

// Rota para buscar todos os badges disponíveis
export const handleGetAllBadges: RequestHandler = (req, res) => {
  res.json({ badges: [BADGE] });
};

// Função chamada quando um like é adicionado/removido (para sincronização)
export function onLikeToggled(
  entityId: string,
  authorId: string,
  isLiked: boolean,
) {
  console.log(
    `[USER-STATS] Like ${isLiked ? "adicionado" : "removido"} para ${authorId} na entidade ${entityId}`,
  );

  // Força recálculo dos likes do autor na próxima consulta
  const user = userData.get(authorId);
  if (user) {
    // Invalidar cache forçando recálculo
    const newTotal = calculateUserLikes(authorId);
    user.totalLikes = newTotal;
    console.log(
      `[USER-STATS] Total atualizado para ${authorId}: ${newTotal} likes`,
    );
  }
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

// Função para verificar se o usuário ganhou um novo emblema
export function checkForNewBadge(previousLikes: number, currentLikes: number) {
  console.log(`[BADGES DEBUG] checkForNewBadge called with previousLikes=${previousLikes}, currentLikes=${currentLikes}`);

  const previousBadges = calculateUserBadges(previousLikes);
  const currentBadges = calculateUserBadges(currentLikes);

  console.log(`[BADGES DEBUG] previousBadges count: ${previousBadges.length}`);
  console.log(`[BADGES DEBUG] currentBadges count: ${currentBadges.length}`);
  console.log(`[BADGES DEBUG] Badge required points: ${BADGE.requiredPoints}`);

  // Verificar se há novo emblema
  if (currentBadges.length > previousBadges.length) {
    const newBadge = currentBadges[currentBadges.length - 1];
    console.log(`[BADGES DEBUG] ✅ Usuário conquistou emblema: ${newBadge.name} (${previousLikes} -> ${currentLikes} likes)`);
    return newBadge;
  }

  console.log(`[BADGES DEBUG] ❌ Nenhum novo emblema (${previousBadges.length} -> ${currentBadges.length})`);
  return null;
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
