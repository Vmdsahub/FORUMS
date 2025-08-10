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

// Validation schema
const createArticleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  readTime: z.string().min(1, "Tempo de leitura é obrigatório"),
});

// Helper function to get current week info
function getCurrentWeekInfo() {
  const now = new Date();
  const weekNumber = Math.ceil(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  
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
    startDate: startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    endDate: endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  };
}

// Create article
export const handleCreateArticle: RequestHandler = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Apenas administradores podem criar artigos" });
    }

    const { title, content, readTime } = createArticleSchema.parse(req.body);
    
    const currentWeekInfo = getCurrentWeekInfo();
    const articleId = Date.now().toString() + "_" + Math.random().toString(36).substring(2);
    
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
      endDate: currentWeekInfo.endDate
    };
    
    articles.set(articleId, article);
    
    res.status(201).json({
      message: "Artigo criado com sucesso",
      article
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
    const articlesByWeek = allArticles.reduce((acc, article) => {
      const weekKey = article.week;
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: article.week,
          startDate: article.startDate,
          endDate: article.endDate,
          topics: []
        };
      }
      
      acc[weekKey].topics.push({
        id: parseInt(article.id.split('_')[0]), // Use timestamp as numeric ID for frontend compatibility
        title: article.title,
        content: article.content,
        readTime: article.readTime
      });
      
      return acc;
    }, {} as Record<number, any>);
    
    // Convert to array and sort by week (newest first)
    const weeklyNewsletters = Object.values(articlesByWeek).sort((a, b) => b.week - a.week);
    
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
      return res.status(403).json({ message: "Apenas administradores podem excluir artigos" });
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
