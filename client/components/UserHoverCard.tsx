import { useState, useEffect } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  color: string;
}

interface UserProfileData {
  points: number;
  badges: Badge[];
  createdAt: string;
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
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log(`[UserHoverCard] Buscando perfil para usuário: ${userId}`);
        const url = `/api/user/profile/${userId}`;
        console.log(`[UserHoverCard] URL da requisição: ${url}`);

        const response = await fetch(url);
        console.log(`[UserHoverCard] Status da resposta: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[UserHoverCard] Dados recebidos:`, data);
          setUserProfile(data);
        } else {
          const text = await response.text();
          console.error("Erro ao buscar perfil do usuário:", response.status, text);
          // Fallback para dados básicos em caso de erro
          setUserProfile({
            points: 0,
            badges: [],
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        // Fallback para dados básicos em caso de erro
        setUserProfile({
          points: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (showCard) {
      fetchUserProfile();
    }
  }, [userId, showCard]);

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Só mostrar emblemas que o usuário realmente possui, máximo 9 (3x3)
  const availableBadges = userProfile?.badges?.slice(0, 9) || [];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      {children}
      
      {showCard && (
        <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fade-in">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : userProfile ? (
            <>
              {/* Header com avatar, nome e likes */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold">
                  {userAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{userName}</h3>
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                      ❤️ {userProfile.points}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Emblemas (abaixo dos pontos) */}
              {availableBadges.length > 0 && (
                <div className="mb-4">
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
                        <div className="text-lg mb-1">
                          {badge.icon.startsWith('http') ? (
                            <img 
                              src={badge.icon} 
                              alt={badge.name} 
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span>{badge.icon}</span>
                          )}
                        </div>
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
                    {availableBadges.length < 9 && Array.from({ length: 9 - availableBadges.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="p-2"></div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Tags (seguido dos emblemas) */}
              {isTopicAuthor && (
                <div className="mb-4">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Autor do Tópico
                  </span>
                </div>
              )}

              {/* 4. Data de criação da conta (por fim) */}
              <div className="text-sm text-gray-500">
                Membro desde {formatMemberSince(userProfile.createdAt)}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Erro ao carregar dados do usuário
            </div>
          )}
        </div>
      )}
    </div>
  );
}
