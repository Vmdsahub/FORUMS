import { RequestHandler } from "express";
import { BADGES, calculateUserBadges, getNextBadge, getPointsToNextBadge } from "@shared/badges";

// Simular dados de usuários (isso deveria vir de um banco de dados)
const userStats: Map<string, { points: number; badges: string[] }> = new Map();

export const handleGetUserStats: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const stats = userStats.get(req.user.id) || { points: 0, badges: [] };
  const userBadges = calculateUserBadges(stats.points);
  const nextBadge = getNextBadge(stats.points);
  const pointsToNext = getPointsToNextBadge(stats.points);

  res.json({
    points: stats.points,
    badges: userBadges,
    nextBadge,
    pointsToNext,
    allBadges: BADGES,
  });
};

export const handleGetAllBadges: RequestHandler = (req, res) => {
  res.json({ badges: BADGES });
};

// Helper para atualizar pontos (usado pelos outros módulos)
export function updateUserPoints(userId: string, points: number) {
  if (!userStats.has(userId)) {
    userStats.set(userId, { points: 0, badges: [] });
  }
  
  const stats = userStats.get(userId)!;
  stats.points += points;
  
  // Atualizar badges
  const currentBadges = calculateUserBadges(stats.points);
  stats.badges = currentBadges.map(b => b.id);
  
  return stats;
}

export function getUserPoints(userId: string): number {
  return userStats.get(userId)?.points || 0;
}

export function getUserBadges(userId: string): string[] {
  return userStats.get(userId)?.badges || [];
}
