import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { availableThemes, userThemes, userLikes, purchaseTheme, fetchUserLikes } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchUserLikes();
  }, [user, navigate, fetchUserLikes]);

  const isPurchased = (themeId: string) => {
    return userThemes.some(ut => ut.themeId === themeId);
  };

  const canAfford = (theme: Theme) => {
    return userLikes >= theme.price;
  };

  const handlePurchase = async (theme: Theme) => {
    if (!canAfford(theme)) {
      toast.error(`Você precisa de ${theme.price} likes para comprar este tema. Você tem apenas ${userLikes} likes.`);
      return;
    }

    if (isPurchased(theme.id)) {
      toast.info("Você já possui este tema!");
      return;
    }

    setIsLoading(true);
    try {
      const success = await purchaseTheme(theme.id);
      if (success) {
        toast.success(`Tema "${theme.name}" comprado com sucesso! Vá para a Central do Usuário para aplicá-lo.`);
      } else {
        toast.error("Erro ao comprar o tema. Tente novamente.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Erro ao comprar o tema. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="container max-w-6xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              🛒 Loja de Likes
            </h1>
            <p className="text-gray-600">
              Personalize sua experiência com temas exclusivos
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 0L6.6 1.4 12.2 7H0v2h12.2L6.6 14.6 8 16l8-8-8-8z"
                transform="rotate(180 8 8)"
              />
            </svg>
            Voltar
          </button>
        </div>

        {/* User Likes Balance - Simplified */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-lg font-bold text-gray-900">{userLikes}</span>
          </div>
        </div>

        {/* Themes Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-6">Temas Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableThemes.map((theme) => {
              const purchased = isPurchased(theme.id);
              const affordable = canAfford(theme);
              
              return (
                <div
                  key={theme.id}
                  className={`border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                    purchased 
                      ? "border-green-300 bg-green-50" 
                      : affordable 
                        ? "border-gray-200 hover:border-blue-300" 
                        : "border-gray-200 opacity-75"
                  }`}
                >
                  {/* Theme Preview */}
                  <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center text-4xl ${
                    theme.id === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
                  }`}>
                    {theme.icon}
                  </div>

                  {/* Theme Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {theme.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-semibold text-black">{theme.price}</span>
                        <span className="text-sm text-gray-500">likes</span>
                      </div>
                      {purchased && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Possui
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(theme)}
                    disabled={isLoading || purchased || !affordable}
                    className={`w-full ${
                      purchased
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : affordable
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Comprando...
                      </div>
                    ) : purchased ? (
                      "Já possui"
                    ) : affordable ? (
                      `Comprar por ${theme.price} likes`
                    ) : (
                      `Precisa de ${theme.price - userLikes} likes a mais`
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to earn likes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            💡 Como ganhar mais likes?
          </h3>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-center gap-2">
              <span>•</span>
              <span>Receba likes em seus comentários no fórum</span>
            </li>
            <li className="flex items-center gap-2">
              <span>•</span>
              <span>Crie tópicos interessantes que geram discussão</span>
            </li>
            <li className="flex items-center gap-2">
              <span>•</span>
              <span>Participe ativamente das conversas da comunidade</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
