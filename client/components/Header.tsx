import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import Captcha from "@/components/Captcha";
import { toast } from "sonner";

export default function Header() {
  const { user, isLoading, isAdmin, login, register, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginCaptcha, setLoginCaptcha] = useState("");
  const [loginCaptchaValid, setLoginCaptchaValid] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerCaptcha, setRegisterCaptcha] = useState("");
  const [registerCaptchaValid, setRegisterCaptchaValid] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-minimal border-b border-black/5">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-6 mx-auto">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black tracking-tight">
            IA HUB
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors duration-200">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="font-medium text-black">{user.name}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="text-gray-400"
                  >
                    <path d="M4 6l4 4 4-4H4z" />
                  </svg>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-black">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-gray-600"
                      >
                        <path d="M8 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 1c-1.5 0-4 .8-4 2.5V12h8v-1.5c0-1.7-2.5-2.5-4-2.5z" />
                      </svg>
                      <span className="text-gray-700">Meu Perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-gray-600"
                      >
                        <path d="M8 0C5.8 0 4 1.8 4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.7 7.5L12 11.8c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l1.7 1.7c.2.2.4.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4z" />
                      </svg>
                      <span className="text-gray-700">Configurações</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-gray-600"
                      >
                        <path d="M12 9V7l-3-3-3 3v2L2 9l6-6 6 6-2 0zM6 11h4v2H6v-2z" />
                      </svg>
                      <span className="text-gray-700">Minhas Postagens</span>
                    </button>
                    <hr className="my-2" />
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-left"
                      onClick={logout}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-red-600"
                      >
                        <path d="M3 3h6v2H3v6h6v2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm7 4l-1.4-1.4L10 4.2 13.8 8 10 11.8l-1.4-1.4L10 9H5V7h5z" />
                      </svg>
                      <span className="text-red-600">Sair</span>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              {/* Login Dialog */}
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black/70 hover:text-black hover:bg-black/5 font-medium"
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 text-xl font-semibold">
                      Fazer Login
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!loginCaptchaValid) {
                        toast.error(
                          "Por favor, complete a verificação de segurança",
                        );
                        return;
                      }

                      const success = await login(
                        loginEmail,
                        loginPassword,
                        loginCaptcha,
                      );
                      if (success) {
                        setIsLoginOpen(false);
                        setLoginEmail("");
                        setLoginPassword("");
                        setLoginCaptcha("");
                        setLoginCaptchaValid(false);
                      }
                    }}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-900 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-900 font-medium">
                        Senha
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                        required
                        minLength={6}
                      />
                    </div>
                    <Captcha
                      onCaptchaChange={setLoginCaptcha}
                      onValidationChange={setLoginCaptchaValid}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium"
                      disabled={isLoading || !loginCaptchaValid}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Register Dialog */}
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-black/90 font-medium"
                  >
                    Cadastrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 text-xl font-semibold">
                      Criar Conta
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (isLoading) {
                        console.log(
                          "Already loading, preventing duplicate submission",
                        );
                        return;
                      }
                      if (!registerCaptchaValid) {
                        toast.error(
                          "Por favor, complete a verificação de segurança",
                        );
                        return;
                      }

                      console.log("Submitting registration form...", {
                        registerName,
                        registerEmail,
                        registerCaptcha,
                      });
                      const success = await register(
                        registerName,
                        registerEmail,
                        registerPassword,
                        registerCaptcha,
                      );
                      if (success) {
                        setIsRegisterOpen(false);
                        setRegisterName("");
                        setRegisterEmail("");
                        setRegisterPassword("");
                        setRegisterCaptcha("");
                        setRegisterCaptchaValid(false);
                      }
                    }}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-900 font-medium">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                        required
                        minLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-900 font-medium">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="register-password"
                        className="text-gray-900 font-medium"
                      >
                        Senha
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500">
                        Mínimo de 6 caracteres
                      </p>
                    </div>
                    <Captcha
                      onCaptchaChange={setRegisterCaptcha}
                      onValidationChange={setRegisterCaptchaValid}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium"
                      disabled={isLoading || !registerCaptchaValid}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
