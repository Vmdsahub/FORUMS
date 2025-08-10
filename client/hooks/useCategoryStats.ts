import { useState, useEffect } from "react";

interface CategoryStats {
  totalTopics: number;
  totalPosts: number;
  lastPost?: {
    title: string;
    author: string;
    date: string;
    time: string;
  };
}

interface CategoryStatsResponse {
  categories: {
    [key: string]: CategoryStats;
  };
}

export function useCategoryStats() {
  const [categoryStats, setCategoryStats] = useState<CategoryStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/categories/stats");
      
      if (response.ok) {
        const data = await response.json();
        setCategoryStats(data);
      } else {
        throw new Error("Failed to fetch category stats");
      }
    } catch (err) {
      console.error("Error fetching category stats:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const refreshStats = () => {
    fetchCategoryStats();
  };

  return {
    categoryStats: categoryStats?.categories || {},
    isLoading,
    error,
    refreshStats,
  };
}
