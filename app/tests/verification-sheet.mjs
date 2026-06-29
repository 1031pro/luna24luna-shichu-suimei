import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { calculateChart } from "../src/engine/chart.js";
import { calculateAnnualLuck, calculateMajorLuck } from "../src/engine/luck.js";
import { buildVerificationSheetHtml } from "../src/report/verification-sheet.js";

const input = {
  year: 1998,
  month: 7,
  day: 10,
  hour: 12,
  minute: 0,
  unknownTime: false,
  sex: "female",
  currentYear: 2026,
};

const chart = calculateChart(input, setsuiri);
const majorLuck = calculateMajorLuck(chart, setsuiri, input.currentYear);
const annualLuck = calculateAnnualLuck(chart, input.currentYear, 100);
const html = buildVerificationSheetHtml({
  chart,
  majorLuck,
  annualLuck,
  customerName: "luna24luna",
});

function assertIncludes(value, message) {
  if (!html.includes(value)) throw new Error(`${message}: ${value}`);
}

assertIncludes("計算確認表", "title should be present");
assertIncludes("luna24luna 様", "customer name should be present");
assertIncludes("節入日より", "setsuiri field should be present");
assertIncludes("3日目生", "kurokawa day number should be present");
assertIncludes(majorLuck.direction.label, "luck direction should be present");
assertIncludes("空亡", "void field should be present");
assertIncludes("大運", "major luck table should be present");
assertIncludes("年運", "annual luck table should be present");
assertIncludes("2026年", "annual window should begin from current year");

console.log("verification sheet tests passed");
