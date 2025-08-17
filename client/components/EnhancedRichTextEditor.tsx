import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageModal from "@/components/ImageModal";
import { SketchPicker } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Prism from "prismjs";

// Import Prism languages and themes
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-c";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Code detection patterns
const codePatterns = {
  javascript: /(?:function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|import\s+.*from|export\s+|console\.log|document\.|window\.|\.addEventListener)/,
  typescript: /(?:interface\s+\w+|type\s+\w+\s*=|implements\s+\w+|extends\s+\w+|:\s*string|:\s*number|:\s*boolean|<.*>)/,
  python: /(?:def\s+\w+|class\s+\w+|import\s+\w+|from\s+\w+\s+import|print\(|if\s+__name__\s*==|\.py$)/,
  java: /(?:public\s+class|private\s+|protected\s+|static\s+|void\s+|String\s+|int\s+|System\.out\.)/,
  cpp: /(?:#include\s*<|using\s+namespace|std::|cout\s*<<|cin\s*>>|int\s+main\(|void\s+\w+\()/,
  c: /(?:#include\s*<|printf\(|scanf\(|int\s+main\(|void\s+\w+\(|#define\s+)/,
  csharp: /(?:using\s+System|namespace\s+\w+|public\s+class|private\s+|Console\.WriteLine|string\s+\w+)/,
  php: /(?:<\?php|\$\w+\s*=|echo\s+|function\s+\w+|class\s+\w+|->|::)/,
  ruby: /(?:def\s+\w+|class\s+\w+|puts\s+|require\s+|@\w+|\.each\s+do)/,
  go: /(?:package\s+\w+|import\s+|func\s+\w+|var\s+\w+|fmt\.)/,
  rust: /(?:fn\s+\w+|let\s+\w+|pub\s+|use\s+|struct\s+|enum\s+|println!)/,
  sql: /(?:SELECT\s+|FROM\s+|WHERE\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|CREATE\s+TABLE)/i,
  bash: /(?:#!\/bin\/|echo\s+|ls\s+|cd\s+|mkdir\s+|rm\s+|sudo\s+|chmod\s+)/,
  json: /^\s*[\{\[]/,
  css: /(?:\w+\s*\{|\.[\w-]+\s*\{|#[\w-]+\s*\{|@media|display\s*:|color\s*:|margin\s*:)/,
  html: /(?:<html|<head|<body|<div|<span|<p|<!DOCTYPE)/i,
  react: /(?:import\s+React|from\s+['"]react['"]|export\s+default\s+function|useState|useEffect|JSX\.Element|<\w+.*>)/,
  vite: /(?:import\.meta|vite\.config|defineConfig|from\s+['"]vite['"])/
};

export default function EnhancedRichTextEditor({
  value,
  onChange,
  placeholder,
}: EnhancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const uploadcareInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
    isVideo: boolean;
  } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');

  // Initialize Uploadcare
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
    script.setAttribute('data-public-key', 'acdd15b9f97aec0bae14');
    document.head.appendChild(script);

    script.onload = () => {
      if ((window as any).uploadcare) {
        (window as any).uploadcare.start();
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Detect and highlight code automatically
  const detectAndHighlightCode = (text: string): string => {
    const lines = text.split('\n');
    let processedLines: string[] = [];
    let isInCodeBlock = false;
    let currentCodeBlock: string[] = [];
    let detectedLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line looks like code
      let languageDetected = '';
      for (const [lang, pattern] of Object.entries(codePatterns)) {
        if (pattern.test(line)) {
          languageDetected = lang;
          break;
        }
      }

      if (languageDetected && !isInCodeBlock) {
        // Start a code block
        isInCodeBlock = true;
        detectedLanguage = languageDetected;
        currentCodeBlock = [line];
      } else if (isInCodeBlock) {
        currentCodeBlock.push(line);
        
        // Check if we should end the code block (empty line or different pattern)
        if (line.trim() === '' && i < lines.length - 1) {
          const nextLine = lines[i + 1];
          let hasNextCodePattern = false;
          for (const [lang, pattern] of Object.entries(codePatterns)) {
            if (pattern.test(nextLine)) {
              hasNextCodePattern = true;
              break;
            }
          }
          
          if (!hasNextCodePattern) {
            // End code block
            const codeContent = currentCodeBlock.join('\n');
            const highlightedCode = highlightCode(codeContent, detectedLanguage);
            processedLines.push(createCodeBlock(highlightedCode, detectedLanguage, codeContent));
            isInCodeBlock = false;
            currentCodeBlock = [];
            detectedLanguage = '';
            processedLines.push(line); // Add the empty line
          } else {
            // Continue code block
          }
        }
      } else {
        processedLines.push(line);
      }
    }

    // Handle remaining code block at end
    if (isInCodeBlock && currentCodeBlock.length > 0) {
      const codeContent = currentCodeBlock.join('\n');
      const highlightedCode = highlightCode(codeContent, detectedLanguage);
      processedLines.push(createCodeBlock(highlightedCode, detectedLanguage, codeContent));
    }

    return processedLines.join('\n');
  };

  const highlightCode = (code: string, language: string): string => {
    try {
      const grammar = Prism.languages[language];
      if (grammar) {
        return Prism.highlight(code, grammar, language);
      }
    } catch (error) {
      console.warn('Error highlighting code:', error);
    }
    return code;
  };

  const createCodeBlock = (highlightedCode: string, language: string, originalCode: string): string => {
    const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `
      <div class="code-block-container" style="margin: 16px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #1e1e1e;">
        <div class="code-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #2d2d2d; border-bottom: 1px solid #404040;">
          <span style="color: #9ca3af; font-size: 12px; font-family: monospace;">${language.toUpperCase()}</span>
          <div style="display: flex; gap: 8px;">
            <button onclick="toggleCodeExpand('${codeId}')" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 12px; padding: 2px 6px; border-radius: 4px; hover:background: #404040;" title="Expandir/Recolher">⟷</button>
            <button onclick="copyCodeToClipboard('${codeId}')" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 12px; padding: 2px 6px; border-radius: 4px; hover:background: #404040;" title="Copiar código">📋</button>
          </div>
        </div>
        <div id="${codeId}" class="code-content" style="max-height: 150px; overflow: hidden; position: relative;">
          <pre style="margin: 0; padding: 12px; background: #1e1e1e; color: #f8f8f2; font-family: 'Fira Code', 'Monaco', 'Consolas', monospace; font-size: 14px; line-height: 1.4; overflow-x: auto;"><code class="language-${language}">${highlightedCode}</code></pre>
          <div class="code-original" style="display: none;">${originalCode}</div>
        </div>
      </div>
    `;
  };

  // Global functions for code blocks
  useEffect(() => {
    (window as any).toggleCodeExpand = (codeId: string) => {
      const element = document.getElementById(codeId);
      if (element) {
        const isExpanded = element.style.maxHeight === 'none' || element.style.maxHeight === '';
        element.style.maxHeight = isExpanded ? '150px' : 'none';
      }
    };

    (window as any).copyCodeToClipboard = (codeId: string) => {
      const element = document.getElementById(codeId);
      if (element) {
        const originalCodeDiv = element.querySelector('.code-original');
        if (originalCodeDiv) {
          const code = originalCodeDiv.textContent || '';
          navigator.clipboard.writeText(code).then(() => {
            toast.success('Código copiado para a área de transferência!');
          }).catch(() => {
            toast.error('Erro ao copiar código');
          });
        }
      }
    };

    return () => {
      delete (window as any).toggleCodeExpand;
      delete (window as any).copyCodeToClipboard;
    };
  }, []);

  // Sync editor content with value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Configure global function to open modal
  useEffect(() => {
    (window as any).openImageModal = (
      src: string,
      alt: string,
      isVideo: boolean,
    ) => {
      setModalImage({ src, alt, isVideo });
    };

    return () => {
      delete (window as any).openImageModal;
    };
  }, []);

  // Manage placeholder manually
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updatePlaceholder = () => {
      const isEmpty =
        editor.innerHTML.trim() === "" || editor.innerHTML === "<br>";
      if (isEmpty && placeholder) {
        editor.setAttribute("data-empty", "true");
      } else {
        editor.removeAttribute("data-empty");
      }
    };

    updatePlaceholder();
    editor.addEventListener("input", updatePlaceholder);
    editor.addEventListener("focus", updatePlaceholder);
    editor.addEventListener("blur", updatePlaceholder);

    return () => {
      editor.removeEventListener("input", updatePlaceholder);
      editor.removeEventListener("focus", updatePlaceholder);
      editor.removeEventListener("blur", updatePlaceholder);
    };
  }, [placeholder]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const processedContent = detectAndHighlightCode(content);
      onChange(processedContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleHeading = () => execCommand("formatBlock", "H3");

  const handleLink = () => {
    const url = prompt("Digite a URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    execCommand("foreColor", color.hex);
    setShowColorPicker(false);
  };

  const handleUploadcare = () => {
    if ((window as any).uploadcare) {
      const dialog = (window as any).uploadcare.openDialog(null, {
        publicKey: 'acdd15b9f97aec0bae14',
        multiple: false,
        crop: false,
        tabs: 'file url',
        inputAcceptTypes: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.zip,.rar,.mp4,.mp3',
        imagesOnly: false,
        systemDialog: true,
      });

      dialog.done((file: any) => {
        file.promise().done((fileInfo: any) => {
          const fileName = fileInfo.name || 'Arquivo';
          const fileUrl = fileInfo.cdnUrl;
          const isImage = fileInfo.isImage;
          
          if (isImage) {
            insertImageHtml(fileUrl, fileName);
          } else {
            insertFileLink(fileUrl, fileName);
          }
          toast.success('Arquivo carregado com sucesso!');
        });
      });
    } else {
      toast.error('Uploadcare não está disponível');
    }
  };

  const insertImageHtml = (src: string, alt: string) => {
    const img = `<div style="margin: 16px 0; text-align: center;"><img src="${src}" alt="${alt}" style="max-width: 300px; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="window.openImageModal('${src}', '${alt}', false)" /></div>`;
    execCommand("insertHTML", img);
  };

  const insertVideoHtml = (src: string, name: string) => {
    const video = `<div style="margin: 16px 0; text-align: center;"><video controls style="max-width: 300px; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer;" onclick="window.openImageModal('${src}', '${name}', true)"><source src="${src}" type="video/mp4"><source src="${src}" type="video/webm">Seu navegador não suporta vídeo HTML5.</video><p style="font-size: 14px; color: #6b7280; margin-top: 8px;">📹 ${name}</p></div>`;
    execCommand("insertHTML", video);
  };

  const insertFileLink = (url: string, name: string) => {
    const fileLink = `<div style="margin: 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 8px; color: #3b82f6; text-decoration: none; font-weight: 500;"><span style="font-size: 20px;">📎</span><span>${name}</span><span style="margin-left: auto; font-size: 12px; color: #6b7280;">Clique para baixar</span></a></div>`;
    execCommand("insertHTML", fileLink);
  };

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
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
        insertImageHtml(result.url, file.name);
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
        insertVideoHtml(result.url, file.name);
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

  const handleImageUploadClick = () => fileInputRef.current?.click();
  const handleVideoUploadClick = () => videoInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadImage(file);
      event.target.value = "";
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadVideo(file);
      event.target.value = "";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBold}
          className="h-8 px-2 hover:bg-gray-100"
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
          className="h-8 px-2 hover:bg-gray-100"
          title="Itálico (Ctrl+I)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUnderline}
          className="h-8 px-2 hover:bg-gray-100"
          title="Sublinhado"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleHeading}
          className="h-8 px-2 hover:bg-gray-100"
          title="Título"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 4v3h5.5v12h3V7H19V4z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLink}
          className="h-8 px-2 hover:bg-gray-100"
          title="Link"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6v2H5v5h5v2l3-4.5L10 6zM19 15l-3-4.5L19 6v2h5v5h-5v2z" />
          </svg>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color Picker */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 hover:bg-gray-100"
              title="Cor do texto"
            >
              <div className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-1.1 0-2 .9-2 2v6l-4 4h12l-4-4V5c0-1.1-.9-2-2-2z" />
                </svg>
                <div 
                  className="w-3 h-3 rounded border border-gray-300" 
                  style={{ backgroundColor: currentColor }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="bottom" align="start">
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
              width="200px"
            />
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImageUploadClick}
          disabled={isUploading}
          className="h-8 px-2 hover:bg-gray-100"
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
          className="h-8 px-2 hover:bg-gray-100"
          title="Adicionar vídeo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadcare}
          className="h-8 px-2 hover:bg-gray-100"
          title="Upload de arquivos seguros (Uploadcare)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
        </Button>

        {isUploading && (
          <div className="flex items-center gap-2 ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-gray-600">Carregando...</span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full p-3 min-h-[200px] focus:outline-none bg-white rich-editor"
        style={{
          lineHeight: "1.6",
          fontSize: "14px",
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* CSS for placeholder and code blocks */}
      <style>{`
        .rich-editor[data-empty="true"]:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        .rich-editor {
          position: relative;
        }
        .code-block-container {
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
        }
        .code-block-container button:hover {
          background: #404040 !important;
        }
      `}</style>

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
          <strong>Recursos:</strong> Formatação rica, código detectado automaticamente, 
          seletor de cores, upload seguro de arquivos via Uploadcare. 
          Suporte para imagens (até 10MB), vídeos (até 500MB) e documentos.
        </p>
      </div>

      {/* Modal de imagem/vídeo */}
      <ImageModal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        src={modalImage?.src || ""}
        alt={modalImage?.alt || ""}
        isVideo={modalImage?.isVideo || false}
      />
    </div>
  );
}
