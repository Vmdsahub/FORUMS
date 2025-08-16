// Debug específico para verificar as semanas 32-34 de 2025

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

function getWeekStartDate(year, week) {
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

function getWeekEndDate(year, week) {
  const startDate = getWeekStartDate(year, week);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate;
}

console.log("🔍 VERIFICANDO SEMANAS 32-34 DE 2025");
console.log("=====================================");

for (let week = 32; week <= 34; week++) {
  const startDate = getWeekStartDate(2025, week);
  const endDate = getWeekEndDate(2025, week);
  
  // Verificar se a semana realmente pertence a 2025
  const weekInfo = getISOWeekNumber(startDate);
  
  console.log(`📅 Semana ${week} de 2025:`);
  console.log(`   Início: ${startDate.toLocaleDateString("pt-BR")} (${startDate.toLocaleDateString("pt-BR", { weekday: 'long' })})`);
  console.log(`   Fim: ${endDate.toLocaleDateString("pt-BR")} (${endDate.toLocaleDateString("pt-BR", { weekday: 'long' })})`);
  console.log(`   Verificação ISO: semana ${weekInfo.week} de ${weekInfo.year}`);
  console.log(`   Válida: ${weekInfo.year === 2025 && weekInfo.week === week ? '✅' : '❌'}`);
  console.log("");
}

// Verificar data atual
const now = new Date();
const currentWeek = getISOWeekNumber(now);
console.log(`📅 Data/Semana atual: ${now.toLocaleDateString("pt-BR")} = Semana ${currentWeek.week} de ${currentWeek.year}`);
