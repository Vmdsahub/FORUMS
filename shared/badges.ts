export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

// Apenas 1 emblema disponível - obtido aos 5 likes
export const BADGES: Badge[] = [
  {
    id: "popular",
    name: "Popular",
    description: "Recebeu 5 likes na comunidade",
    icon: "⭐",
    requiredPoints: 5,
    color: "gold",
  },
];

export interface UserStats {
  points: number; // pontos = total de likes recebidos
  badges: Badge[];
  postsCreated: number;
  commentsCreated: number;
  likesReceived: number; // igual aos pontos
}

// Função para cálculo de badges baseada em likes (pontos)
export function calculateUserBadges(likesReceived: number): Badge[] {
  return BADGES.filter((badge) => likesReceived >= badge.requiredPoints);
}

export function getNextBadge(likesReceived: number): Badge | null {
  const nextBadge = BADGES.find((badge) => likesReceived < badge.requiredPoints);
  return nextBadge || null;
}

export function getPointsToNextBadge(likesReceived: number): number {
  const nextBadge = getNextBadge(likesReceived);
  return nextBadge ? nextBadge.requiredPoints - likesReceived : 0;
}
