import { getKanshi, getTenGod, normalizeMod, STEMS, YIN_YANG } from "../data/kanshi.js";
import { getAnnualPillar } from "./chart.js";
import { getSurroundingSetsuiri } from "./setsuiri.js";

function daysBetween(a, b) {
  return Math.abs(b - a) / 86400000;
}

function getLuckDirection(chart, sex) {
  const yearStemYinYang = chart.pillarMap.year.stemYinYang;
  const forward = (sex === "male" && yearStemYinYang === "陽") || (sex === "female" && yearStemYinYang === "陰");
  return {
    forward,
    label: forward ? "順行" : "逆行",
  };
}

function getMajorLuckStartAge(chart, setsuiri, direction) {
  const { previous, next } = getSurroundingSetsuiri(setsuiri, chart.date);
  const target = direction.forward ? next : previous;
  const diffDays = daysBetween(chart.date, target.date);
  return {
    age: Math.max(1, Math.ceil(diffDays / 3)),
    target,
    diffDays,
  };
}

function enrichLuckPillar(pillar, dayStemIndex) {
  return {
    ...pillar,
    tenGod: getTenGod(dayStemIndex, pillar.stemIndex),
  };
}

export function calculateMajorLuck(chart, setsuiri, currentYear) {
  const direction = getLuckDirection(chart, chart.input.sex);
  const start = getMajorLuckStartAge(chart, setsuiri, direction);
  const monthIndex = chart.pillarMap.month.index;
  const dayStemIndex = chart.pillarMap.day.stemIndex;
  const currentAge = currentYear - chart.input.year;

  const rows = Array.from({ length: 10 }, (_, i) => {
    const ageStart = i === 0 ? 0 : start.age + (i - 1) * 10;
    const ageEnd = i === 0 ? start.age - 1 : ageStart + 9;
    const offset = i === 0 ? 0 : i * (direction.forward ? 1 : -1);
    const pillar = enrichLuckPillar(getKanshi(monthIndex + offset), dayStemIndex);
    return {
      order: i + 1,
      ageStart,
      ageEnd,
      yearStart: chart.input.year + ageStart,
      yearEnd: chart.input.year + ageEnd,
      pillar,
      active: currentAge >= ageStart && currentAge <= ageEnd,
    };
  });

  return {
    direction,
    start,
    currentAge,
    rows,
  };
}

export function calculateAnnualLuck(chart, currentYear, maxAge = 100) {
  const dayStemIndex = chart.pillarMap.day.stemIndex;
  return Array.from({ length: maxAge + 1 }, (_, age) => {
    const year = chart.input.year + age;
    const pillar = getAnnualPillar(year);
    return {
      year,
      age,
      pillar: {
        ...pillar,
        tenGod: getTenGod(dayStemIndex, pillar.stemIndex),
        stemYinYang: YIN_YANG[pillar.stemIndex],
        stem: STEMS[pillar.stemIndex],
      },
      active: year === currentYear,
    };
  });
}
