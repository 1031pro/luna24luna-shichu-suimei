export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const STEM_ELEMENTS = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
export const BRANCH_ELEMENTS = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
export const YIN_YANG = ["陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"];

export const TEN_GODS = ["比肩", "劫財", "食神", "傷官", "偏財", "正財", "偏官", "正官", "偏印", "印綬"];
export const TWELVE_STAGES = ["長生", "沐浴", "冠帯", "建禄", "帝旺", "衰", "病", "死", "墓", "絶", "胎", "養"];

export const HIDDEN_STEMS = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

export const MAIN_HIDDEN_STEM = {
  子: "癸",
  丑: "己",
  寅: "甲",
  卯: "乙",
  辰: "戊",
  巳: "丙",
  午: "丁",
  未: "己",
  申: "庚",
  酉: "辛",
  戌: "戊",
  亥: "壬",
};

export const SIXTY_KANSHI = Array.from({ length: 60 }, (_, index) => ({
  index,
  stemIndex: index % 10,
  branchIndex: index % 12,
  stem: STEMS[index % 10],
  branch: BRANCHES[index % 12],
  label: `${STEMS[index % 10]}${BRANCHES[index % 12]}`,
}));

export function normalizeMod(value, mod) {
  return ((value % mod) + mod) % mod;
}

export function getKanshi(index) {
  return SIXTY_KANSHI[normalizeMod(index, 60)];
}

export function getStemIndex(stem) {
  return STEMS.indexOf(stem);
}

export function getBranchIndex(branch) {
  return BRANCHES.indexOf(branch);
}

export function getTenGod(dayStemIndex, targetStemIndex) {
  const samePolarity = dayStemIndex % 2 === targetStemIndex % 2;
  const dayElement = Math.floor(dayStemIndex / 2);
  const targetElement = Math.floor(targetStemIndex / 2);
  const relation = normalizeMod(targetElement - dayElement, 5);

  if (relation === 0) return samePolarity ? "比肩" : "劫財";
  if (relation === 1) return samePolarity ? "食神" : "傷官";
  if (relation === 2) return samePolarity ? "偏財" : "正財";
  if (relation === 3) return samePolarity ? "偏官" : "正官";
  return samePolarity ? "偏印" : "印綬";
}

const TWELVE_STAGE_START = {
  甲: { branch: "亥", direction: 1 },
  乙: { branch: "午", direction: -1 },
  丙: { branch: "寅", direction: 1 },
  丁: { branch: "酉", direction: -1 },
  戊: { branch: "寅", direction: 1 },
  己: { branch: "酉", direction: -1 },
  庚: { branch: "巳", direction: 1 },
  辛: { branch: "子", direction: -1 },
  壬: { branch: "申", direction: 1 },
  癸: { branch: "卯", direction: -1 },
};

export function getTwelveStage(dayStem, branch) {
  const start = TWELVE_STAGE_START[dayStem];
  const startIndex = getBranchIndex(start.branch);
  const branchIndex = getBranchIndex(branch);
  const offset = normalizeMod((branchIndex - startIndex) * start.direction, 12);
  return TWELVE_STAGES[offset];
}

export function getVoidBranches(dayKanshiIndex) {
  const groups = [
    ["戌", "亥"],
    ["申", "酉"],
    ["午", "未"],
    ["辰", "巳"],
    ["寅", "卯"],
    ["子", "丑"],
  ];
  return groups[Math.floor(normalizeMod(dayKanshiIndex, 60) / 10)];
}
