export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

export const BADGES: Badge[] = [
  {
    id: "iniciante",
    name: "Iniciante",
    description: "Primeiros passos no fórum",
    icon: "https://cdn.builder.io/api/v1/image/assets%2Feb4ab92cf61440af8e31a540e9165539%2F94f143c3d8d0424f901c1f5e6f7c61e5?format=webp&width=100",
    requiredPoints: 5,
    color: "purple",
  },
  {
    id: "participante",
    name: "Participante",
    description: "Membro ativo da comunidade",
    icon: "🏆", // Fallback emoji
    requiredPoints: 25,
    color: "blue",
  },
  {
    id: "experiente",
    name: "Experiente",
    description: "Usuário experiente",
    icon: "⭐", // Fallback emoji
    requiredPoints: 50,
    color: "yellow",
  },
  {
    id: "expert",
    name: "Expert",
    description: "Especialista da comunidade",
    icon: "💎", // Fallback emoji
    requiredPoints: 100,
    color: "cyan",
  },
  {
    id: "lenda",
    name: "Lenda",
    description: "Lenda do fórum",
    icon: "👑", // Fallback emoji
    requiredPoints: 200,
    color: "gold",
  },
];

export interface UserStats {
  points: number;
  badges: Badge[];
  postsCreated: number;
  commentsCreated: number;
  likesReceived: number;
}

// Funções para cálculo de pontos
export const POINTS = {
  CREATE_POST: 5,
  CREATE_COMMENT: 1,
  RECEIVE_POST_LIKE: 1, // Por cada 5 likes
  RECEIVE_COMMENT_LIKE: 1, // Por like
} as const;

export function calculateUserBadges(points: number): Badge[] {
  return BADGES.filter((badge) => points >= badge.requiredPoints);
}

export function getNextBadge(points: number): Badge | null {
  const nextBadge = BADGES.find((badge) => points < badge.requiredPoints);
  return nextBadge || null;
}

export function getPointsToNextBadge(points: number): number {
  const nextBadge = getNextBadge(points);
  return nextBadge ? nextBadge.requiredPoints - points : 0;
}
