import { useState, useEffect, useCallback, useMemo } from "react";
import {
  WeeklyNewsletter,
  getAllWeeks,
  getCurrentWeekIndex,
  clearWeeksCache,
} from "@/utils/weekSystem";

interface UseSimpleWeekNavigationProps {
  isAdmin?: boolean;
  articlesData?: any; // Dados de artigos vindos da API
}

export function useSimpleWeekNavigation({
  isAdmin = false,
  articlesData,
}: UseSimpleWeekNavigationProps) {
  // Obter todas as semanas disponíveis (2025-2030) - memoizado para evitar recálculo
  const allWeeks = useMemo(() => {
    // Limpar cache apenas uma vez se for desenvolvimento
    if (process.env.NODE_ENV === "development") {
      clearWeeksCache();
    }
    return getAllWeeks();
  }, []); // Sem dependências para garantir que seja calculado apenas uma vez

  // Estado para a semana atual sendo exibida
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Estado para semanas com conteúdo (merge com dados da API)
  const [weeksWithContent, setWeeksWithContent] = useState<WeeklyNewsletter[]>([]);

  // Inicialização: determinar semana atual baseada na data real
  useEffect(() => {
    const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
    setCurrentWeekIndex(realCurrentWeekIndex);

    console.log("✅ Sistema de navegação de semanas inicializado:", {
      totalWeeks: allWeeks.length,
      currentWeekIndex: realCurrentWeekIndex,
      currentWeek: allWeeks[realCurrentWeekIndex],
      isAdmin,
      date: new Date().toLocaleDateString("pt-BR"),
    });
  }, [allWeeks.length, isAdmin]); // Usando length em vez do array completo

  // Merge dos dados da API com as semanas geradas
  useEffect(() => {
    console.log("🔄 Fazendo merge de dados da newsletter:", {
      articlesData,
      hasWeeklyNewsletters: !!articlesData?.weeklyNewsletters,
      weeklyNewslettersCount: articlesData?.weeklyNewsletters?.length || 0,
      allWeeksCount: allWeeks.length,
    });

    const mergedWeeks = allWeeks.map((week) => {
      // Procurar se existe conteúdo para esta semana nos dados da API
      if (articlesData?.weeklyNewsletters) {
        const apiWeek = articlesData.weeklyNewsletters.find((apiWeek: any) => {
          const matches =
            apiWeek.week === week.week &&
            (apiWeek.year === week.year || !apiWeek.year);

          if (matches) {
            console.log("📅 Conteúdo encontrado para semana:", {
              systemWeek: `${week.week}/${week.year}`,
              apiWeek: `${apiWeek.week}/${apiWeek.year || "sem ano"}`,
              topicsCount: apiWeek.topics?.length || 0,
            });
          }

          return matches;
        });

        if (apiWeek) {
          return {
            ...week,
            topics: apiWeek.topics || [],
          };
        }
      }

      return week; // Retorna semana vazia se não há conteúdo
    });

    console.log("✅ Merge concluído:", {
      weeksWithContent: mergedWeeks.filter((w) => w.topics?.length > 0).length,
      totalWeeks: mergedWeeks.length,
    });

    setWeeksWithContent(mergedWeeks);
  }, [allWeeks.length, articlesData]); // Usando length em vez do array completo

  // Função de navegação simplificada
  const navigateWeek = useCallback(
    (direction: "prev" | "next") => {
      console.log("🧭 Navegando:", {
        direction,
        currentIndex: currentWeekIndex,
        isAdmin,
        totalWeeks: weeksWithContent.length,
      });

      if (direction === "prev") {
        // Ir para semanas mais antigas (índice maior)
        const nextIndex = currentWeekIndex + 1;
        if (nextIndex < weeksWithContent.length) {
          console.log("⬅️ Navegando para semana anterior:", {
            from: `${weeksWithContent[currentWeekIndex]?.week}/${weeksWithContent[currentWeekIndex]?.year}`,
            to: `${weeksWithContent[nextIndex]?.week}/${weeksWithContent[nextIndex]?.year}`,
          });
          setCurrentWeekIndex(nextIndex);
        } else {
          console.log("⚠️ Não é possível navegar mais para trás");
        }
      } else {
        // Ir para semanas mais recentes (índice menor)
        const nextIndex = currentWeekIndex - 1;
        if (nextIndex >= 0) {
          console.log("➡️ Navegando para semana seguinte:", {
            from: `${weeksWithContent[currentWeekIndex]?.week}/${weeksWithContent[currentWeekIndex]?.year}`,
            to: `${weeksWithContent[nextIndex]?.week}/${weeksWithContent[nextIndex]?.year}`,
          });
          setCurrentWeekIndex(nextIndex);
        } else {
          console.log("⚠️ Não é possível navegar mais para frente");
        }
      }
    },
    [currentWeekIndex, weeksWithContent]
  );

  // Verificar se pode navegar para trás (semanas mais antigas)
  const canNavigatePrev = useCallback(() => {
    return currentWeekIndex < weeksWithContent.length - 1;
  }, [currentWeekIndex, weeksWithContent.length]);

  // Verificar se pode navegar para frente (semanas mais recentes)
  const canNavigateNext = useCallback(() => {
    return currentWeekIndex > 0;
  }, [currentWeekIndex]);

  // Obter dados da semana atual
  const currentNewsletter = weeksWithContent[currentWeekIndex] || null;

  // Função para navegar diretamente para a semana atual real
  const goToCurrentWeek = useCallback(() => {
    const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
    console.log("🎯 Navegando para semana atual:", {
      from: currentWeekIndex,
      to: realCurrentWeekIndex,
    });
    setCurrentWeekIndex(realCurrentWeekIndex);
  }, [allWeeks, currentWeekIndex]);

  // Verificar se está na semana atual real - memoizado para evitar recálculo
  const realCurrentWeekIndex = useMemo(() => getCurrentWeekIndex(allWeeks), [allWeeks]);
  const isCurrentWeek = currentWeekIndex === realCurrentWeekIndex;

  return {
    // Dados principais
    currentNewsletter,
    currentWeekIndex,
    allWeeks: weeksWithContent,

    // Funções de navegação
    navigateWeek,
    canNavigatePrev,
    canNavigateNext,
    goToCurrentWeek,

    // Status
    isCurrentWeek,
    totalWeeks: weeksWithContent.length,

    // Para debug
    debugInfo: {
      currentWeekIndex,
      realCurrentWeekIndex,
      isAdmin,
      hasContent: currentNewsletter?.topics?.length > 0,
      currentWeekDisplay: currentNewsletter ? `${currentNewsletter.week}/${currentNewsletter.year}` : "nenhuma",
      canNavPrev: canNavigatePrev(),
      canNavNext: canNavigateNext(),
    },
  };
}
