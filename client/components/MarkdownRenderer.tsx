import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
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
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 border border-gray-200" loading="lazy" />',
    );

    // Convert video links [Video: name](url) to video tags
    processedContent = processedContent.replace(
      /\[Vídeo: (.*?)\]\((.*?)\)/g,
      '<div class="my-4"><video controls class="max-w-full h-auto rounded-lg border border-gray-200" preload="metadata"><source src="$2" type="video/mp4">Seu navegador não suporta vídeo HTML5.</video><p class="text-sm text-gray-600 mt-2">📹 $1</p></div>',
    );

    // Convert line breaks to <br>
    processedContent = processedContent.replace(/\n/g, "<br>");

    return processedContent;
  };

  return (
    <div
      className="prose max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderContent() }}
    />
  );
}
