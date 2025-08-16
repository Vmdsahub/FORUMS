/**
 * Sistema de Semanas 2025-2030 - IA HUB Newsletter
 *
 * Este sistema gera automaticamente todas as semanas dos anos 2025-2030
 * e determina qual semana deve ser exibida baseada na data atual.
 */

export interface NewsletterTopic {
  id: number | string;
  title: string;
  content: string;
  readTime: string;
}

export interface WeeklyNewsletter {
  week: number;
  year: number;
  startDate: string;
  endDate: string;
  topics: NewsletterTopic[];
  realStartDate: Date;
  realEndDate: Date;
}

/**
 * Calcula o número da semana ISO 8601 para uma data específica
 */
export function getISOWeekNumber(date: Date): { week: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber =
    1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week: weekNumber, year: target.getFullYear() };
}

/**
 * Obtém a data de início da semana (segunda-feira) para uma semana específica
 */
export function getWeekStartDate(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Obtém a data de fim da semana (domingo) para uma semana específica
 */
export function getWeekEndDate(year: number, week: number): Date {
  const startDate = getWeekStartDate(year, week);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate;
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Formata uma data para exibição completa no formato brasileiro
 */
export function formatDateFullBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Gera todas as semanas para os anos 2025-2030
 */
export function generateAllWeeks(): WeeklyNewsletter[] {
  const weeks: WeeklyNewsletter[] = [];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  for (const year of years) {
    // Determinar quantas semanas tem o ano
    const lastDayOfYear = new Date(year, 11, 31);
    const lastWeekInfo = getISOWeekNumber(lastDayOfYear);

    // Se a última semana pertence ao próximo ano, usar 52 semanas
    const totalWeeks = lastWeekInfo.year === year ? lastWeekInfo.week : 52;

    for (let week = 1; week <= totalWeeks; week++) {
      const startDate = getWeekStartDate(year, week);
      const endDate = getWeekEndDate(year, week);

      // Verificar se a semana realmente pertence ao ano atual
      const weekInfo = getISOWeekNumber(startDate);
      if (weekInfo.year !== year) continue;

      weeks.push({
        week,
        year,
        startDate: formatDateBR(startDate),
        endDate: formatDateFullBR(endDate),
        topics: [], // Inicialmente vazia, será preenchida com conteúdo real
        realStartDate: startDate,
        realEndDate: endDate,
      });
    }
  }

  // Ordenar por ano e semana (mais recente primeiro)
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.week - a.week;
  });
}

/**
 * Encontra a semana atual baseada na data real
 */
export function getCurrentWeekIndex(weeks: WeeklyNewsletter[]): number {
  const now = new Date();
  const currentWeekInfo = getISOWeekNumber(now);

  console.log("🗓️ Procurando semana atual:", {
    today: now.toLocaleDateString("pt-BR"),
    currentWeekInfo,
    totalWeeks: weeks.length,
    firstWeek: weeks[0] ? `${weeks[0].week}/${weeks[0].year}` : "nenhuma",
    lastWeek: weeks[weeks.length - 1]
      ? `${weeks[weeks.length - 1].week}/${weeks[weeks.length - 1].year}`
      : "nenhuma",
  });

  // Encontrar a semana correspondente na lista
  const weekIndex = weeks.findIndex(
    (w) => w.week === currentWeekInfo.week && w.year === currentWeekInfo.year,
  );

  console.log("📍 Resultado da busca:", {
    weekIndex,
    found: weekIndex !== -1,
    foundWeek:
      weekIndex !== -1
        ? `${weeks[weekIndex].week}/${weeks[weekIndex].year}`
        : "não encontrada",
  });

  // Se encontrou a semana atual, retorna o índice
  if (weekIndex !== -1) {
    return weekIndex;
  }

  // Se não encontrou (caso edge), retorna a primeira semana disponível
  console.warn(
    "⚠️ Semana atual não encontrada, usando primeira semana disponível",
  );
  return 0;
}

/**
 * Verifica se é domingo (quando a semana deve avançar automaticamente)
 */
export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

/**
 * Verifica se uma data específica resultaria em uma semana específica
 * Usado para testes e validações
 */
export function getWeekForDate(date: Date): { week: number; year: number } {
  return getISOWeekNumber(date);
}

/**
 * Função para testar cenários específicos
 */
export function testScenarios() {
  const scenarios = [
    { date: new Date(2028, 2, 17), description: "17 de março de 2028" }, // mês 2 = março (0-indexed)
    { date: new Date(2026, 5, 17), description: "17 de junho de 2026" }, // mês 5 = junho (0-indexed)
  ];

  console.log("=== TESTE DE CENÁRIOS ===");

  for (const scenario of scenarios) {
    const weekInfo = getWeekForDate(scenario.date);
    const startDate = getWeekStartDate(weekInfo.year, weekInfo.week);
    const endDate = getWeekEndDate(weekInfo.year, weekInfo.week);

    console.log(`${scenario.description}:`);
    console.log(`  Semana: ${weekInfo.week} de ${weekInfo.year}`);
    console.log(
      `  Período: ${formatDateBR(startDate)} - ${formatDateFullBR(endDate)}`,
    );
    console.log(
      `  Data de teste: ${scenario.date.toLocaleDateString("pt-BR")}`,
    );
    console.log(
      `  Data está no período? ${scenario.date >= startDate && scenario.date <= endDate ? "SIM" : "NÃO"}`,
    );
    console.log("");
  }
}

/**
 * Sistema de cache para evitar recálculos desnecessários
 */
let _cachedWeeks: WeeklyNewsletter[] | null = null;

export function getAllWeeks(): WeeklyNewsletter[] {
  if (!_cachedWeeks) {
    _cachedWeeks = generateAllWeeks();
    console.log(
      `Sistema de semanas inicializado: ${_cachedWeeks.length} semanas geradas (2025-2030)`,
    );

    // Debug específico para as semanas problemáticas
    const weeks32to34 = _cachedWeeks.filter(
      (w) => w.year === 2025 && w.week >= 32 && w.week <= 34,
    );
    console.log(
      "🔍 Debug semanas 32-34 de 2025:",
      weeks32to34.map((w) => ({
        week: w.week,
        year: w.year,
        period: `${w.startDate} - ${w.endDate}`,
        topics: w.topics?.length || 0,
      })),
    );

    // Executar testes em desenvolvimento
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      // Importar e executar testes após inicialização
      import("./testWeekScenarios").then(({ runTestsIfDevelopment }) => {
        runTestsIfDevelopment();
      });
    }
  }
  return _cachedWeeks;
}

/**
 * Limpa o cache (útil para testes)
 */
export function clearWeeksCache(): void {
  _cachedWeeks = null;
}
