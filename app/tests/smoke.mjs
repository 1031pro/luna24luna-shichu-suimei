import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { calculateChart } from "../src/engine/chart.js";
import { calculateCompatibility } from "../src/engine/compatibility.js";
import { calculateAnnualLuck, calculateDailyLuck, calculateMajorLuck, calculateMonthlyLuck } from "../src/engine/luck.js";

const input = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  unknownTime: true,
  sex: "male",
};

const chart = calculateChart(input, setsuiri);
const majorLuck = calculateMajorLuck(chart, setsuiri, 2026);
const annualLuck = calculateAnnualLuck(chart, 2026, 100);
const monthlyLuck = calculateMonthlyLuck(chart, 2026, 6, 12);
const dailyLuck = calculateDailyLuck(chart, 2026, 7);

if (chart.pillars.length !== 3) throw new Error("unknownTime should hide the time pillar");
if (majorLuck.rows.length !== 10) throw new Error("major luck rows should be 10");
if (annualLuck.length !== 101) throw new Error("annual luck rows should be 101");
if (annualLuck[0].age !== 0 || annualLuck.at(-1).age !== 100) {
  throw new Error("annual luck should cover ages 0 to 100");
}
if (monthlyLuck.length !== 12 || monthlyLuck[0].pillar.label !== "甲午") {
  throw new Error("monthly luck should cover 12 months from the selected month");
}
if (dailyLuck.length !== 31 || dailyLuck[0].pillar.label !== "丙子") {
  throw new Error("daily luck should cover every day in the selected month");
}
if (
  !majorLuck.rows[0].pillar.twelveStage ||
  !annualLuck[0].pillar.twelveStage ||
  !monthlyLuck[0].pillar.twelveStage ||
  !dailyLuck[0].pillar.twelveStage
) {
  throw new Error("luck rows should include twelve stages");
}

const partnerChart = calculateChart({ ...input, year: 1992, month: 6, day: 15 }, setsuiri);
const compatibility = calculateCompatibility(chart, partnerChart);
if (compatibility.crossRelations.length !== 9) {
  throw new Error("compatibility should compare all year, month, and day pillar pairs");
}
if (!Array.isArray(compatibility.threeHarmonies) || !Array.isArray(compatibility.directionalCombinations)) {
  throw new Error("compatibility should include three-harmony and directional-combination checks");
}
if (compatibility.criteria.length !== 9 || compatibility.readings.length !== 8 || !compatibility.readings.every((item) => item.title && item.body)) {
  throw new Error("compatibility should include written readings for every key check");
}
if (compatibility.firstUseGod.season !== "冬" || compatibility.firstUseGod.dayStem !== "丙" || compatibility.firstUseGod.stems.join("") !== "甲") {
  throw new Error("compatibility should use the client-supplied seasonal use-god table");
}
if (!compatibility.criteria.some((item) => item.title === "相手に自己の調候用神")) {
  throw new Error("compatibility should show the seasonal use-god criterion");
}
if (compatibility.criteria.find((item) => item.title === "相手に自己の調候用神").status !== "双方になし") {
  throw new Error("compatibility should distinguish when neither partner has the other's use god");
}

const timedChart = calculateChart({ ...input, unknownTime: false, hour: 8, minute: 30 }, setsuiri);
const timedPartnerChart = calculateChart({ ...input, year: 1992, month: 6, day: 15, unknownTime: false, hour: 20, minute: 30 }, setsuiri);
const timedCompatibility = calculateCompatibility(timedChart, timedPartnerChart);
if (timedCompatibility.crossRelations.length !== 16) {
  throw new Error("compatibility should compare all four pillars when both birth times are known");
}

const directionalOverrides = {
  year: { stem: "甲", branch: "寅" },
  month: { stem: "己", branch: "卯" },
  day: { stem: "己", branch: "辰" },
};
const directionalChart = {
  ...chart,
  pillarMap: {
    ...chart.pillarMap,
    year: { ...chart.pillarMap.year, ...directionalOverrides.year },
    month: { ...chart.pillarMap.month, ...directionalOverrides.month },
    day: { ...chart.pillarMap.day, ...directionalOverrides.day },
  },
  pillars: chart.pillars.map((pillar) => ({ ...pillar, ...directionalOverrides[pillar.key] })),
};
const reverseStemPartner = {
  ...partnerChart,
  pillarMap: {
    ...partnerChart.pillarMap,
    day: { ...partnerChart.pillarMap.day, stem: "甲" },
  },
  pillars: partnerChart.pillars.map((pillar) => (pillar.key === "day" ? { ...pillar, stem: "甲" } : pillar)),
};
const directionalCompatibility = calculateCompatibility(directionalChart, reverseStemPartner);
if (!directionalCompatibility.dayStemCombination || directionalCompatibility.directionalCombinations.length !== 1 || directionalCompatibility.halfCombinations.length < 1) {
  throw new Error("compatibility should detect reversed stem combinations and directional combinations");
}

console.log(chart.pillars.map((pillar) => `${pillar.pillarLabel}:${pillar.stem}${pillar.branch}`).join(", "));
console.log(
  `majorLuck=${majorLuck.rows.length}, annualLuck=${annualLuck.length}, monthlyLuck=${monthlyLuck.length}, dailyLuck=${dailyLuck.length}`,
);
