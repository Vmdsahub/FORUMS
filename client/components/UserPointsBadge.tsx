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
}

export default function UserPointsBadge({
  userId,
  showPoints = true,
  showBadges = false,
  size = "sm",
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

        const response = await fetch(`/api/user/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`[UserPointsBadge] Dados recebidos:`, data);
          setUserStats({
            points: data.points,
            badges: data.badges,
          });
        } else {
          console.error("Erro ao buscar stats do usuário:", response.status);
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
  }, [userId]);

  if (isLoading || !userStats) {
    return null;
  }

  const sizeClasses = {
    sm: {
      text: "text-xs",
      badge: "w-4 h-4",
      gap: "gap-1",
    },
    md: {
      text: "text-sm",
      badge: "w-5 h-5",
      gap: "gap-2",
    },
    lg: {
      text: "text-base",
      badge: "w-6 h-6",
      gap: "gap-2",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.gap}`}>
      {showPoints && (
        <span
          className={`${classes.text} text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1`}
        >
          ❤️ {userStats.points}
        </span>
      )}

      {showBadges && userStats.badges.length > 0 && (
        <div className={`flex items-center ${classes.gap}`}>
          {userStats.badges.slice(0, 2).map((badge) => (
            <div
              key={badge.id}
              className="relative group"
              title={`${badge.name}: ${badge.description}`}
            >
              {badge.icon.startsWith("http") ? (
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className={`${classes.badge} object-contain`}
                />
              ) : (
                <span className={`${classes.text}`}>{badge.icon}</span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {badge.name}
              </div>
            </div>
          ))}

          {userStats.badges.length > 2 && (
            <span className={`${classes.text} text-gray-500`}>
              +{userStats.badges.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
