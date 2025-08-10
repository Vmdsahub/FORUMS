import { useState, useEffect } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

interface UserProfile {
  points: number;
  badges: Badge[];
  memberSince: string;
  selectedBadges: string[];
}

interface UserHoverCardProps {
  userId: string;
  userName: string;
  userAvatar: string;
  isTopicAuthor?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
}

export default function UserHoverCard({
  userId,
  userName,
  userAvatar,
  isTopicAuthor = false,
  size = "sm",
  children,
}: UserHoverCardProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Simular dados reais baseados no userId
        const mockProfile: UserProfile = {
          points: 125,
          badges: [
            {
              id: "iniciante",
              name: "Iniciante",
              description: "Primeiros passos no fórum",
              icon: "🏆",
              requiredPoints: 5,
              color: "purple",
            },
            {
              id: "colaborador",
              name: "Colaborador",
              description: "Ajuda outros membros",
              icon: "🤝",
              requiredPoints: 50,
              color: "blue",
            },
            {
              id: "expert",
              name: "Expert",
              description: "Conhecimento avançado",
              icon: "🎓",
              requiredPoints: 100,
              color: "gold",
            },
            {
              id: "popular",
              name: "Popular",
              description: "Posts bem avaliados",
              icon: "⭐",
              requiredPoints: 75,
              color: "orange",
            },
          ],
          memberSince: "2024-01-15",
          selectedBadges: ["iniciante", "colaborador", "expert", "popular"],
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

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const availableBadges = userProfile?.badges
    .filter((badge) => userProfile.selectedBadges.includes(badge.id))
    .slice(0, 9) || []; // Máximo 9 emblemas (3x3)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      {children}
      
      {showCard && (
        <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fade-in">
          {isLoading || !userProfile ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Header com avatar e nome */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold">
                  {userAvatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userName}</h3>
                  <p className="text-sm text-gray-500">
                    {userProfile.points} pontos
                  </p>
                </div>
              </div>

              {/* Tags especiais */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isTopicAuthor && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Autor do Tópico
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Membro desde {formatMemberSince(userProfile.memberSince)}
                </span>
              </div>

              {/* Emblemas em grid 3x3 */}
              {availableBadges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Emblemas ({availableBadges.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {availableBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="group relative flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        title={badge.description}
                      >
                        <div className="text-xl mb-1">{badge.icon}</div>
                        <span className="text-xs text-gray-600 text-center leading-tight">
                          {badge.name}
                        </span>
                        
                        {/* Tooltip para descrição */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          {badge.description}
                        </div>
                      </div>
                    ))}
                    
                    {/* Preencher espaços vazios para manter grid 3x3 */}
                    {Array.from({ length: 9 - availableBadges.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="p-2"></div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
