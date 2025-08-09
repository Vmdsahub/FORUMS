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
      '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow" loading="lazy" /><p class="text-sm text-gray-600 mt-2 text-center">$1</p></div>',
    );

    // Convert video links [Video: name](url) to video tags
    processedContent = processedContent.replace(
      /\[Vídeo: (.*?)\]\((.*?)\)/g,
      '<div class="my-4"><div class="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"><video controls class="w-full h-auto" preload="metadata"><source src="$2" type="video/mp4"><source src="$2" type="video/webm"><source src="$2" type="video/mov">Seu navegador não suporta vídeo HTML5.</video></div><p class="text-sm text-gray-600 mt-2 flex items-center gap-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-blue-600"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>$1</p></div>',
    );

    // Convert code blocks ```code``` to styled blocks
    processedContent = processedContent.replace(
      /```([\s\S]*?)```/g,
      '<div class="my-4 p-4 bg-gray-100 rounded-lg border border-gray-200"><code class="text-sm font-mono text-gray-800 whitespace-pre-wrap">$1</code></div>',
    );

    // Convert inline code `code` to styled spans
    processedContent = processedContent.replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">$1</code>',
    );

    // Convert lists
    processedContent = processedContent.replace(
      /^[-*+] (.+)$/gm,
      '<li class="ml-4 mb-1">• $1</li>',
    );

    // Convert numbered lists
    processedContent = processedContent.replace(
      /^\d+\. (.+)$/gm,
      '<li class="ml-4 mb-1 list-decimal">$1</li>',
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
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    />
  );
}
