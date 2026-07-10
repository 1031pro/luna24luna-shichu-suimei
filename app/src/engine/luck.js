import { getBranchIndex, getKanshi, getTenGod, getTwelveStage, normalizeMod, STEMS, YIN_YANG } from "../data/kanshi.js";
import { getAnnualPillar, getDayPillar } from "./chart.js";
import { getKurokawaLuckDirection, getKurokawaMajorLuckStart } from "./kurokawa.js";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const TEN_GOD_LUCK_TEXT = {
  比肩: "自分の意思を確認し、無理に周囲へ合わせすぎず主体的に動くと流れを使いやすい時期です。",
  劫財: "人との関わりや競争意識が強まりやすい時期です。協力と境界線の両方を意識すると安定します。",
  食神: "楽しさ、表現、育てることに向きやすい時期です。余裕を持って続けられる行動が成果につながります。",
  傷官: "感性や改善意識が鋭くなりやすい時期です。言葉が強くなりすぎないよう整えると力を活かせます。",
  偏財: "人脈、情報、現実的な展開が動きやすい時期です。軽やかに動きながら優先順位を絞ると良い流れです。",
  正財: "堅実さ、信用、積み上げがテーマになりやすい時期です。約束や管理を丁寧に扱うほど安定します。",
  偏官: "行動力と責任感が出やすい時期です。勢いだけで進めず、目的を明確にすると突破力を活かせます。",
  正官: "信頼、役割、社会的な評価に意識が向きやすい時期です。筋道を立てた行動が評価につながります。",
  偏印: "学び、発想、専門性に向きやすい時期です。考えすぎて止まらず、小さく試すことで形になります。",
  印綬: "知識、準備、支援を受けることがテーマになりやすい時期です。焦らず土台を整えると力が蓄えられます。",
};

function getLuckDirection(chart, sex) {
  return getKurokawaLuckDirection(chart.pillarMap.year.stemYinYang, sex);
}

function getMajorLuckStartAge(chart, _setsuiri, direction) {
  return getKurokawaMajorLuckStart(chart.setsuiriDayInfo.dayNumber, direction, chart.setsuiriDayInfo.boundary);
}

function enrichLuckPillar(pillar, dayStemIndex) {
  return {
    ...pillar,
    tenGod: getTenGod(dayStemIndex, pillar.stemIndex),
    twelveStage: getTwelveStage(STEMS[dayStemIndex], pillar.branch),
  };
}

function findKanshiIndex(stemIndex, branchIndex) {
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) return index;
  }
  throw new Error(`干支が成立しません: stem=${stemIndex}, branch=${branchIndex}`);
}

function getMonthlyPillar(year, month) {
  const yearStemIndex = getAnnualPillar(year).stemIndex;
  const branchIndex = normalizeMod(month, 12);
  const monthFromTiger = normalizeMod(branchIndex - getBranchIndex("寅"), 12);
  const tigerStemBase = [2, 4, 6, 8, 0][yearStemIndex % 5];
  const stemIndex = normalizeMod(tigerStemBase + monthFromTiger, 10);
  return getKanshi(findKanshiIndex(stemIndex, branchIndex));
}

function addLuckReading(row) {
  return {
    ...row,
    reading: TEN_GOD_LUCK_TEXT[row.pillar.tenGod] || "その時期の通変星を基準に、行動のテーマを確認すると流れをつかみやすくなります。",
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
        twelveStage: getTwelveStage(STEMS[dayStemIndex], pillar.branch),
        stemYinYang: YIN_YANG[pillar.stemIndex],
        stem: STEMS[pillar.stemIndex],
      },
      active: year === currentYear,
    };
  });
}

export function calculateMonthlyLuck(chart, startYear, startMonth, months = 12) {
  const dayStemIndex = chart.pillarMap.day.stemIndex;
  const today = new Date();

  return Array.from({ length: months }, (_, offset) => {
    const date = new Date(startYear, startMonth - 1 + offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const pillar = enrichLuckPillar(getMonthlyPillar(year, month), dayStemIndex);

    return addLuckReading({
      year,
      month,
      label: `${year}年${month}月`,
      pillar,
      active: year === today.getFullYear() && month === today.getMonth() + 1,
    });
  });
}

export function calculateDailyLuck(chart, year, month) {
  const dayStemIndex = chart.pillarMap.day.stemIndex;
  const today = new Date();
  const days = new Date(year, month, 0).getDate();

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    const pillar = enrichLuckPillar(getDayPillar(date), dayStemIndex);

    return addLuckReading({
      year,
      month,
      day,
      weekday: WEEKDAYS[date.getDay()],
      label: `${day}日`,
      pillar,
      active:
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate(),
    });
  });
}
