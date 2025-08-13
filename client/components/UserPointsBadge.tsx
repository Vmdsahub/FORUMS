import { useState, useEffect } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

interface UserPointsBadgeProps {
  userId: string;
  showPoints?: boolean;
  showBadges?: boolean;
  size?: "sm" | "md" | "lg";
  refreshTrigger?: number; // Prop para forçar refresh
}

export default function UserPointsBadge({
  userId,
  showPoints = true,
  showBadges = false,
  size = "sm",
  refreshTrigger,
}: UserPointsBadgeProps) {
  const [userStats, setUserStats] = useState<{
    points: number;
    badges: Badge[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        console.log(`[UserPointsBadge] Buscando stats para usuário: ${userId}`);

        // Buscar saldo disponível de likes (mesma fonte da loja)
        const likesResponse = await fetch("/api/user/likes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        // Buscar badges do perfil
        const profileResponse = await fetch(`/api/user/profile/${userId}`);

        if (likesResponse.ok && profileResponse.ok) {
          const likesData = await likesResponse.json();
          const profileData = await profileResponse.json();

          console.log(`[UserPointsBadge] Saldo de likes:`, likesData.totalLikes);
          console.log(`[UserPointsBadge] Badges:`, profileData.badges);

          setUserStats({
            points: likesData.totalLikes, // Usar saldo disponível (já descontando gastos)
            badges: profileData.badges,
          });
        } else {
          console.error("Erro ao buscar stats do usuário");
          // Fallback para dados básicos
          setUserStats({
            points: 0,
            badges: [],
          });
        }
      } catch (error) {
        console.error("Erro ao buscar stats do usuário:", error);
        // Fallback para dados básicos
        setUserStats({
          points: 0,
          badges: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [userId, refreshTrigger]);

  if (isLoading || !userStats) {
    return null;
  }

  const sizeClasses = {
    sm: {
      text: "text-sm",
      gap: "gap-1",
    },
    md: {
      text: "text-base",
      gap: "gap-2",
    },
    lg: {
      text: "text-lg",
      gap: "gap-2",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.gap}`}>
      {showPoints && (
        <span
          className={`${classes.text} text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full flex items-center gap-1`}
        >
          ❤️ {userStats.points}
        </span>
      )}
    </div>
  );
}
