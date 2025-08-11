import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserPointsBadge from "@/components/UserPointsBadge";
import { toast } from "sonner";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  views: number;
  replies: number;
  likes: number;
  lastActivity?: string;
  lastPost?: {
    date: string;
    time: string;
  };
}

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [userTopics, setUserTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collapsible sections state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    account: false,
    badges: false,
    topics: false,
  });

  // Badge selection state
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [memberSince] = useState("2024-01-15"); // Data real de cadastro

  // Fetch user's topics and badges
  useEffect(() => {
    if (user) {
      fetchUserTopics();
      fetchUserBadges();
    }
  }, [user]);

  const fetchUserBadges = async () => {
    try {
      // Buscar badges do usuário
      const userStatsResponse = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      // Buscar todos os badges disponíveis
      const allBadgesResponse = await fetch("/api/badges");

      if (userStatsResponse.ok && allBadgesResponse.ok) {
        const userStatsData = await userStatsResponse.json();
        const allBadgesData = await allBadgesResponse.json();

        setUserBadges(userStatsData.badges || []);
        setAvailableBadges(allBadgesData.badges || []);

        // Selecionar apenas os badges que o usuário possui
        const earnedBadgeIds = (userStatsData.badges || []).map((badge: any) => badge.id);
        setSelectedBadges(earnedBadgeIds);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchUserTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const response = await fetch("/api/topics/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserTopics(data.topics || []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch user topics:", errorData.message);
        setUserTopics([]);
      }
    } catch (error) {
      console.error("Error fetching user topics:", error);
      setUserTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setAvatarFile(file);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAvatarUrl(result.url);
        toast.success("Foto do perfil atualizada!");
      } else {
        toast.error("Erro ao carregar foto");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Erro ao carregar foto");
    } finally {
      setIsUploadingAvatar(false);
      setAvatarFile(null);
      event.target.value = "";
    }
  };

  const toggleSection = (section: "account" | "badges" | "topics") => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSave = () => {
    // TODO: Implement save functionality when API is ready
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  const getAvatarContent = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <main className="container max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Central do Usuário
            </h1>
            <p className="text-gray-600">
              Gerencie suas informações e conquistas
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

        {/* User Avatar & Info */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <button
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold hover:bg-gray-800 transition-colors relative group overflow-hidden"
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                getAvatarContent()
              )}

              {/* Upload overlay */}
              {!isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                  </svg>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-black">{user.name}</h2>
            <p className="text-gray-600 mb-1">{user.email}</p>
            <p className="text-sm text-gray-500 mb-2">
              Membro desde{" "}
              {new Date(memberSince).toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-3">
              <UserPointsBadge
                userId={user.id}
                size="md"
                showPoints={true}
                showBadges={true}
              />
              {user.role === "admin" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Badges Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection("badges")}
            className="w-full flex items-center justify-between text-lg font-semibold text-black border-b border-gray-200 pb-2 mb-4 hover:text-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">🏆 Seus Emblemas</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`transform transition-transform ${
                sectionsExpanded.badges ? "rotate-180" : ""
              }`}
            >
              <path d="M4 6l4 4 4-4H4z" />
            </svg>
          </button>

          {sectionsExpanded.badges && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-black mb-2">
                  Selecione até 9 emblemas para exibir nos comentários:
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Estes emblemas aparecerão abaixo do seu avatar quando você
                  comentar
                </p>
                {userBadges.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      🏆 Você ainda não conquistou nenhum emblema. Receba likes nos seus comentários para ganhar o emblema "Iniciante"!
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {userBadges.map((badge) => {
                  const isSelected = selectedBadges.includes(badge.id);
                  const canSelect = selectedBadges.length < 9 || isSelected;

                  return (
                    <div
                      key={badge.id}
                      className={`relative group p-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 rounded-lg"
                          : canSelect
                            ? "hover:bg-gray-50 rounded-lg"
                            : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (!canSelect && !isSelected) return;

                        if (isSelected) {
                          setSelectedBadges((prev) =>
                            prev.filter((id) => id !== badge.id),
                          );
                        } else {
                          setSelectedBadges((prev) => [...prev, badge.id]);
                        }
                      }}
                    >
                      <div className="text-center">
                        <img
                          src={badge.icon}
                          alt={badge.name}
                          className="w-12 h-12 object-contain mx-auto hover:scale-110 transition-transform duration-300"
                        />

                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 16 16"
                              fill="white"
                            >
                              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Tooltip no hover com nome, descrição e data */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <div className="font-semibold">{badge.name}</div>
                        <div className="text-gray-300">{badge.description}</div>
                        <div className="text-green-400 mt-1">
                          ✓ Conquistado em {new Date(memberSince).toLocaleDateString("pt-BR")}
                        </div>

                        {/* Seta do tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {selectedBadges.length}/9 emblemas selecionados
                </p>
                {userBadges.length > 0 && selectedBadges.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Selecione pelo menos um emblema para exibir nos comentários
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Account Information */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection("account")}
            className="w-full flex items-center justify-between text-lg font-semibold text-black border-b border-gray-200 pb-2 mb-4 hover:text-gray-700 transition-colors"
          >
            <span>Informações da Conta</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`transform transition-transform ${
                sectionsExpanded.account ? "rotate-180" : ""
              }`}
            >
              <path d="M4 6l4 4 4-4H4z" />
            </svg>
          </button>

          {sectionsExpanded.account && (
            <div className="space-y-6">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-900 font-medium">Nome</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {user.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-900 font-medium">Email</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Editar Informações
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-name"
                        className="text-gray-900 font-medium"
                      >
                        Nome
                      </Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-email"
                        className="text-gray-900 font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Topics Section */}
        <div className="pt-8 border-t border-gray-200">
          <button
            onClick={() => toggleSection("topics")}
            className="w-full flex items-center justify-between text-lg font-semibold text-black mb-4 hover:text-gray-700 transition-colors"
          >
            <span>Meus Tópicos</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`transform transition-transform ${
                sectionsExpanded.topics ? "rotate-180" : ""
              }`}
            >
              <path d="M4 6l4 4 4-4H4z" />
            </svg>
          </button>

          {sectionsExpanded.topics && (
            <div>
              {isLoadingTopics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando seus tópicos...</p>
                </div>
              ) : userTopics.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">
                    Você ainda não criou nenhum tópico.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Criar Primeiro Tópico
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Link
                              to={`/topic/${topic.id}`}
                              className="text-lg font-semibold text-black hover:text-blue-600 transition-colors"
                            >
                              {topic.title}
                            </Link>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {topic.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {topic.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Criado em{" "}
                              {new Date(topic.createdAt).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                            <span>•</span>
                            <span>{topic.views} visualizações</span>
                            <span>•</span>
                            <span>{topic.replies} respostas</span>
                            <span>•</span>
                            <span>{topic.likes} curtidas</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Última atividade:{" "}
                            {topic.lastActivity ||
                              `${topic.lastPost?.date} às ${topic.lastPost?.time}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            to={`/topic/${topic.id}`}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                            title="Ver tópico"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Zona de Perigo
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              Esta ação irá desconectar você da sua conta atual.
            </p>
            <Button
              onClick={logout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
