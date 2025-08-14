import { RequestHandler } from "express";
import { z } from "zod";

interface NewsletterArticle {
  id: string;
  title: string;
  content: string;
  readTime: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  week: number;
  startDate: string;
  endDate: string;
}

// In-memory storage for newsletter articles
const articles: Map<string, NewsletterArticle> = new Map();

// Initialize with current week example if empty
function initializeDemo() {
  if (articles.size === 0) {
    const currentWeekInfo = getCurrentWeekInfo();
    const exampleArticle: NewsletterArticle = {
      id: "demo_" + Date.now(),
      title: "Newsletter Semanal - Sistema Real Implementado",
      content: `Este é o primeiro artigo criado no sistema real de newsletter semanal do IA HUB!

O sistema agora suporta:

• Criação de artigos por administradores
• Agrupamento automático por semana
• Persistência real (enquanto o servidor estiver rodando)
• Exclusão de artigos
• Interface responsiva e intuitiva

Funcionalidades técnicas:
• API REST completa para gerenciamento de artigos
• Autenticação baseada em tokens
• Validação de dados com Zod
• Agrupamento inteligente por semanas
• Interface moderna com React e TypeScript

Como usar:
1. Faça login como administrador
2. Clique em "Adicionar Novo Artigo da Newsletter"
3. Preencha o título, conteúdo e tempo de leitura
4. O artigo será automaticamente agrupado na semana atual

Este sistema substitui completamente os dados demo anteriores e agora funciona com dados reais persistidos no servidor.`,
      readTime: "3 min",
      authorId: "system",
      authorName: "Sistema IA HUB",
      createdAt: new Date().toISOString(),
      week: currentWeekInfo.week,
      startDate: currentWeekInfo.startDate,
      endDate: currentWeekInfo.endDate,
    };

    articles.set(exampleArticle.id, exampleArticle);
  }
}

// Initialize demo data
initializeDemo();

// Validation schema
const createArticleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  readTime: z.string().min(1, "Tempo de leitura é obrigatório"),
});

// Get ISO week number (standard international week numbering)
function getISOWeekNumber(date: Date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

// Helper function to get current week info using ISO 8601 week standard
function getCurrentWeekInfo() {
  const now = new Date();

  // Calculate ISO week number (more accurate)
  const weekNumber = getISOWeekNumber(now);

  // Get start of current week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  // Get end of current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return {
    week: weekNumber,
    startDate: startOfWeek.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    endDate: endOfWeek.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

// Create article
export const handleCreateArticle: RequestHandler = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Apenas administradores podem criar artigos" });
    }

    const { title, content, readTime } = createArticleSchema.parse(req.body);

    const currentWeekInfo = getCurrentWeekInfo();
    const articleId =
      Date.now().toString() + "_" + Math.random().toString(36).substring(2);

    const article: NewsletterArticle = {
      id: articleId,
      title,
      content,
      readTime,
      authorId: req.user.id,
      authorName: req.user.name,
      createdAt: new Date().toISOString(),
      week: currentWeekInfo.week,
      startDate: currentWeekInfo.startDate,
      endDate: currentWeekInfo.endDate,
    };

    articles.set(articleId, article);

    res.status(201).json({
      message: "Artigo criado com sucesso",
      article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: error.errors.map((e) => e.message),
      });
    }

    console.error("Create article error:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
    });
  }
};

// Get all articles grouped by week
export const handleGetArticles: RequestHandler = (req, res) => {
  try {
    const allArticles = Array.from(articles.values());

    // Group articles by week
    const articlesByWeek = allArticles.reduce(
      (acc, article) => {
        const weekKey = article.week;
        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: article.week,
            startDate: article.startDate,
            endDate: article.endDate,
            topics: [],
          };
        }

        acc[weekKey].topics.push({
          id: article.id, // Keep original string ID for proper deletion
          title: article.title,
          content: article.content,
          readTime: article.readTime,
        });

        return acc;
      },
      {} as Record<number, any>,
    );

    // Convert to array and sort by week (newest first)
    const weeklyNewsletters = Object.values(articlesByWeek).sort(
      (a, b) => b.week - a.week,
    );

    res.json({ weeklyNewsletters });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({
      message: "Erro ao buscar artigos",
    });
  }
};

// Delete article
export const handleDeleteArticle: RequestHandler = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Apenas administradores podem excluir artigos" });
    }

    const { articleId } = req.params;

    if (!articles.has(articleId)) {
      return res.status(404).json({ message: "Artigo não encontrado" });
    }

    articles.delete(articleId);

    res.json({ message: "Artigo excluído com sucesso" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({
      message: "Erro ao excluir artigo",
    });
  }
};
