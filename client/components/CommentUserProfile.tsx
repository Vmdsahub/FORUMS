import { useState, useEffect } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
  isSelected?: boolean;
}

interface UserProfile {
  points: number;
  badges: Badge[];
  memberSince: string;
  selectedBadges: string[]; // IDs dos emblemas selecionados para exibição
}

interface CommentUserProfileProps {
  userId: string;
  userName: string;
  userAvatar: string;
  isTopicAuthor?: boolean;
  size?: "sm" | "md";
}

export default function CommentUserProfile({
  userId,
  userName,
  userAvatar,
  isTopicAuthor = false,
  size = "sm",
}: CommentUserProfileProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Substituir por API real
    const fetchUserProfile = async () => {
      try {
        // Simular dados reais baseados no userId
        const mockProfile: UserProfile = {
          points: 25, // Pontos reais do usuário
          badges: [
            {
              id: "iniciante",
              name: "Iniciante",
              description: "Primeiros passos no fórum",
              icon: "https://cdn.builder.io/api/v1/image/assets%2Feb4ab92cf61440af8e31a540e9165539%2F94f143c3d8d0424f901c1f5e6f7c61e5?format=webp&width=100",
              requiredPoints: 5,
              color: "purple",
              isSelected: true,
            },
          ],
          memberSince: "2024-01-15", // Data real de cadastro
          selectedBadges: ["iniciante"], // Emblemas selecionados pelo usuário
        };

        setTimeout(() => {
          setUserProfile(mockProfile);
          setIsLoading(false);
        }, 100);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`${size === "sm" ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-gray-200 animate-pulse`}
        ></div>
      </div>
    );
  }

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  };

  const selectedBadges = userProfile.badges
    .filter((badge) => userProfile.selectedBadges.includes(badge.id))
    .slice(0, 6); // Máximo 6 emblemas

  const avatarSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const badgeSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Avatar */}
      <div
        className={`${avatarSize} rounded-full bg-black text-white flex items-center justify-center ${textSize} font-semibold flex-shrink-0`}
      >
        {userAvatar}
      </div>

      {/* Nome do usuário */}
      <div className="text-center">
        <div className={`font-medium text-black ${textSize} leading-tight`}>
          {userName}
        </div>

        {/* Badges do usuário */}
        {selectedBadges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-16">
            {selectedBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group"
                title={`${badge.name}: ${badge.description}`}
              >
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className={`${badgeSize} object-contain hover:scale-110 transition-transform`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pontos */}
        <div className={`${textSize} text-amber-600 font-medium mt-1`}>
          {userProfile.points} pts
        </div>

        {/* Membro desde */}
        <div className={`${textSize} text-gray-500 mt-1`}>
          Membro desde {formatMemberSince(userProfile.memberSince)}
        </div>

        {/* Badge de autor do tópico */}
        {isTopicAuthor && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1">
            Autor
          </div>
        )}
      </div>
    </div>
  );
}
