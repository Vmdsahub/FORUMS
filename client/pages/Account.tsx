import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [userTopics, setUserTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Fetch user's topics
  useEffect(() => {
    if (user) {
      fetchUserTopics();
    }
  }, [user]);

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

  return (
    <main className="container max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Minha Conta</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L6.6 1.4 12.2 7H0v2h12.2L6.6 14.6 8 16l8-8-8-8z" transform="rotate(180 8 8)" />
            </svg>
            Voltar
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                Administrador
              </span>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
            Informações da Conta
          </h3>

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
                  <Label htmlFor="edit-name" className="text-gray-900 font-medium">
                    Nome
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-gray-900 font-medium">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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

        {/* User's Topics */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Meus Tópicos</h3>
          {isLoadingTopics ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando seus tópicos...</p>
            </div>
          ) : userTopics.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Você ainda não criou nenhum tópico.</p>
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
                <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                      <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Criado em {new Date(topic.createdAt).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span>{topic.views} visualizações</span>
                        <span>•</span>
                        <span>{topic.replies} respostas</span>
                        <span>•</span>
                        <span>{topic.likes} curtidas</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Última atividade: {topic.lastActivity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/topic/${topic.id}`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                        title="Ver tópico"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zona de Perigo</h3>
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
