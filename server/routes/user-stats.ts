import { RequestHandler } from "express";
import { BADGES, calculateUserBadges, getNextBadge, getPointsToNextBadge } from "@shared/badges";

// Simular dados de usuários (isso deveria vir de um banco de dados)
const userStats: Map<string, { points: number; badges: string[]; createdAt: string }> = new Map();

// Dados demo para usuários existentes
const demoUserStats = new Map([
  ["demo_user_123", { points: 85, badges: ["iniciante", "participante", "experiente"], createdAt: "2024-01-15T10:30:00Z" }],
  ["admin_vitoca_456", { points: 250, badges: ["iniciante", "participante", "experiente", "expert", "lenda"], createdAt: "2023-12-01T08:00:00Z" }],
]);

// Inicializar com dados demo
demoUserStats.forEach((stats, userId) => {
  userStats.set(userId, stats);
});

export const handleGetUserStats: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const userId = req.user.id;
  let stats = userStats.get(userId);
  
  // Se não existir, criar novo usuário com dados básicos
  if (!stats) {
    stats = {
      points: 0,
      badges: [],
      createdAt: new Date().toISOString(), // Data atual para novos usuários
    };
    userStats.set(userId, stats);
  }

  const currentBadges = calculateUserBadges(stats.points);
  const nextBadge = getNextBadge(stats.points);
  const pointsToNext = getPointsToNextBadge(stats.points);

  res.json({
    points: stats.points,
    badges: currentBadges,
    nextBadge,
    pointsToNext,
    allBadges: BADGES,
    createdAt: stats.createdAt,
  });
};

export const handleGetAllBadges: RequestHandler = (req, res) => {
  res.json({ badges: BADGES });
};

// Rota para buscar dados de um usuário específico (para hover cards)
export const handleGetUserProfile: RequestHandler = (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório" });
  }

  let stats = userStats.get(userId);
  
  // Se não existir, criar dados básicos
  if (!stats) {
    stats = {
      points: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };
    userStats.set(userId, stats);
  }

  const currentBadges = calculateUserBadges(stats.points);

  res.json({
    points: stats.points,
    badges: currentBadges,
    createdAt: stats.createdAt,
  });
};

// Helper para atualizar pontos (usado pelos outros módulos)
export function updateUserPoints(userId: string, points: number) {
  if (!userStats.has(userId)) {
    userStats.set(userId, { points: 0, badges: [], createdAt: new Date().toISOString() });
  }

  const stats = userStats.get(userId)!;
  stats.points += points;

  // Atualizar badges
  const currentBadges = calculateUserBadges(stats.points);
  stats.badges = currentBadges.map((b) => b.id);

  return stats;
}

export function getUserPoints(userId: string): number {
  return userStats.get(userId)?.points || 0;
}

export function getUserBadges(userId: string): string[] {
  return userStats.get(userId)?.badges || [];
}

export function getUserCreatedAt(userId: string): string {
  return userStats.get(userId)?.createdAt || new Date().toISOString();
}
