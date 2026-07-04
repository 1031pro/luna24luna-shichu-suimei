import {
  BRANCH_ELEMENTS,
  getBranchIndex,
  getKanshi,
  getStemIndex,
  getTenGod,
  getTwelveStage,
  normalizeMod,
  STEM_ELEMENTS,
  STEMS,
  YIN_YANG,
} from "../data/kanshi.js";
import { getMonthBoundary, getRisshun } from "./setsuiri.js";
import {
  getKurokawaHiddenStem,
  getKurokawaHourPillar,
  getKurokawaVoidBranches,
  getSetsuiriDayInfo,
} from "./kurokawa.js";

const PILLAR_LABELS = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  time: "時柱",
};

function buildDate(input) {
  return new Date(
    input.year,
    input.month - 1,
    input.day,
    input.unknownTime ? 12 : input.hour,
    input.unknownTime ? 0 : input.minute,
    0,
    0,
  );
}

function getYearPillar(setsuiri, date) {
  const risshun = getRisshun(setsuiri, date.getFullYear());
  const yearForPillar = date < risshun ? date.getFullYear() - 1 : date.getFullYear();
  return getKanshi(yearForPillar - 4);
}

function getMonthPillar(setsuiri, date, yearStemIndex) {
  const boundary = getMonthBoundary(setsuiri, date);
  const branch = boundary.branch;
  const monthFromTiger = normalizeMod(getBranchIndex(branch) - getBranchIndex("寅"), 12);
  const tigerStemBase = [2, 4, 6, 8, 0][yearStemIndex % 5];
  const stemIndex = normalizeMod(tigerStemBase + monthFromTiger, 10);
  const branchIndex = getBranchIndex(branch);
  return {
    ...getKanshi(findKanshiIndex(stemIndex, branchIndex)),
    boundary,
  };
}

export function getDayPillar(date) {
  const base = new Date(1926, 0, 1, 0, 0, 0, 0);
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const elapsedDays = Math.floor((localDate - base) / 86400000);
  return getKanshi(elapsedDays + 26);
}

function findKanshiIndex(stemIndex, branchIndex) {
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) return index;
  }
  throw new Error(`干支が成立しません: stem=${stemIndex}, branch=${branchIndex}`);
}

function enrichPillar(key, pillar, dayStemIndex, setsuiriDayNumber) {
  const mainHiddenStem = getKurokawaHiddenStem(pillar.branch, setsuiriDayNumber);
  const hiddenStemIndex = getStemIndex(mainHiddenStem);

  return {
    key,
    ...pillar,
    pillarLabel: PILLAR_LABELS[key],
    kanshiLabel: pillar.label,
    stemElement: STEM_ELEMENTS[pillar.stemIndex],
    branchElement: BRANCH_ELEMENTS[pillar.branchIndex],
    stemYinYang: YIN_YANG[pillar.stemIndex],
    tenGod: key === "day" ? "" : getTenGod(dayStemIndex, pillar.stemIndex),
    hiddenStems: [mainHiddenStem],
    mainHiddenStem,
    hiddenTenGod: getTenGod(dayStemIndex, hiddenStemIndex),
    twelveStage: getTwelveStage(STEMS[dayStemIndex], pillar.branch),
  };
}

function getFiveElementBalance(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const pillar of pillars) {
    counts[pillar.stemElement] += 1;
    counts[pillar.branchElement] += 1;
  }
  return counts;
}

export function calculateChart(input, setsuiri) {
  const date = buildDate(input);
  const setsuiriDayInfo = getSetsuiriDayInfo(setsuiri, date);
  const yearPillar = getYearPillar(setsuiri, date);
  const monthPillar = getMonthPillar(setsuiri, date, yearPillar.stemIndex);
  const dayPillar = getDayPillar(date);
  const rawPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
  };

  if (!input.unknownTime) {
    rawPillars.time = getKurokawaHourPillar(dayPillar.stem, input.hour);
  }

  const pillars = Object.entries(rawPillars).map(([key, pillar]) =>
    enrichPillar(key, pillar, dayPillar.stemIndex, setsuiriDayInfo.dayNumber),
  );
  const voidBranches = getKurokawaVoidBranches(dayPillar.label);

  return {
    input,
    date,
    pillars,
    pillarMap: Object.fromEntries(pillars.map((pillar) => [pillar.key, pillar])),
    monthBoundary: monthPillar.boundary,
    setsuiriDayInfo,
    voidBranches,
    fiveElementBalance: getFiveElementBalance(pillars),
    notes: [
      "黒川式プロファイルでは、蔵干を月律分野蔵干早見表、通変星と十二運を日干基準で計算しています。",
      "23時台の日柱切替、真太陽時、早子時・夜子時は流派別オプションとして扱う前提です。",
    ],
  };
}

export function getAnnualPillar(year) {
  return getKanshi(year - 4);
}
