import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { calculateChart } from "../src/engine/chart.js";
import { calculateMajorLuck } from "../src/engine/luck.js";
import {
  getKurokawaHiddenStem,
  getKurokawaHourPillar,
  getKurokawaLuckDirection,
  getKurokawaMajorLuckStart,
  getKurokawaVoidBranches,
  getSetsuiriDayInfo,
} from "../src/engine/kurokawa.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected=${expected}, actual=${actual}`);
}

function assertArrayEqual(actual, expected, message) {
  if (actual.join(",") !== expected.join(",")) {
    throw new Error(`${message}: expected=${expected.join(",")}, actual=${actual.join(",")}`);
  }
}

assertEqual(getKurokawaHiddenStem("亥", 1), "戊", "hidden stem 亥 day 1");
assertEqual(getKurokawaHiddenStem("午", 21), "丁", "hidden stem 午 day 21");
assertEqual(getKurokawaHiddenStem("未", 13), "己", "hidden stem 未 day 13");
assertEqual(getKurokawaHiddenStem("辰", 13), "戊", "hidden stem 辰 day 13");
assertEqual(getKurokawaHiddenStem("丑", 13), "己", "hidden stem 丑 day 13");

assertEqual(getKurokawaHourPillar("甲", 23).label, "甲子", "hour pillar 甲 23");
assertEqual(getKurokawaHourPillar("丙", 9).label, "癸巳", "hour pillar 丙 9");
assertEqual(getKurokawaHourPillar("癸", 17).label, "辛酉", "hour pillar 癸 17");

assertArrayEqual(getKurokawaVoidBranches("甲寅"), ["子", "丑"], "void 甲寅");
assertArrayEqual(getKurokawaVoidBranches("癸酉"), ["戌", "亥"], "void 癸酉");

const july10 = getSetsuiriDayInfo(setsuiri, new Date(1998, 6, 10, 12, 0, 0, 0));
assertEqual(july10.dayNumber, 3, "1998-07-10 should be 3rd day from setsuiri");

const july5 = getSetsuiriDayInfo(setsuiri, new Date(1998, 6, 5, 12, 0, 0, 0));
assertEqual(july5.dayNumber, 29, "1998-07-05 should be previous month 29th day from setsuiri");

const july7After = getSetsuiriDayInfo(setsuiri, new Date(1998, 6, 7, 16, 30, 0, 0));
assertEqual(july7After.dayNumber, 1, "1998-07-07 after setsuiri should count 0 as 1");

const forward = getKurokawaLuckDirection("陽", "male");
const reverse = getKurokawaLuckDirection("陰", "male");
assertEqual(forward.label, "順運", "yang male should be forward");
assertEqual(reverse.label, "逆運", "yin male should be reverse");
assertEqual(getKurokawaMajorLuckStart(17, forward, july10.boundary).age, 5, "forward 17th day start age");
assertEqual(getKurokawaMajorLuckStart(30, forward, july10.boundary).age, 1, "forward 30th day start age");
assertEqual(getKurokawaMajorLuckStart(31, forward, july10.boundary).age, 1, "forward 31st day start age");
assertEqual(getKurokawaMajorLuckStart(17, reverse, july10.boundary).age, 6, "reverse 17th day start age");

const chart = calculateChart(
  {
    year: 1998,
    month: 7,
    day: 10,
    hour: 12,
    minute: 0,
    unknownTime: true,
    sex: "male",
    currentYear: 2026,
  },
  setsuiri,
);
const majorLuck = calculateMajorLuck(chart, setsuiri, 2026);

assertEqual(chart.setsuiriDayInfo.dayNumber, 3, "chart should expose kurokawa day number");
assertEqual(chart.pillarMap.day.tenGod, "", "day stem ten god should be blank in kurokawa method");
assertEqual(majorLuck.start.formula, "(30 - 節入日より何日目) ÷ 3", "1998 male year stem is forward formula");

console.log("kurokawa tests passed");
