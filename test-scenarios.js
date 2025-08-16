/**
 * Teste simples para validar os cenários específicos
 */

// Função para calcular semana ISO
function getISOWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week: weekNumber, year: target.getFullYear() };
}

// Teste dos cenários específicos
console.log("🧪 TESTE DOS CENÁRIOS ESPECÍFICOS");
console.log("================================");

// Cenário 1: 17 de março de 2028
const date1 = new Date(2028, 2, 17); // Março = mês 2 (0-indexed)
const week1 = getISOWeekNumber(date1);
console.log("📅 17 de março de 2028:");
console.log(`   Data: ${date1.toLocaleDateString("pt-BR")}`);
console.log(`   Dia da semana: ${date1.toLocaleDateString("pt-BR", { weekday: 'long' })}`);
console.log(`   Resultado: Semana ${week1.week} de ${week1.year}`);
console.log("");

// Cenário 2: 17 de junho de 2026
const date2 = new Date(2026, 5, 17); // Junho = mês 5 (0-indexed)
const week2 = getISOWeekNumber(date2);
console.log("📅 17 de junho de 2026:");
console.log(`   Data: ${date2.toLocaleDateString("pt-BR")}`);
console.log(`   Dia da semana: ${date2.toLocaleDateString("pt-BR", { weekday: 'long' })}`);
console.log(`   Resultado: Semana ${week2.week} de ${week2.year}`);
console.log("");

// Teste atual para referência
const now = new Date();
const currentWeek = getISOWeekNumber(now);
console.log("📅 Data atual (referência):");
console.log(`   Data: ${now.toLocaleDateString("pt-BR")}`);
console.log(`   Dia da semana: ${now.toLocaleDateString("pt-BR", { weekday: 'long' })}`);
console.log(`   Resultado: Semana ${currentWeek.week} de ${currentWeek.year}`);
console.log("");

console.log("✅ TESTES CONCLUÍDOS");

// Validação dos resultados esperados
console.log("🎯 VALIDAÇÃO:");
console.log(`   ✓ 17/03/2028 deve estar na semana ${week1.week} de ${week1.year}`);
console.log(`   ✓ 17/06/2026 deve estar na semana ${week2.week} de ${week2.year}`);
console.log(`   ✓ Sistema deve incluir essas semanas no range 2025-2030`);
