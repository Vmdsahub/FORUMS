import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
    // Se o conteúdo já é HTML (contém tags), renderiza diretamente
    if (content.includes("<") && content.includes(">")) {
      return content;
    }

    // Caso contrário, converte markdown básico para HTML
    let processedContent = content;

    // Convert **bold** to <strong>
    processedContent = processedContent.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>",
    );

    // Convert *italic* to <em>
    processedContent = processedContent.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert image markdown ![alt](url) to img tags
    processedContent = processedContent.replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<div style="margin: 16px 0;"><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb;" loading="lazy" /><p style="font-size: 14px; color: #6b7280; margin-top: 8px; text-align: center;">$1</p></div>',
    );

    // Convert video links [Video: name](url) to video tags
    processedContent = processedContent.replace(
      /\[Vídeo: (.*?)\]\((.*?)\)/g,
      '<div style="margin: 16px 0;"><div style="position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;"><video controls style="width: 100%; height: auto;" preload="metadata"><source src="$2" type="video/mp4"><source src="$2" type="video/webm"><source src="$2" type="video/mov">Seu navegador não suporta vídeo HTML5.</video></div><p style="font-size: 14px; color: #6b7280; margin-top: 8px; display: flex; align-items: center; gap: 4px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: #2563eb;"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>$1</p></div>',
    );

    // Convert code blocks ```code``` to styled blocks
    processedContent = processedContent.replace(
      /```([\s\S]*?)```/g,
      '<div style="margin: 16px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb;"><code style="font-size: 14px; font-family: monospace; color: #374151; white-space: pre-wrap;">$1</code></div>',
    );

    // Convert inline code `code` to styled spans
    processedContent = processedContent.replace(
      /`([^`]+)`/g,
      '<code style="padding: 2px 6px; background-color: #f3f4f6; color: #374151; border-radius: 4px; font-size: 14px; font-family: monospace;">$1</code>',
    );

    // Convert line breaks to <br>
    processedContent = processedContent.replace(/\n/g, "<br>");

    return processedContent;
  };

  return (
    <div
      className="prose max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderContent() }}
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    />
  );
}
