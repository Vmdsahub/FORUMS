import { useState, useEffect, useCallback } from "react";
import {
  WeeklyNewsletter,
  getAllWeeks,
  getCurrentWeekIndex,
  isSunday,
} from "@/utils/weekSystem";

interface UseSimpleWeekNavigationProps {
  isAdmin?: boolean;
  articlesData?: any; // Dados de artigos vindos da API
}

export function useSimpleWeekNavigation({
  isAdmin = false,
  articlesData,
}: UseSimpleWeekNavigationProps) {
  // Obter todas as semanas disponíveis (2025-2030)
  const allWeeks = getAllWeeks();

  // Estado para a semana atual sendo exibida
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Estado para semanas com conteúdo (merge com dados da API)
  const [weeksWithContent, setWeeksWithContent] = useState<WeeklyNewsletter[]>(
    [],
  );

  // Inicialização: determinar semana atual baseada na data real
  useEffect(() => {
    const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
    setCurrentWeekIndex(realCurrentWeekIndex);

    console.log("Sistema de semanas inicializado:", {
      totalWeeks: allWeeks.length,
      currentWeekIndex: realCurrentWeekIndex,
      currentWeek: allWeeks[realCurrentWeekIndex],
      isAdmin,
    });
  }, [allWeeks, isAdmin]);

  // Merge dos dados da API com as semanas geradas
  useEffect(() => {
    console.log("🔄 Fazendo merge de dados:", {
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
            // Para compatibilidade, assumir que API retorna dados do ano atual
            (apiWeek.year === week.year || !apiWeek.year);

          if (matches) {
            console.log("📅 Match encontrado:", {
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
  }, [allWeeks, articlesData]);

  // Verificação automática de mudança de semana (a cada hora)
  useEffect(() => {
    const checkWeekChange = () => {
      const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);

      // Se mudou de semana e é domingo, atualizar automaticamente
      if (realCurrentWeekIndex !== currentWeekIndex && isSunday()) {
        console.log("Semana avançou automaticamente:", {
          from: currentWeekIndex,
          to: realCurrentWeekIndex,
          isSunday: isSunday(),
        });
        setCurrentWeekIndex(realCurrentWeekIndex);
      }
    };

    // Verificar imediatamente
    checkWeekChange();

    // Verificar a cada hora
    const interval = setInterval(checkWeekChange, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [allWeeks, currentWeekIndex]);

  // Função de navegação
  const navigateWeek = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        // Ir para semanas mais antigas (índice maior)
        if (isAdmin) {
          // Admin pode navegar para qualquer semana
          if (currentWeekIndex < weeksWithContent.length - 1) {
            setCurrentWeekIndex(currentWeekIndex + 1);
          }
        } else {
          // Usuário só pode ir para semanas que tenham conteúdo
          let nextIndex = currentWeekIndex + 1;
          while (nextIndex < weeksWithContent.length) {
            if (weeksWithContent[nextIndex]?.topics?.length > 0) {
              setCurrentWeekIndex(nextIndex);
              break;
            }
            nextIndex++;
          }
        }
      } else {
        // Ir para semanas mais recentes (índice menor)
        if (currentWeekIndex > 0) {
          if (isAdmin) {
            // Admin pode navegar livremente
            setCurrentWeekIndex(currentWeekIndex - 1);
          } else {
            // Usuário não pode ir para semanas futuras além da atual
            const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
            if (currentWeekIndex - 1 >= realCurrentWeekIndex) {
              setCurrentWeekIndex(currentWeekIndex - 1);
            }
          }
        }
      }
    },
    [currentWeekIndex, weeksWithContent, isAdmin, allWeeks],
  );

  // Verificar se pode navegar para trás
  const canNavigatePrev = useCallback(() => {
    if (isAdmin) {
      // Admin pode navegar para qualquer semana anterior
      return currentWeekIndex < weeksWithContent.length - 1;
    } else {
      // Usuário só pode ir para semanas com conteúdo
      let nextIndex = currentWeekIndex + 1;
      while (nextIndex < weeksWithContent.length) {
        if (weeksWithContent[nextIndex]?.topics?.length > 0) {
          return true;
        }
        nextIndex++;
      }
      return false;
    }
  }, [currentWeekIndex, weeksWithContent, isAdmin]);

  // Verificar se pode navegar para frente
  const canNavigateNext = useCallback(() => {
    if (currentWeekIndex <= 0) return false;

    if (isAdmin) {
      // Admin pode navegar livremente
      return true;
    } else {
      // Usuário não pode ir além da semana atual real
      const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
      return currentWeekIndex - 1 >= realCurrentWeekIndex;
    }
  }, [currentWeekIndex, isAdmin, allWeeks]);

  // Obter dados da semana atual
  const currentNewsletter = weeksWithContent[currentWeekIndex] || null;

  // Função para navegar diretamente para a semana atual
  const goToCurrentWeek = useCallback(() => {
    const realCurrentWeekIndex = getCurrentWeekIndex(allWeeks);
    setCurrentWeekIndex(realCurrentWeekIndex);
  }, [allWeeks]);

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

    // Utilitários
    isCurrentWeek: currentWeekIndex === getCurrentWeekIndex(allWeeks),
    totalWeeks: weeksWithContent.length,

    // Para debug
    debugInfo: {
      currentWeekIndex,
      realCurrentWeekIndex: getCurrentWeekIndex(allWeeks),
      isAdmin,
      hasContent: currentNewsletter?.topics?.length > 0,
      isSunday: isSunday(),
    },
  };
}
