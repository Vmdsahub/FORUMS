import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => {
    insertText("**", "**");
  };

  const handleItalic = () => {
    insertText("*", "*");
  };

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageMarkdown = `![${file.name}](${result.url})`;
        insertText(imageMarkdown);
        toast.success("Imagem carregada com sucesso!");
      } else {
        toast.error("Erro ao carregar imagem");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadVideo = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecione apenas arquivos de vídeo");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      // 500MB limit for 4K videos
      toast.error("Vídeo muito grande. Máximo 500MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const videoMarkdown = `[Vídeo: ${file.name}](${result.url})`;
        insertText(videoMarkdown);
        toast.success("Vídeo carregado com sucesso!");
      } else {
        toast.error("Erro ao carregar vídeo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar vídeo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadImage(file);
      event.target.value = ""; // Reset input
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadVideo(file);
      event.target.value = ""; // Reset input
    }
  };

  return (
    <div className="border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-black/20 focus-within:border-black/40">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBold}
          className="h-8 px-2"
          title="Negrito (Ctrl+B)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleItalic}
          className="h-8 px-2"
          title="Itálico (Ctrl+I)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImageUploadClick}
          disabled={isUploading}
          className="h-8 px-2"
          title="Adicionar imagem"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleVideoUploadClick}
          disabled={isUploading}
          className="h-8 px-2"
          title="Adicionar vídeo (até 4K, 500MB)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </Button>

        {isUploading && (
          <div className="flex items-center gap-2 ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            <span className="text-sm text-gray-600">Carregando...</span>
          </div>
        )}
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 resize-none min-h-[200px] focus:outline-none"
        rows={8}
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="hidden"
      />

      {/* Help text */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Dica: Use **texto** para negrito, *texto* para itálico. Suporte para
          imagens (até 10MB) e vídeos 4K (até 500MB).
        </p>
      </div>
    </div>
  );
}
