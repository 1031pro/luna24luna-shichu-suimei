import { KUROKAWA_HIDDEN_STEM_TABLE, KUROKAWA_HOUR_PILLAR_TABLE, KUROKAWA_VOID_TABLE } from "../data/kurokawa.js";
import { BRANCHES, getKanshi, getStemIndex, normalizeMod, STEMS } from "../data/kanshi.js";
import { getMonthBoundary } from "./setsuiri.js";

function calendarDayDiff(a, b) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 0, 0, 0, 0);
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0, 0);
  return Math.floor((end - start) / 86400000);
}

function hiddenStemRowKey(dayNumber) {
  if (dayNumber <= 7) return "節入後7日まで";
  if (dayNumber >= 21) return "21日以後";
  return `${dayNumber}日`;
}

function hourBranch(hour) {
  if (hour === 23 || hour === 0) return "子";
  return BRANCHES[Math.floor((hour + 1) / 2) % 12];
}

function hourStemGroup(dayStem) {
  return Object.keys(KUROKAWA_HOUR_PILLAR_TABLE).find((group) => group.includes(dayStem));
}

function findKanshiByLabel(label) {
  for (let index = 0; index < 60; index += 1) {
    const pillar = getKanshi(index);
    if (pillar.label === label) return pillar;
  }
  throw new Error(`干支が見つかりません: ${label}`);
}

export function getSetsuiriDayInfo(setsuiri, date) {
  const boundary = getMonthBoundary(setsuiri, date);
  const diff = calendarDayDiff(boundary.date, date);
  return {
    boundary,
    dayNumber: Math.max(1, diff),
  };
}

export function getKurokawaHiddenStem(branch, dayNumber) {
  const rowKey = hiddenStemRowKey(dayNumber);
  const stem = KUROKAWA_HIDDEN_STEM_TABLE[rowKey]?.[branch];
  if (!stem) throw new Error(`黒川式蔵干が見つかりません: branch=${branch}, dayNumber=${dayNumber}`);
  return stem;
}

export function getKurokawaHourPillar(dayStem, hour) {
  const group = hourStemGroup(dayStem);
  const branch = hourBranch(hour);
  const label = KUROKAWA_HOUR_PILLAR_TABLE[group]?.[branch];
  if (!label) throw new Error(`黒川式時柱が見つかりません: dayStem=${dayStem}, hour=${hour}`);
  return findKanshiByLabel(label);
}

export function getKurokawaVoidBranches(dayKanshiLabel) {
  const entry = Object.entries(KUROKAWA_VOID_TABLE).find(([, labels]) => labels.includes(dayKanshiLabel));
  if (!entry) throw new Error(`黒川式空亡が見つかりません: ${dayKanshiLabel}`);
  return [...entry[0]];
}

export function getKurokawaLuckDirection(yearStemYinYang, sex) {
  const forward = (sex === "male" && yearStemYinYang === "陽") || (sex === "female" && yearStemYinYang === "陰");
  return {
    forward,
    label: forward ? "順運" : "逆運",
  };
}

export function getKurokawaMajorLuckStart(dayNumber, direction, boundary) {
  const baseDays = direction.forward ? Math.max(1, 30 - dayNumber) : Math.max(1, dayNumber);
  return {
    age: Math.max(1, Math.ceil(baseDays / 3)),
    target: boundary,
    diffDays: baseDays,
    dayNumber,
    formula: direction.forward ? "(30 - 節入日より何日目) ÷ 3" : "節入日より何日目 ÷ 3",
  };
}

export function getKurokawaKanshiFromStemBranch(stem, branch) {
  const stemIndex = getStemIndex(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) return getKanshi(index);
  }
  throw new Error(`干支が成立しません: stem=${stem}, branch=${branch}, normalized=${normalizeMod(stemIndex, 10)}`);
}

export function getKurokawaStem(stemIndex) {
  return STEMS[stemIndex];
}
