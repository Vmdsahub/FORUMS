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
  showBadges = false, // Default to false to remove badge display
  size = "sm",
}: UserPointsBadgeProps) {
  const [userStats, setUserStats] = useState<{
    points: number;
    badges: Badge[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Para este exemplo, vamos simular dados baseados no userId
    // Em um app real, isso viria de uma API
    const mockStats = {
      points: Math.floor(Math.random() * 100), // Simular pontos aleatórios
      badges: [
        {
          id: "iniciante",
          name: "Iniciante",
          description: "Primeiros passos no fórum",
          icon: "https://cdn.builder.io/api/v1/image/assets%2Feb4ab92cf61440af8e31a540e9165539%2F94f143c3d8d0424f901c1f5e6f7c61e5?format=webp&width=100",
          requiredPoints: 5,
          color: "purple",
        },
      ],
    };

    setTimeout(() => {
      setUserStats(mockStats);
      setIsLoading(false);
    }, 100);
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
          className={`${classes.text} text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full`}
        >
          {userStats.points} pts
        </span>
      )}

      {showBadges && userStats.badges.length > 0 && (
        <div className={`flex items-center ${classes.gap}`}>
          {userStats.badges.slice(0, 2).map(
            (
              badge, // Mostrar no máximo 2 badges
            ) => (
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
            ),
          )}

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
