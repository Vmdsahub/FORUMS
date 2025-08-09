import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

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

        {/* Account Stats */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-black">0</div>
              <div className="text-sm text-gray-600">Tópicos criados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-black">0</div>
              <div className="text-sm text-gray-600">Comentários</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-black">0</div>
              <div className="text-sm text-gray-600">Tópicos salvos</div>
            </div>
          </div>
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
